import { cn } from "@/lib/utils";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function StatCard({
  label,
  value,
  sub,
  accentClassName = "bg-primary",
}: {
  label: string;
  value: string | number;
  sub?: string;
  accentClassName?: string;
}) {
  return (
    <Card size="sm" className="relative overflow-hidden pt-1.5">
      <span className={cn("absolute inset-x-0 top-0 h-1.5", accentClassName)} />
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="font-sans text-2xl font-semibold tabular-nums text-foreground">
          {value}
        </CardTitle>
        {sub ? (
          <p className="text-xs text-muted-foreground">{sub}</p>
        ) : null}
      </CardHeader>
    </Card>
  );
}
