export function ProgressIndicator({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const pct = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/8 shadow-[var(--shadow-soft)] sm:p-5">
      <div className="flex items-center justify-between">
        <span className="font-heading text-base font-semibold text-foreground">
          Today&apos;s Salah
        </span>
        <span className="text-sm font-medium tabular-nums text-muted-foreground">
          {completed} / {total}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
