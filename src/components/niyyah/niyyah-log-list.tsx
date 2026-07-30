import { formatDateTime } from "@/lib/format-date";

export type NiyyahLogRow = {
  id: string;
  count: number;
  logged_at: string;
};

export function NiyyahLogList({ rows }: { rows: NiyyahLogRow[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">Nothing logged yet.</p>;
  }

  return (
    <ul className="flex flex-col">
      {rows.map((row) => (
        <li
          key={row.id}
          className="flex items-center justify-between border-b border-border py-2.5 text-sm last:border-0"
        >
          <span className="text-muted-foreground" suppressHydrationWarning>
            {formatDateTime(row.logged_at)}
          </span>
          <span className="font-medium tabular-nums text-foreground">
            +{row.count.toLocaleString()}
          </span>
        </li>
      ))}
    </ul>
  );
}
