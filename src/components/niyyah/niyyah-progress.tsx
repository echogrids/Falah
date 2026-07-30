export function NiyyahProgress({
  current,
  target,
  size = "default",
}: {
  current: number;
  target: number;
  size?: "default" | "sm";
}) {
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className={
          size === "sm"
            ? "h-1.5 w-full overflow-hidden rounded-full bg-secondary"
            : "h-2 w-full overflow-hidden rounded-full bg-secondary"
        }
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="tabular-nums">
          {current.toLocaleString()} / {target.toLocaleString()}
        </span>
        <span className="tabular-nums">{pct}%</span>
      </div>
    </div>
  );
}
