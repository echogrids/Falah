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
          className="flex items-center justify-between border-b border-border pb-2 text-sm last:border-0"
        >
          <span className="flex items-center gap-3">
            <span className="flex size-6 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
              {index + 1}
            </span>
            {entry.email}
          </span>
          <span className="font-medium">{entry.score}</span>
        </li>
      ))}
    </ol>
  );
}
