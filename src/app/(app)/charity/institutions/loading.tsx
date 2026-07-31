export default function Loading() {
  return (
    <div className="flex animate-pulse flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="h-4 w-16 rounded-lg bg-muted" />
        <div className="h-7 w-40 rounded-lg bg-muted" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-32 rounded-2xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
