import Link from "next/link";
import { Landmark } from "lucide-react";
import { formatMoney } from "@/lib/format-currency";
import { formatRelativeDate } from "@/lib/format-date";

export type InstitutionListRow = {
  id: string;
  name: string;
  outstanding: number;
  donated: number;
  offerCount: number;
  lastDonationDate: string | null;
};

export function InstitutionListCard({ institution }: { institution: InstitutionListRow }) {
  const hasPending = institution.outstanding > 0;

  return (
    <Link
      href={`/charity/institutions/${institution.id}`}
      className="flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/8 shadow-[var(--shadow-soft)] transition-all duration-150 active:scale-[0.98] hover:shadow-[var(--shadow-lift)] sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Landmark className="size-4.5" />
          </span>
          <p className="truncate font-heading text-base font-semibold text-foreground">
            {institution.name}
          </p>
        </div>
        {hasPending ? (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
            Pending
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex flex-col gap-0.5 rounded-xl bg-muted/60 px-3 py-2">
          <span className="text-xs text-muted-foreground">Outstanding</span>
          <span className="font-medium tabular-nums text-foreground">
            {formatMoney(institution.outstanding)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-xl bg-muted/60 px-3 py-2">
          <span className="text-xs text-muted-foreground">Donated</span>
          <span className="font-medium tabular-nums text-foreground">
            {formatMoney(institution.donated)}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span>
          {institution.offerCount} {institution.offerCount === 1 ? "offer" : "offers"}
        </span>
        {institution.lastDonationDate ? (
          <span>Last donation {formatRelativeDate(institution.lastDonationDate)}</span>
        ) : (
          <span>No donations yet</span>
        )}
      </div>
    </Link>
  );
}
