"use client";

import { useMemo, useState } from "react";
import { HeartHandshake } from "lucide-react";
import { HistoryFilters, type HistoryTypeFilter } from "@/components/sponsorship/history-filters";
import { HistoryItem } from "@/components/sponsorship/history-item";
import { EmptyState } from "@/components/sponsorship/empty-state";
import type { SponsorshipTransaction } from "@/components/sponsorship/types";

function startOfDay(iso: string) {
  const d = new Date(iso);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function groupByRecency(transactions: SponsorshipTransaction[]) {
  const today = startOfDay(new Date().toISOString());
  const yesterday = today - 86_400_000;

  const groups: { label: string; rows: SponsorshipTransaction[] }[] = [
    { label: "Today", rows: [] },
    { label: "Yesterday", rows: [] },
    { label: "Earlier", rows: [] },
  ];

  for (const transaction of transactions) {
    const day = startOfDay(transaction.created_at);
    if (day === today) groups[0].rows.push(transaction);
    else if (day === yesterday) groups[1].rows.push(transaction);
    else groups[2].rows.push(transaction);
  }

  return groups.filter((group) => group.rows.length > 0);
}

export function HistoryList({
  transactions,
  homeHref,
}: {
  transactions: SponsorshipTransaction[];
  homeHref: string;
}) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<HistoryTypeFilter>("all");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return transactions.filter((transaction) => {
      if (type !== "all" && transaction.type !== type) return false;
      if (query && !(transaction.note ?? "").toLowerCase().includes(query)) return false;
      return true;
    });
  }, [transactions, search, type]);

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={HeartHandshake}
        title="No transactions yet"
        description="Intentions and donations you log will show up here."
        action={{ label: "Go to Zād Home", href: homeHref }}
      />
    );
  }

  const groups = groupByRecency(filtered);

  return (
    <div className="flex flex-col gap-5">
      <HistoryFilters search={search} onSearchChange={setSearch} type={type} onTypeChange={setType} />

      {groups.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No transactions match your search.
        </p>
      ) : (
        groups.map((group) => (
          <div key={group.label} className="flex flex-col gap-1">
            <h2 className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {group.label}
            </h2>
            <ul className="flex flex-col rounded-2xl bg-card px-4 ring-1 ring-foreground/8 shadow-[var(--shadow-soft)]">
              {group.rows.map((transaction) => (
                <HistoryItem key={transaction.id} transaction={transaction} />
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
