"use client";

import { cn } from "@/lib/utils";
import { STATUS_VISUALS } from "@/lib/ibadah/chip-visuals";

export function StatusChip({
  status,
  label,
  selected,
  onSelect,
}: {
  status: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const visual = STATUS_VISUALS[status];
  const Icon = visual?.icon;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
      onClick={onSelect}
      className={cn(
        "flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl border-2 px-2 py-2.5 text-xs font-semibold transition-all duration-200 active:scale-95",
        selected
          ? cn("scale-[1.04]", visual?.selectedClassName)
          : visual?.idleClassName,
      )}
    >
      {Icon ? <Icon className="size-4.5" /> : null}
      {label}
    </button>
  );
}
