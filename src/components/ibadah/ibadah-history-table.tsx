import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format-date";

export type IbadahHistoryDay = {
  prayerDay: string;
  onTime: number;
  late: number;
  qala: number;
  missed: number;
};

export function IbadahHistoryTable({
  days,
  dateHref,
}: {
  days: IbadahHistoryDay[];
  dateHref: (prayerDay: string) => string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Log</CardTitle>
      </CardHeader>
      <CardContent>
        {days.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing logged yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Date</th>
                  <th className="py-2 pr-3 font-medium">On Time</th>
                  <th className="py-2 pr-3 font-medium">Late</th>
                  <th className="py-2 pr-3 font-medium">Qala</th>
                  <th className="py-2 font-medium">Missed</th>
                </tr>
              </thead>
              <tbody>
                {days.map((day) => (
                  <tr key={day.prayerDay} className="border-b border-border last:border-0">
                    <td className="py-2 pr-3 whitespace-nowrap">
                      <Link
                        href={dateHref(day.prayerDay)}
                        className="text-foreground underline-offset-4 hover:underline"
                      >
                        {formatDate(day.prayerDay)}
                      </Link>
                    </td>
                    <td className="py-2 pr-3 font-medium tabular-nums">{day.onTime}</td>
                    <td className="py-2 pr-3 tabular-nums text-muted-foreground">{day.late}</td>
                    <td className="py-2 pr-3 tabular-nums text-muted-foreground">{day.qala}</td>
                    <td className="py-2 tabular-nums text-destructive">{day.missed}</td>
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
