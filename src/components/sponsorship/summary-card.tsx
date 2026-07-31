import type { LucideIcon } from "lucide-react";
import { AlertTriangle, UtensilsCrossed } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatMoney } from "@/lib/format-currency";
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
              {formatMoney(amount)}
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
        {progress !== undefined ? <Progress value={progress} className="mt-1" /> : null}
      </CardHeader>
    </Card>
  );
}
