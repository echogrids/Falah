import { cn } from "@/lib/utils";
import { MANDATORY_PRAYERS } from "@/lib/ibadah/constants";

const statusStyles: Record<string, string> = {
  on_time: "bg-primary border-primary",
  late: "bg-accent border-accent",
  qala: "bg-gold border-gold",
  missed: "bg-transparent border-destructive",
};

export function PrayerBeads({
  statuses = {},
}: {
  statuses?: Record<string, string>;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      {MANDATORY_PRAYERS.map((prayer, index) => {
        const status = statuses[prayer.key];
        return (
          <div
            key={prayer.key}
            className="flex flex-1 flex-col items-center gap-2"
          >
            <div className="flex w-full items-center">
              <span
                className={
                  index === 0
                    ? "invisible h-px flex-1"
                    : "h-px flex-1 bg-border"
                }
              />
              <span
                className={cn(
                  "size-3.5 shrink-0 rounded-full border-2 bg-card",
                  status && statusStyles[status],
                  !status && "border-border",
                )}
              />
              <span
                className={
                  index === MANDATORY_PRAYERS.length - 1
                    ? "invisible h-px flex-1"
                    : "h-px flex-1 bg-border"
                }
              />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs font-medium text-foreground">
                {prayer.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {prayer.arabic}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
