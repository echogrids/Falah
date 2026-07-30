import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MANDATORY_PRAYERS } from "@/lib/ibadah/constants";
import { PRAYER_VISUALS } from "@/lib/ibadah/prayer-visuals";

export function TodaysProgress({
  statuses,
}: {
  statuses: Record<string, string | undefined>;
}) {
  const currentKey = MANDATORY_PRAYERS.find((prayer) => !statuses[prayer.key])?.key;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start justify-between gap-1.5 sm:gap-2">
          {MANDATORY_PRAYERS.map((prayer) => {
            const status = statuses[prayer.key];
            const completed = Boolean(status) && status !== "missed";
            const missed = status === "missed";
            const isCurrent = !status && prayer.key === currentKey;
            const visual = PRAYER_VISUALS[prayer.key];
            const Icon = visual?.icon;

            return (
              <div
                key={prayer.key}
                className="flex flex-1 flex-col items-center gap-1.5"
              >
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 sm:size-11",
                    completed && "border-primary bg-primary text-primary-foreground",
                    missed && "border-destructive/30 bg-destructive/10 text-destructive",
                    isCurrent &&
                      "scale-110 border-primary bg-primary/10 text-primary ring-4 ring-primary/15",
                    !completed &&
                      !missed &&
                      !isCurrent &&
                      "border-border bg-muted text-muted-foreground",
                  )}
                >
                  {completed ? (
                    <Check className="size-4.5" strokeWidth={2.5} />
                  ) : Icon ? (
                    <Icon className="size-4.5" />
                  ) : null}
                </span>
                <span className="text-[11px] font-medium text-muted-foreground">
                  {prayer.label}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
