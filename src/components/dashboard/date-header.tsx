"use client";

// Client-side so Intl picks up the visitor's own locale/timezone rather
// than the server's — closest we can get to "their location" without
// asking for geolocation permission.
export function DateHeader() {
  const now = new Date();
  const gregorian = now.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const hijri = new Intl.DateTimeFormat(undefined, {
    calendar: "islamic",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);

  return (
    <span
      className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm font-medium text-primary-foreground/70"
      suppressHydrationWarning
    >
      <span className="font-arabic">{hijri}</span>
      <span aria-hidden="true">·</span>
      <span>{gregorian}</span>
    </span>
  );
}
