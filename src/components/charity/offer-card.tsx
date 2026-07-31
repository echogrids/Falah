import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format-currency";
import { formatDate } from "@/lib/format-date";
import { OFFER_STATUS_META } from "@/components/charity/types";

export type OfferListRow = {
  id: string;
  purpose: string | null;
  amount: number;
  paidTotal: number;
  status: string;
  createdAt: string;
};

export function OfferCard({ offer }: { offer: OfferListRow }) {
  const pending = Math.max(0, offer.amount - offer.paidTotal);
  const status = OFFER_STATUS_META[offer.status] ?? OFFER_STATUS_META.pending;

  return (
    <Link
      href={`/charity/offers/${offer.id}`}
      className="flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/8 shadow-[var(--shadow-soft)] transition-all duration-150 active:scale-[0.98] hover:shadow-[var(--shadow-lift)] sm:p-5"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-heading text-base font-semibold text-foreground">
            {offer.purpose ?? "Offer"}
          </p>
          <p className="text-xs text-muted-foreground" suppressHydrationWarning>
            Created {formatDate(offer.createdAt.slice(0, 10))}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
            status.className,
          )}
        >
          {status.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="flex flex-col gap-0.5 rounded-xl bg-muted/60 px-2.5 py-2">
          <span className="text-muted-foreground">Offered</span>
          <span className="font-medium tabular-nums text-foreground">
            {formatMoney(offer.amount)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-xl bg-muted/60 px-2.5 py-2">
          <span className="text-muted-foreground">Donated</span>
          <span className="font-medium tabular-nums text-foreground">
            {formatMoney(offer.paidTotal)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-xl bg-muted/60 px-2.5 py-2">
          <span className="text-muted-foreground">Pending</span>
          <span className="font-medium tabular-nums text-foreground">{formatMoney(pending)}</span>
        </div>
      </div>
    </Link>
  );
}
