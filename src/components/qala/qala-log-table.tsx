import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MANDATORY_PRAYERS } from "@/lib/ibadah/constants";
import { formatDateTime } from "@/lib/format-date";

const LABEL_BY_PRAYER = new Map<string, string>(
  MANDATORY_PRAYERS.map((p) => [p.key, p.label]),
);

export type QalaLogRow = {
  id: string;
  prayer: string;
  count: number;
  remarks: string | null;
  created_at: string;
};

export function QalaLogTable({ rows }: { rows: QalaLogRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Log</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing logged yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Date</th>
                  <th className="py-2 pr-3 font-medium">Prayer</th>
                  <th className="py-2 pr-3 font-medium">Entered</th>
                  <th className="py-2 font-medium">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-border last:border-0">
                    <td className="py-2 pr-3 whitespace-nowrap text-muted-foreground" suppressHydrationWarning>
                      {formatDateTime(row.created_at)}
                    </td>
                    <td className="py-2 pr-3">{LABEL_BY_PRAYER.get(row.prayer) ?? row.prayer}</td>
                    <td className="py-2 pr-3 font-medium tabular-nums">{row.count}</td>
                    <td className="py-2 text-muted-foreground">{row.remarks ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
