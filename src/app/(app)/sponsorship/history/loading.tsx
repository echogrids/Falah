export default function Loading() {
  return (
    <div className="flex animate-pulse flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="h-4 w-16 rounded-lg bg-muted" />
        <div className="h-7 w-28 rounded-lg bg-muted" />
      </div>
      <div className="h-10 rounded-xl bg-muted" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-14 rounded-2xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
