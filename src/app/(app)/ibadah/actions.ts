"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity-log";
import {
  salahScore,
  additionalWorshipScore,
  dailyTrackerScore,
  type ScoringSettings,
  type PrayerStatus,
  type Congregation,
  type PrayerLocation,
  type AdditionalWorshipType,
} from "@/lib/ibadah/scoring";

const MANDATORY_PRAYERS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
const ADDITIONAL_WORSHIP: AdditionalWorshipType[] = [
  "dhuha",
  "tahajjud",
  "witr",
];

export type SaveIbadahDayState = {
  error: string | null;
};

function nonNegativeInt(value: FormDataEntryValue | null): number {
  const parsed = value ? Number(value) : 0;
  return Number.isFinite(parsed) ? Math.max(0, Math.trunc(parsed)) : 0;
}

export async function saveIbadahDay(
  _prevState: SaveIbadahDayState,
  formData: FormData,
): Promise<SaveIbadahDayState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const prayerDay = formData.get("prayer_day");
  if (typeof prayerDay !== "string" || !prayerDay) {
    return { error: "A date is required." };
  }

  const memberId = (formData.get("member_id") as string) || user.id;

  const { data: settings, error: settingsError } = await supabase
    .from("scoring_settings")
    .select("*")
    .single();

  if (settingsError || !settings) {
    return { error: "Could not load scoring settings." };
  }

  const scoring = settings as ScoringSettings;

  const prayerRows = MANDATORY_PRAYERS.map((prayer) => {
    const status = formData.get(`${prayer}_status`) as PrayerStatus | null;
    if (!status) return null;

    const congregation =
      (formData.get(`${prayer}_congregation`) as Congregation | null) || null;
    const location =
      (formData.get(`${prayer}_location`) as PrayerLocation | null) || null;

    return {
      member_id: memberId,
      prayer_day: prayerDay,
      prayer,
      status,
      congregation,
      location,
      score: salahScore(status, congregation, location, scoring),
      created_by: user.id,
      updated_by: user.id,
    };
  }).filter((row) => row !== null);

  const worshipRows = ADDITIONAL_WORSHIP.filter((type) =>
    formData.get(`worship_${type}`),
  ).map((type) => {
    const rakatCount = formData.get(`worship_${type}_rakat`);
    return {
      member_id: memberId,
      prayer_day: prayerDay,
      worship_type: type,
      rakat_count: rakatCount ? nonNegativeInt(rakatCount) : null,
      score: additionalWorshipScore(type, scoring),
      created_by: user.id,
      updated_by: user.id,
    };
  });

  const dailyTracker = {
    member_id: memberId,
    prayer_day: prayerDay,
    dhikr_count: nonNegativeInt(formData.get("dhikr_count")),
    swalath_count: nonNegativeInt(formData.get("swalath_count")),
    quran_pages: nonNegativeInt(formData.get("quran_pages")),
    fasting_type: (formData.get("fasting_type") as string) || null,
    created_by: user.id,
    updated_by: user.id,
  };

  const results = await Promise.all([
    prayerRows.length > 0
      ? supabase
          .from("prayer_entries")
          .upsert(prayerRows, { onConflict: "member_id,prayer_day,prayer" })
      : Promise.resolve({ error: null }),
    supabase
      .from("additional_worship_entries")
      .delete()
      .eq("member_id", memberId)
      .eq("prayer_day", prayerDay),
    supabase
      .from("daily_trackers")
      .upsert(
        {
          ...dailyTracker,
          score: dailyTrackerScore(dailyTracker, scoring),
        },
        { onConflict: "member_id,prayer_day" },
      ),
  ]);

  const upsertError = results.find((result) => result.error)?.error;
  if (upsertError) {
    return { error: upsertError.message };
  }

  if (worshipRows.length > 0) {
    const { error: worshipError } = await supabase
      .from("additional_worship_entries")
      .insert(worshipRows);
    if (worshipError) {
      return { error: worshipError.message };
    }
  }

  await logActivity(supabase, {
    actorId: user.id,
    action: "save_ibadah_day",
    targetType: "ibadah_entry",
    targetId: memberId,
    details: { prayer_day: prayerDay },
  });

  revalidatePath("/ibadah");
  return { error: null };
}
