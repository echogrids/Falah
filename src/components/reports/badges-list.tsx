import { cn } from "@/lib/utils";
import type { Badge } from "@/lib/reports/badges";

export function BadgesList({ badges }: { badges: Badge[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {badges.map((badge) => (
        <div
          key={badge.key}
          className={cn(
            "flex flex-col gap-1 rounded-2xl border p-4",
            badge.earned
              ? "border-gold bg-gold/10"
              : "border-border opacity-60",
          )}
        >
          <span className="font-heading font-semibold text-foreground">
            {badge.label}
          </span>
          <span className="text-xs text-muted-foreground">
            {badge.description}
          </span>
          <span className="mt-1 text-sm font-medium">
            {badge.earned ? "Earned" : `${badge.value}`}
          </span>
        </div>
      ))}
    </div>
  );
}
