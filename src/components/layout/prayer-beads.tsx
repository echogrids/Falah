const prayers = [
  { key: "fajr", label: "Fajr", arabic: "الفجر" },
  { key: "dhuhr", label: "Dhuhr", arabic: "الظهر" },
  { key: "asr", label: "Asr", arabic: "العصر" },
  { key: "maghrib", label: "Maghrib", arabic: "المغرب" },
  { key: "isha", label: "Isha", arabic: "العشاء" },
];

export function PrayerBeads() {
  return (
    <div className="flex items-start justify-between gap-2">
      {prayers.map((prayer, index) => (
        <div key={prayer.key} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex w-full items-center">
            <span
              className={
                index === 0
                  ? "invisible h-px flex-1"
                  : "h-px flex-1 bg-border"
              }
            />
            <span className="size-3.5 shrink-0 rounded-full border-2 border-border bg-card" />
            <span
              className={
                index === prayers.length - 1
                  ? "invisible h-px flex-1"
                  : "h-px flex-1 bg-border"
              }
            />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs font-medium text-foreground">
              {prayer.label}
            </span>
            <span className="font-arabic text-xs text-muted-foreground">
              {prayer.arabic}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
