import type { SupabaseClient } from "@supabase/supabase-js";

export type DailyTotal = { date: string; score: number };

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function getDailyTotals(
  supabase: SupabaseClient,
  memberId: string,
  days: number,
): Promise<DailyTotal[]> {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));
  const startIso = isoDate(start);
  const endIso = isoDate(end);

  const [prayerEntries, worshipEntries, trackers] = await Promise.all([
    supabase
      .from("prayer_entries")
      .select("prayer_day, score")
      .eq("member_id", memberId)
      .gte("prayer_day", startIso)
      .lte("prayer_day", endIso),
    supabase
      .from("additional_worship_entries")
      .select("prayer_day, score")
      .eq("member_id", memberId)
      .gte("prayer_day", startIso)
      .lte("prayer_day", endIso),
    supabase
      .from("daily_trackers")
      .select("prayer_day, score")
      .eq("member_id", memberId)
      .gte("prayer_day", startIso)
      .lte("prayer_day", endIso),
  ]);

  const totals = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const day = new Date(start);
    day.setDate(day.getDate() + i);
    totals.set(isoDate(day), 0);
  }

  for (const rows of [
    prayerEntries.data,
    worshipEntries.data,
    trackers.data,
  ]) {
    for (const row of rows ?? []) {
      if (!totals.has(row.prayer_day)) continue;
      totals.set(
        row.prayer_day,
        (totals.get(row.prayer_day) ?? 0) + (row.score ?? 0),
      );
    }
  }

  return Array.from(totals.entries()).map(([date, score]) => ({
    date,
    score,
  }));
}
