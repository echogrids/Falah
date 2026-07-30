import { cn } from "@/lib/utils";

// No profile-photo storage in this app — initials are the only avatar we
// can derive, from whatever name/email string the caller already has.
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function UserAvatar({
  name,
  size = "default",
  className,
}: {
  name: string;
  size?: "default" | "lg";
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary/15 font-heading font-semibold text-primary",
        size === "lg" ? "size-14 text-lg" : "size-9 text-sm",
        className,
      )}
    >
      {getInitials(name)}
    </span>
  );
}
