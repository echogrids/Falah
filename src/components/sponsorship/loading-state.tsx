export function LoadingState({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex animate-pulse flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="h-7 w-32 rounded-lg bg-muted" />
        <div className="h-4 w-56 rounded-lg bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-28 rounded-xl bg-muted" />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="h-16 rounded-2xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
