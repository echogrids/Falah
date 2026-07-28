import Link from "next/link";
import { cn } from "@/lib/utils";

export function StudentProgressCard({
  email,
  todayCompleted,
  todayTotal,
  weeklyScore,
  memberId,
}: {
  email: string;
  todayCompleted: number;
  todayTotal: number;
  weeklyScore: number;
  memberId: string;
}) {
  const pct = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

  return (
    <Link
      href={`/ibadah?student=${memberId}`}
      className="flex flex-col gap-2 rounded-xl border border-border p-4 transition-colors hover:bg-secondary/50"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 truncate text-sm font-medium text-foreground">
          {email}
        </span>
        <span className="shrink-0 text-xs text-muted-foreground">
          {weeklyScore} pts / 7d
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            "h-full rounded-full",
            pct >= 100 ? "bg-primary" : "bg-accent",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground">
        {todayCompleted} of {todayTotal} Salah logged today
      </span>
    </Link>
  );
}
