import type { SupabaseClient } from "@supabase/supabase-js";

const MANDATORY_PRAYER_KEYS = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
const LOOKBACK_DAYS = 30;
const CONSISTENCY_MIN_ENTRIES = 20;

export type Badge = {
  key: string;
  label: string;
  description: string;
  earned: boolean;
  value: number;
};

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function getBadges(
  supabase: SupabaseClient,
  memberId: string,
): Promise<Badge[]> {
  const today = new Date();
  const since = new Date(today);
  since.setDate(since.getDate() - (LOOKBACK_DAYS - 1));

  const { data: entries } = await supabase
    .from("prayer_entries")
    .select("prayer_day, prayer, status")
    .eq("member_id", memberId)
    .gte("prayer_day", isoDate(since))
    .lte("prayer_day", isoDate(today));

  const byDay = new Map<string, Map<string, string>>();
  for (const entry of entries ?? []) {
    if (!byDay.has(entry.prayer_day)) byDay.set(entry.prayer_day, new Map());
    byDay.get(entry.prayer_day)!.set(entry.prayer, entry.status);
  }

  let fajrStreak = 0;
  let fullDayStreak = 0;
  let counting = true;
  for (let i = 0; i < LOOKBACK_DAYS; i++) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    const prayers = byDay.get(isoDate(day));

    if (counting) {
      if (prayers?.get("fajr") === "on_time") {
        fajrStreak++;
      } else {
        counting = false;
      }
    }

    // i === fullDayStreak only holds while every day so far (from today
    // backward) has qualified; once one fails, it drifts apart permanently.
    if (
      i === fullDayStreak &&
      prayers &&
      MANDATORY_PRAYER_KEYS.every((key) => prayers.get(key) !== "missed") &&
      MANDATORY_PRAYER_KEYS.every((key) => prayers.has(key))
    ) {
      fullDayStreak++;
    }
  }

  const totalEntries = entries?.length ?? 0;
  const missedCount =
    entries?.filter((entry) => entry.status === "missed").length ?? 0;

  return [
    {
      key: "fajr_streak",
      label: "Fajr Streak",
      description: "Consecutive days Fajr was prayed on time.",
      earned: fajrStreak >= 7,
      value: fajrStreak,
    },
    {
      key: "full_day_streak",
      label: "Full Day Streak",
      description: "Consecutive days with all 5 Salah prayed, none missed.",
      earned: fullDayStreak >= 7,
      value: fullDayStreak,
    },
    {
      key: "consistency_30",
      label: "30-Day Consistency",
      description: "No missed Salah logged in the last 30 days.",
      earned: totalEntries >= CONSISTENCY_MIN_ENTRIES && missedCount === 0,
      value: missedCount,
    },
  ];
}
