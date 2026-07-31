import { formatDateTime } from "@/lib/format-date";
import { formatMoney } from "@/lib/format-currency";
import { ACTIVITY_TYPE_META } from "@/components/charity/types";
import type { CharityActivityEvent } from "@/lib/charity-activity";

export function HistoryItem({ event }: { event: CharityActivityEvent }) {
  const meta = ACTIVITY_TYPE_META[event.type];
  const Icon = meta.icon;

  return (
    <li className="flex items-start gap-3 border-b border-border py-3 text-sm last:border-0">
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-foreground">{meta.label}</span>
          {event.amount !== null ? (
            <span className="shrink-0 font-medium tabular-nums text-foreground">
              {formatMoney(event.amount)}
            </span>
          ) : null}
        </div>
        <span className="truncate text-xs text-muted-foreground" suppressHydrationWarning>
          {event.institutionName}
          {event.purpose ? ` · ${event.purpose}` : ""} · {formatDateTime(event.date)}
        </span>
      </div>
    </li>
  );
}
