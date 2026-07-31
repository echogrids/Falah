"use client";

import { useMemo, useState } from "react";
import { Landmark } from "lucide-react";
import {
  HistoryFilters,
  type HistoryTypeFilter,
} from "@/components/charity/history-filters";
import { HistoryItem } from "@/components/charity/history-item";
import { EmptyState } from "@/components/ui/empty-state";
import type { CharityActivityEvent } from "@/lib/charity-activity";

function startOfDay(iso: string) {
  const d = new Date(iso);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function groupByRecency(events: CharityActivityEvent[]) {
  const today = startOfDay(new Date().toISOString());
  const yesterday = today - 86_400_000;

  const groups: { label: string; rows: CharityActivityEvent[] }[] = [
    { label: "Today", rows: [] },
    { label: "Yesterday", rows: [] },
    { label: "Earlier", rows: [] },
  ];

  for (const event of events) {
    const day = startOfDay(event.date);
    if (day === today) groups[0].rows.push(event);
    else if (day === yesterday) groups[1].rows.push(event);
    else groups[2].rows.push(event);
  }

  return groups.filter((group) => group.rows.length > 0);
}

export function HistoryList({
  events,
  homeHref,
}: {
  events: CharityActivityEvent[];
  homeHref: string;
}) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<HistoryTypeFilter>("all");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return events.filter((event) => {
      if (type !== "all" && event.type !== type) return false;
      if (
        query &&
        !event.institutionName.toLowerCase().includes(query) &&
        !(event.purpose ?? "").toLowerCase().includes(query)
      ) {
        return false;
      }
      return true;
    });
  }, [events, search, type]);

  if (events.length === 0) {
    return (
      <EmptyState
        icon={Landmark}
        title="No activity yet"
        description="Institutions, offers, and donations you log will show up here."
        action={{ label: "Go to Sadaqah Home", href: homeHref }}
      />
    );
  }

  const groups = groupByRecency(filtered);

  return (
    <div className="flex flex-col gap-5">
      <HistoryFilters search={search} onSearchChange={setSearch} type={type} onTypeChange={setType} />

      {groups.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No activity matches your search.
        </p>
      ) : (
        groups.map((group) => (
          <div key={group.label} className="flex flex-col gap-1">
            <h2 className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {group.label}
            </h2>
            <ul className="flex flex-col rounded-2xl bg-card px-4 ring-1 ring-foreground/8 shadow-[var(--shadow-soft)]">
              {group.rows.map((event) => (
                <HistoryItem key={`${event.type}-${event.id}`} event={event} />
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
