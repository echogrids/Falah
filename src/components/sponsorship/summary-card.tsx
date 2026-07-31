import type { LucideIcon } from "lucide-react";
import { AlertTriangle, UtensilsCrossed } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { formatRs } from "@/lib/format-currency";
import { cn } from "@/lib/utils";

export function SummaryCard({
  label,
  icon: Icon,
  amount,
  meals,
  alert = false,
  progress,
}: {
  label: string;
  icon: LucideIcon;
  amount?: number;
  meals: number;
  alert?: boolean;
  progress?: number;
}) {
  return (
    <Card
      className={cn(
        alert &&
          "border-2 border-destructive/40 bg-destructive/5 shadow-[0_0_0_1px_var(--destructive)_inset]",
      )}
    >
      <CardHeader>
        <p
          className={cn(
            "flex items-center gap-1.5 text-sm text-muted-foreground",
            alert && "text-destructive",
          )}
        >
          {alert ? <AlertTriangle className="size-3.5" /> : null}
          {label}
        </p>
        {amount !== undefined ? (
          <>
            <p
              className={cn(
                "flex items-center gap-1.5 font-sans text-xl font-medium tabular-nums text-foreground sm:text-2xl",
                alert && "text-destructive",
              )}
            >
              <Icon className="size-4.5 shrink-0" />
              {formatRs(amount)}
            </p>
            <p
              className={cn(
                "flex items-center gap-1 text-xs",
                alert ? "text-destructive/80" : "text-muted-foreground",
              )}
            >
              <UtensilsCrossed className="size-3" />
              {meals} meals
            </p>
          </>
        ) : (
          <p
            className={cn(
              "flex items-center gap-1.5 font-sans text-xl font-medium tabular-nums text-foreground sm:text-2xl",
              alert && "text-destructive",
            )}
          >
            <Icon className="size-4.5 shrink-0" />
            {meals} meals
          </p>
        )}
        {progress !== undefined ? (
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        ) : null}
      </CardHeader>
    </Card>
  );
}
