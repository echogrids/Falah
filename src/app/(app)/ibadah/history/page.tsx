import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ModuleDisabledNotice } from "@/components/layout/module-disabled-notice";
import { StudentSelector } from "@/components/layout/student-selector";
import {
  IbadahHistoryTable,
  type IbadahHistoryDay,
} from "@/components/ibadah/ibadah-history-table";
import { getManageableStudents, resolveTargetMemberId } from "@/lib/proxy-entry";
import type { ModuleAccess } from "@/lib/module-access";

export default async function IbadahHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string }>;
}) {
  const { student } = await searchParams;
  const supabase = await createClient();
  // Middleware already validated this request's JWT against Supabase's
  // Auth server; read the session locally instead of re-validating.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, module_access")
    .eq("id", user?.id)
    .single();

  if (!(profile?.module_access as ModuleAccess | undefined)?.ibadah) {
    return <ModuleDisabledNotice title="Munājāh" />;
  }

  const students = await getManageableStudents(supabase, user!.id, profile?.role ?? "member");
  const memberId = resolveTargetMemberId(student, user!.id, students);

  const { data: entries } = await supabase
    .from("prayer_entries")
    .select("prayer_day, status")
    .eq("member_id", memberId)
    .order("prayer_day", { ascending: false })
    .limit(300);

  const dayMap = new Map<string, IbadahHistoryDay>();
  for (const entry of entries ?? []) {
    const day =
      dayMap.get(entry.prayer_day) ??
      { prayerDay: entry.prayer_day, onTime: 0, late: 0, qala: 0, missed: 0 };
    if (entry.status === "on_time") day.onTime += 1;
    else if (entry.status === "late") day.late += 1;
    else if (entry.status === "qala") day.qala += 1;
    else if (entry.status === "missed") day.missed += 1;
    dayMap.set(entry.prayer_day, day);
  }

  const days = Array.from(dayMap.values())
    .sort((a, b) => (a.prayerDay < b.prayerDay ? 1 : -1))
    .slice(0, 60);

  const studentQS = memberId !== user!.id ? `?student=${memberId}` : "";
  const homeHref = `/ibadah${studentQS}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href={homeHref}
          className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Munājāh
        </Link>
        <h1 className="font-heading text-2xl font-semibold text-foreground">History</h1>
      </div>

      <StudentSelector
        students={students}
        selectedId={memberId === user!.id ? "self" : memberId}
        selfLabel="Myself"
      />

      <IbadahHistoryTable
        days={days}
        dateHref={(prayerDay) => `/ibadah?date=${prayerDay}${memberId !== user!.id ? `&student=${memberId}` : ""}`}
      />
    </div>
  );
}
