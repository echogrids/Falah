export const MANDATORY_PRAYERS = [
  { key: "fajr", label: "Fajr", arabic: "الفجر" },
  { key: "dhuhr", label: "Dhuhr", arabic: "الظهر" },
  { key: "asr", label: "Asr", arabic: "العصر" },
  { key: "maghrib", label: "Maghrib", arabic: "المغرب" },
  { key: "isha", label: "Isha", arabic: "العشاء" },
] as const;

export const ADDITIONAL_WORSHIP = [
  { key: "dhuha", label: "Dhuha", arabic: "الضحى" },
  { key: "tahajjud", label: "Tahajjud", arabic: "التهجد" },
  { key: "witr", label: "Witr", arabic: "الوتر" },
] as const;

export const PRAYER_STATUSES = [
  { value: "on_time", label: "On Time" },
  { value: "late", label: "Late" },
  { value: "qala", label: "Qala" },
  { value: "missed", label: "Missed" },
] as const;

export const CONGREGATION_OPTIONS = [
  { value: "alone", label: "Alone" },
  { value: "jamaah", label: "Jama'ah" },
] as const;

export const LOCATION_OPTIONS = [
  { value: "masjid", label: "Masjid" },
  { value: "home", label: "Home" },
  { value: "school", label: "School" },
  { value: "work", label: "Work" },
  { value: "travel", label: "Travel" },
  { value: "other", label: "Other" },
] as const;

export const FASTING_TYPE_OPTIONS = [
  { value: "ramadan", label: "Ramadan" },
  { value: "qada", label: "Qada (make-up)" },
  { value: "monday", label: "Monday" },
  { value: "thursday", label: "Thursday" },
  { value: "ashura", label: "Ashura" },
  { value: "arafah", label: "Arafah" },
  { value: "shawwal", label: "Six of Shawwal" },
  { value: "other", label: "Other" },
] as const;
