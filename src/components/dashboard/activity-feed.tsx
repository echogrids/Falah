export type ActivityRow = {
  id: string;
  actor_id: string;
  action: string;
  target_id: string | null;
  created_at: string;
};

export function ActivityFeed({
  rows,
  emailById,
}: {
  rows: ActivityRow[];
  emailById: Map<string, string>;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity yet.</p>;
  }

  return (
    <ul className="flex flex-col">
      {rows.map((row) => (
        <li
          key={row.id}
          className="flex flex-col gap-0.5 border-b border-border py-2 text-sm last:border-0"
        >
          <span>
            <span className="font-medium">
              {emailById.get(row.actor_id) ?? "Unknown"}
            </span>{" "}
            {row.action.replaceAll("_", " ")}
            {row.target_id ? (
              <>
                {" "}
                for{" "}
                <span className="font-medium">
                  {emailById.get(row.target_id) ?? "Unknown"}
                </span>
              </>
            ) : null}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(row.created_at).toLocaleString()}
          </span>
        </li>
      ))}
    </ul>
  );
}
