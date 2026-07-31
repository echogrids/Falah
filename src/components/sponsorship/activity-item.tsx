import { formatRelativeDate } from "@/lib/format-date";
import { formatRs } from "@/lib/format-currency";
import { TRANSACTION_TYPE_META, type SponsorshipTransaction } from "@/components/sponsorship/types";

export function ActivityItem({ transaction }: { transaction: SponsorshipTransaction }) {
  const meta = TRANSACTION_TYPE_META[transaction.type as keyof typeof TRANSACTION_TYPE_META];
  const Icon = meta?.icon;

  return (
    <li className="flex items-center gap-3 border-b border-border py-3 text-sm last:border-0">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        {Icon ? <Icon className="size-4" /> : null}
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="font-medium text-foreground">{meta?.label ?? transaction.type}</span>
        <span className="text-xs text-muted-foreground">
          {transaction.meals ?? 0} meals · {formatRelativeDate(transaction.created_at)}
        </span>
      </div>
      <span className="shrink-0 font-medium tabular-nums text-foreground">
        {formatRs(transaction.amount)}
      </span>
    </li>
  );
}
