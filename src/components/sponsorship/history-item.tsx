import { formatDateTime } from "@/lib/format-date";
import { formatRs } from "@/lib/format-currency";
import { TRANSACTION_TYPE_META, type SponsorshipTransaction } from "@/components/sponsorship/types";

export function HistoryItem({ transaction }: { transaction: SponsorshipTransaction }) {
  const meta = TRANSACTION_TYPE_META[transaction.type as keyof typeof TRANSACTION_TYPE_META];
  const Icon = meta?.icon;

  return (
    <li className="flex items-start gap-3 border-b border-border py-3 text-sm last:border-0">
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        {Icon ? <Icon className="size-4" /> : null}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-foreground">{meta?.label ?? transaction.type}</span>
          <span className="shrink-0 font-medium tabular-nums text-foreground">
            {formatRs(transaction.amount)}
          </span>
        </div>
        <span className="text-xs text-muted-foreground" suppressHydrationWarning>
          {transaction.meals && transaction.unit_price
            ? `${transaction.meals} meals × ${formatRs(transaction.unit_price)}`
            : `${transaction.meals ?? 0} meals`}{" "}
          · {formatDateTime(transaction.created_at)}
        </span>
        {transaction.note ? (
          <span className="text-xs text-muted-foreground italic">{transaction.note}</span>
        ) : null}
      </div>
    </li>
  );
}
