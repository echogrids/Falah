"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { FASTING_TYPE_OPTIONS } from "@/lib/ibadah/constants";

export type SettingsActionState = {
  error: string | null;
};

const initialState: SettingsActionState = { error: null };
export { initialState as settingsInitialState };

const BASE_POINT_FIELDS = [
  "on_time_points",
  "late_points",
  "qala_points",
  "missed_points",
  "jamaah_bonus_points",
  "masjid_bonus_points",
  "dhuha_points",
  "tahajjud_points",
  "witr_points",
] as const;

const MILESTONE_CATEGORIES = [
  { field: "dhikr_milestones", prefix: "dhikr" },
  { field: "swalath_milestones", prefix: "swalath" },
  { field: "quran_milestones", prefix: "quran" },
] as const;

const MILESTONE_SLOTS = 3;

function num(formData: FormData, key: string): number {
  const value = formData.get(key);
  return value ? Number(value) : 0;
}

export async function updateScoringSettings(
  _prevState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in." };

  const update: Record<string, unknown> = { updated_by: user.id };

  for (const field of BASE_POINT_FIELDS) {
    update[field] = num(formData, field);
  }

  for (const category of MILESTONE_CATEGORIES) {
    const milestones = [];
    for (let i = 1; i <= MILESTONE_SLOTS; i++) {
      const threshold = num(formData, `${category.prefix}_threshold_${i}`);
      const points = num(formData, `${category.prefix}_points_${i}`);
      if (threshold > 0) milestones.push({ threshold, points });
    }
    milestones.sort((a, b) => a.threshold - b.threshold);
    update[category.field] = milestones;
  }

  const fastingPoints: Record<string, number> = {};
  for (const option of FASTING_TYPE_OPTIONS) {
    const points = num(formData, `fasting_${option.value}`);
    if (points > 0) fastingPoints[option.value] = points;
  }
  update.fasting_points = fastingPoints;

  const { error } = await supabase
    .from("scoring_settings")
    .update(update)
    .eq("id", true);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { error: null };
}
