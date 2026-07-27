import type { LeaderboardEntry } from "@/lib/reports/leaderboard";

export function LeaderboardTable({ entries }: { entries: LeaderboardEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No scores logged yet.</p>
    );
  }

  return (
    <ol className="flex flex-col gap-2">
      {entries.map((entry, index) => (
        <li
          key={entry.memberId}
          className="flex items-center justify-between gap-2 border-b border-border py-2 text-sm last:border-0"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
              {index + 1}
            </span>
            <span className="truncate">{entry.email}</span>
          </span>
          <span className="shrink-0 font-medium">{entry.score}</span>
        </li>
      ))}
    </ol>
  );
}
