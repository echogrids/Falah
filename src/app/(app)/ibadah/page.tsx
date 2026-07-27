import { createClient } from "@/lib/supabase/server";
import { DateNav } from "@/components/ibadah/date-nav";
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
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const prayerDay = date ?? todayIso();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: prayerEntries }, { data: worshipEntries }, { data: tracker }] =
    await Promise.all([
      supabase
        .from("prayer_entries")
        .select("prayer, status, congregation, location")
        .eq("member_id", user?.id)
        .eq("prayer_day", prayerDay),
      supabase
        .from("additional_worship_entries")
        .select("worship_type, rakat_count")
        .eq("member_id", user?.id)
        .eq("prayer_day", prayerDay),
      supabase
        .from("daily_trackers")
        .select("dhikr_count, swalath_count, quran_pages, fasting_type")
        .eq("member_id", user?.id)
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
          Ibadah Tracker
        </h1>
        <p className="mt-1 text-muted-foreground">
          Log your prayers, worship, and daily practice.
        </p>
      </div>

      <DateNav date={prayerDay} />

      <IbadahDayForm
        prayerDay={prayerDay}
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
