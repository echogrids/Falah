import { formatRelativeDate } from "@/lib/format-date";
import { formatMoney } from "@/lib/format-currency";
import { ACTIVITY_TYPE_META } from "@/components/charity/types";
import type { CharityActivityEvent } from "@/lib/charity-activity";

export function ActivityItem({ event }: { event: CharityActivityEvent }) {
  const meta = ACTIVITY_TYPE_META[event.type];
  const Icon = meta.icon;

  return (
    <li className="flex items-center gap-3 border-b border-border py-3 text-sm last:border-0">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="font-medium text-foreground">{meta.label}</span>
        <span className="truncate text-xs text-muted-foreground">
          {event.institutionName} · {formatRelativeDate(event.date)}
        </span>
      </div>
      {event.amount !== null ? (
        <span className="shrink-0 font-medium tabular-nums text-foreground">
          {formatMoney(event.amount)}
        </span>
      ) : null}
    </li>
  );
}
