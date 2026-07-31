import type { LucideIcon } from "lucide-react";
import { AlertTriangle } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function SummaryCard({
  label,
  icon: Icon,
  value,
  sublabel,
  alert = false,
  progress,
}: {
  label: string;
  icon: LucideIcon;
  value: string;
  sublabel?: string;
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
        <p
          className={cn(
            "flex items-center gap-1.5 font-sans text-xl font-medium tabular-nums text-foreground sm:text-2xl",
            alert && "text-destructive",
          )}
        >
          <Icon className="size-4.5 shrink-0" />
          {value}
        </p>
        {sublabel ? (
          <p className={cn("text-xs", alert ? "text-destructive/80" : "text-muted-foreground")}>
            {sublabel}
          </p>
        ) : null}
        {progress !== undefined ? <Progress value={progress} className="mt-1" /> : null}
      </CardHeader>
    </Card>
  );
}
