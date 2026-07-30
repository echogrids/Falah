import Link from "next/link";
import { Check } from "lucide-react";
import { NiyyahProgress } from "@/components/niyyah/niyyah-progress";
import { formatDate } from "@/lib/format-date";
import { cn } from "@/lib/utils";

export type NiyyahListRow = {
  id: string;
  title: string;
  intention: string | null;
  target_count: number;
  current_count: number;
  deadline: string | null;
  status: string;
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function NiyyahCard({ niyyah }: { niyyah: NiyyahListRow }) {
  const remaining = Math.max(0, niyyah.target_count - niyyah.current_count);
  const isCompleted = niyyah.status === "completed";
  const deadlinePassed =
    !isCompleted && niyyah.deadline !== null && niyyah.deadline < todayIso();

  return (
    <Link
      href={`/niyyah/${niyyah.id}`}
      className="flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/8 shadow-[var(--shadow-soft)] transition-all duration-150 active:scale-[0.98] hover:shadow-[var(--shadow-lift)] sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-heading text-base font-semibold text-foreground">
            {niyyah.title}
          </p>
          {niyyah.intention ? (
            <p className="truncate text-sm text-muted-foreground">{niyyah.intention}</p>
          ) : null}
        </div>
        {isCompleted ? (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
            <Check className="size-3" />
            Completed
          </span>
        ) : null}
      </div>

      <NiyyahProgress current={niyyah.current_count} target={niyyah.target_count} />

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {!isCompleted ? <span>{remaining.toLocaleString()} remaining</span> : null}
        {niyyah.deadline ? (
          <span
            className={cn(
              deadlinePassed && "rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground",
            )}
          >
            {deadlinePassed ? "Past " : "By "}
            {formatDate(niyyah.deadline)}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
