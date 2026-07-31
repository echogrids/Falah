"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const TYPE_FILTERS = [
  { value: "all", label: "All" },
  { value: "intended", label: "Intended" },
  { value: "donated", label: "Donated" },
] as const;

export type HistoryTypeFilter = (typeof TYPE_FILTERS)[number]["value"];

export function HistoryFilters({
  search,
  onSearchChange,
  type,
  onTypeChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  type: HistoryTypeFilter;
  onTypeChange: (value: HistoryTypeFilter) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search notes..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="pl-9"
          aria-label="Search history"
        />
      </div>
      <div className="flex gap-2">
        {TYPE_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => onTypeChange(filter.value)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150",
              type === filter.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-muted",
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}
