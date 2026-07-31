"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MANDATORY_PRAYERS } from "@/lib/ibadah/constants";
import { PRAYER_VISUALS } from "@/lib/ibadah/prayer-visuals";
import { logQalaCompletions } from "@/app/(app)/qala/actions";
import { initialActionState } from "@/lib/action-state";

function PrayerTapTile({
  prayerKey,
  label,
  arabic,
  pending,
  count,
  onTap,
  onReset,
}: {
  prayerKey: string;
  label: string;
  arabic: string;
  pending: number;
  count: number;
  onTap: () => void;
  onReset: () => void;
}) {
  const visual = PRAYER_VISUALS[prayerKey];
  const Icon = visual?.icon;
  const disabled = pending === 0;

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={onTap}
        className={cn(
          "flex w-full flex-col items-center gap-2 rounded-2xl border-2 px-3 py-4 text-center transition-all duration-150 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50",
          count > 0
            ? "border-primary bg-primary/10 shadow-md"
            : "border-border bg-card hover:bg-muted",
        )}
      >
        {Icon ? (
          <span className={cn("flex size-9 items-center justify-center rounded-full", visual.className)}>
            <Icon className="size-4.5" />
          </span>
        ) : null}
        <span className="flex items-baseline gap-1.5">
          <span className="font-heading text-sm font-semibold text-foreground">{label}</span>
          <span className="font-arabic text-xs text-muted-foreground">{arabic}</span>
        </span>
        <span className="text-xs text-muted-foreground">
          {pending} pending
        </span>
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold tabular-nums transition-colors",
            count > 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          {count > 0 ? `+${count}` : "+"}
        </span>
      </button>
      {count > 0 ? (
        <button
          type="button"
          onClick={onReset}
          aria-label={`Clear ${label} count`}
          className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-destructive text-white shadow transition-transform active:scale-90"
        >
          <XIcon className="size-3" />
        </button>
      ) : null}
    </div>
  );
}

export function QalaLogForm({
  memberId,
  pendingByPrayer,
  homeHref,
}: {
  memberId: string;
  pendingByPrayer: Record<string, number>;
  homeHref: string;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    logQalaCompletions,
    initialActionState,
  );
  const [counts, setCounts] = useState<Record<string, number>>({});

  const wasSaving = useRef(false);
  useEffect(() => {
    if (wasSaving.current && !isPending && !state.error) {
      setCounts({});
      router.push(homeHref);
    }
    wasSaving.current = isPending;
  }, [isPending, state.error, homeHref, router]);

  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log completed Qala</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {MANDATORY_PRAYERS.map((prayer) => (
            <PrayerTapTile
              key={prayer.key}
              prayerKey={prayer.key}
              label={prayer.label}
              arabic={prayer.arabic}
              pending={pendingByPrayer[prayer.key] ?? 0}
              count={counts[prayer.key] ?? 0}
              onTap={() =>
                setCounts((prev) => ({ ...prev, [prayer.key]: (prev[prayer.key] ?? 0) + 1 }))
              }
              onReset={() => setCounts((prev) => ({ ...prev, [prayer.key]: 0 }))}
            />
          ))}
        </div>

        <form action={formAction} className="flex flex-col gap-3">
          <input type="hidden" name="member_id" value={memberId} />
          {MANDATORY_PRAYERS.map((prayer) => (
            <input
              key={prayer.key}
              type="hidden"
              name={`count_${prayer.key}`}
              value={counts[prayer.key] ?? 0}
            />
          ))}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="qala_remarks">Remarks (optional)</Label>
              <Input id="qala_remarks" name="remarks" placeholder="e.g. made up during Ramadan" />
            </div>
            <Button type="submit" disabled={isPending || total === 0} className="sm:w-auto">
              {isPending ? "Saving..." : total > 0 ? `Save ${total} logged` : "Save"}
            </Button>
          </div>
          {state.error ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
