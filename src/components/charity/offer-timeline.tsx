import { HandCoins, Receipt } from "lucide-react";
import { formatDateTime } from "@/lib/format-date";
import { formatMoney } from "@/lib/format-currency";

export type TimelineEntry =
  | { type: "created"; date: string }
  | { type: "donation"; id: string; date: string; amount: number; notes: string | null };

export function OfferTimeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="flex flex-col gap-4">
      {entries.map((entry, index) => {
        const isLast = index === entries.length - 1;
        const isCreated = entry.type === "created";
        return (
          <li key={isCreated ? "created" : entry.id} className="relative flex gap-3 pb-1">
            {!isLast ? (
              <span className="absolute top-8 left-4 h-[calc(100%-1rem)] w-px bg-border" />
            ) : null}
            <span
              className={
                "flex size-8 shrink-0 items-center justify-center rounded-full " +
                (isCreated ? "bg-gold/20 text-gold-foreground" : "bg-primary/15 text-primary")
              }
            >
              {isCreated ? <HandCoins className="size-4" /> : <Receipt className="size-4" />}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 pt-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">
                  {isCreated ? "Offer Created" : "Donation"}
                </span>
                {!isCreated ? (
                  <span className="shrink-0 text-sm font-medium tabular-nums text-foreground">
                    {formatMoney(entry.amount)}
                  </span>
                ) : null}
              </div>
              <span className="text-xs text-muted-foreground" suppressHydrationWarning>
                {formatDateTime(entry.date)}
              </span>
              {!isCreated && entry.notes ? (
                <span className="text-xs text-muted-foreground italic">{entry.notes}</span>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
