import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ModuleActionCard({
  href,
  label,
  description,
  icon: Icon,
  badgeClassName,
  iconClassName,
  statusBadge,
}: {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  badgeClassName: string;
  iconClassName: string;
  statusBadge?: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col items-start gap-3 rounded-2xl bg-card p-4 text-left ring-1 ring-foreground/8 shadow-[var(--shadow-soft)] transition-all duration-150 active:scale-[0.96] hover:shadow-[var(--shadow-lift)] sm:p-5"
    >
      {statusBadge ? (
        <span className="absolute right-3 top-3 rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-medium tabular-nums text-destructive">
          {statusBadge}
        </span>
      ) : null}
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-150 group-hover:scale-105",
          badgeClassName,
        )}
      >
        <Icon className={cn("size-5", iconClassName)} strokeWidth={2.25} />
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="font-heading text-base font-semibold text-foreground">
          {label}
        </span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </span>
    </Link>
  );
}
