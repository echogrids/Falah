export type PrayerStatus = "on_time" | "late" | "qala" | "missed";
export type Congregation = "alone" | "jamaah";
export type PrayerLocation =
  | "masjid"
  | "home"
  | "school"
  | "work"
  | "travel"
  | "other";
export type AdditionalWorshipType = "dhuha" | "tahajjud" | "witr";

export type ScoringMilestone = { threshold: number; points: number };

export type ScoringSettings = {
  on_time_points: number;
  late_points: number;
  qala_points: number;
  missed_points: number;
  jamaah_bonus_points: number;
  masjid_bonus_points: number;
  dhuha_points: number;
  tahajjud_points: number;
  witr_points: number;
  dhikr_milestones: ScoringMilestone[];
  swalath_milestones: ScoringMilestone[];
  quran_milestones: ScoringMilestone[];
  fasting_points: Record<string, number>;
};

export function salahScore(
  status: PrayerStatus,
  congregation: Congregation | null,
  location: PrayerLocation | null,
  settings: ScoringSettings,
): number {
  if (status === "missed") return settings.missed_points;

  const statusPoints: Record<Exclude<PrayerStatus, "missed">, number> = {
    on_time: settings.on_time_points,
    late: settings.late_points,
    qala: settings.qala_points,
  };

  let score = statusPoints[status];
  if (congregation === "jamaah") score += settings.jamaah_bonus_points;
  if (location === "masjid") score += settings.masjid_bonus_points;
  return score;
}

export function additionalWorshipScore(
  type: AdditionalWorshipType,
  settings: ScoringSettings,
): number {
  const points: Record<AdditionalWorshipType, number> = {
    dhuha: settings.dhuha_points,
    tahajjud: settings.tahajjud_points,
    witr: settings.witr_points,
  };
  return points[type];
}

function milestonePoints(count: number, milestones: ScoringMilestone[]): number {
  return milestones
    .filter((milestone) => count >= milestone.threshold)
    .reduce((sum, milestone) => sum + milestone.points, 0);
}

export function dailyTrackerScore(
  entry: {
    dhikr_count: number;
    swalath_count: number;
    quran_pages: number;
    fasting_type: string | null;
  },
  settings: ScoringSettings,
): number {
  const fastingPoints = entry.fasting_type
    ? (settings.fasting_points[entry.fasting_type] ?? 0)
    : 0;

  return (
    milestonePoints(entry.dhikr_count, settings.dhikr_milestones) +
    milestonePoints(entry.swalath_count, settings.swalath_milestones) +
    milestonePoints(entry.quran_pages, settings.quran_milestones) +
    fastingPoints
  );
}
