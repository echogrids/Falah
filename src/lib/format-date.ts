export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// For plain "YYYY-MM-DD" date columns (no time component). Building the
// Date from local year/month/day — rather than handing the string straight
// to `new Date()`, which parses it as UTC midnight — keeps the displayed
// day from shifting backward in negative-UTC-offset timezones.
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
