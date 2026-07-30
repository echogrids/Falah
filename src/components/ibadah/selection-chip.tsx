"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Generic single-select chip: a neutral, reusable building block for any
// "pick one of a few options" group (Congregation, Location, and future
// ones) — distinct from StatusChip, which owns the prayer-status color
// mapping itself.
export function SelectionChip({
  icon: Icon,
  label,
  selected,
  onSelect,
}: {
  icon: LucideIcon;
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
      onClick={onSelect}
      className={cn(
        "flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl border-2 px-2 py-2.5 text-xs font-medium transition-all duration-200 active:scale-95",
        selected
          ? "scale-[1.04] border-primary bg-primary text-primary-foreground shadow-md"
          : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-foreground",
      )}
    >
      <Icon className="size-4.5" />
      {label}
    </button>
  );
}
