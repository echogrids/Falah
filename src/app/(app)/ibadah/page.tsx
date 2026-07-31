import Link from "next/link";
import { History } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DateNav } from "@/components/ibadah/date-nav";
import { StudentSelector } from "@/components/layout/student-selector";
import { Button } from "@/components/ui/button";
import { getManageableStudents, resolveTargetMemberId } from "@/lib/proxy-entry";
import {
  IbadahDayForm,
  type PrayerEntryInitial,
  type WorshipInitial,
} from "@/components/ibadah/ibadah-day-form";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default async function IbadahPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; student?: string }>;
}) {
  const { date, student } = await searchParams;
  const prayerDay = date ?? todayIso();

  const supabase = await createClient();
  // Middleware already validated this request's JWT against Supabase's
  // Auth server; read the session locally instead of re-validating.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single();

  const students = await getManageableStudents(supabase, user!.id, profile?.role ?? "member");
  const memberId = resolveTargetMemberId(student, user!.id, students);

  const [{ data: prayerEntries }, { data: worshipEntries }, { data: tracker }] =
    await Promise.all([
      supabase
        .from("prayer_entries")
        .select("prayer, status, congregation, location")
        .eq("member_id", memberId)
        .eq("prayer_day", prayerDay),
      supabase
        .from("additional_worship_entries")
        .select("worship_type, rakat_count")
        .eq("member_id", memberId)
        .eq("prayer_day", prayerDay),
      supabase
        .from("daily_trackers")
        .select("dhikr_count, swalath_count, quran_pages, fasting_type")
        .eq("member_id", memberId)
        .eq("prayer_day", prayerDay)
        .maybeSingle(),
    ]);

  const prayerEntryMap: Record<string, PrayerEntryInitial> = {};
  for (const entry of prayerEntries ?? []) {
    prayerEntryMap[entry.prayer] = {
      status: entry.status,
      congregation: entry.congregation,
      location: entry.location,
    };
  }

  const worshipMap: Record<string, WorshipInitial> = {};
  for (const entry of worshipEntries ?? []) {
    worshipMap[entry.worship_type] = { rakat_count: entry.rakat_count };
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Munājāh
        </h1>
        <p className="mt-1 text-muted-foreground">
          Log prayers, worship, and daily practice.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <DateNav date={prayerDay} />
        <StudentSelector
          students={students}
          selectedId={memberId === user!.id ? "self" : memberId}
          selfLabel="Myself"
        />
        <Button variant="outline" size="sm" asChild>
          <Link href={`/ibadah/history${student ? `?student=${memberId}` : ""}`}>
            <History className="size-4" />
            History
          </Link>
        </Button>
      </div>

      <IbadahDayForm
        key={`${memberId}-${prayerDay}`}
        prayerDay={prayerDay}
        memberId={memberId}
        prayerEntries={prayerEntryMap}
        worship={worshipMap}
        dailyTracker={{
          dhikr_count: tracker?.dhikr_count ?? 0,
          swalath_count: tracker?.swalath_count ?? 0,
          quran_pages: tracker?.quran_pages ?? 0,
          fasting_type: tracker?.fasting_type ?? null,
        }}
      />
    </div>
  );
}
