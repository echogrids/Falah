"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  MANDATORY_PRAYERS,
  ADDITIONAL_WORSHIP,
  FASTING_TYPE_OPTIONS,
} from "@/lib/ibadah/constants";
import { PRAYER_VISUALS } from "@/lib/ibadah/prayer-visuals";
import { PrayerCard } from "@/components/ibadah/prayer-card";
import { ProgressIndicator } from "@/components/ibadah/progress-indicator";
import { AutosaveToast } from "@/components/ibadah/autosave-toast";
import { saveIbadahDay } from "@/app/(app)/ibadah/actions";
import { initialActionState } from "@/lib/action-state";

export type PrayerEntryInitial = {
  status: string;
  congregation: string | null;
  location: string | null;
};

export type WorshipInitial = {
  rakat_count: number | null;
};

export type DailyTrackerInitial = {
  dhikr_count: number;
  swalath_count: number;
  quran_pages: number;
  fasting_type: string | null;
};

type PrayerFieldState = {
  status: string | null;
  congregation: string | null;
  location: string | null;
};

// A status-change (Fajr done, tap Late) fires an immediate save. Free-text
// fields (dhikr/swalath/quran/rakat counts) debounce so we don't fire a
// save on every keystroke.
const TEXT_INPUT_DEBOUNCE_MS = 700;
// How long the "Completed" confirmation shows before the card collapses
// and the next incomplete prayer opens — kept under a second per spec.
const COMPLETION_ADVANCE_MS = 550;

function buildInitialPrayerState(
  prayerEntries: Record<string, PrayerEntryInitial>,
): Record<string, PrayerFieldState> {
  const map: Record<string, PrayerFieldState> = {};
  for (const prayer of MANDATORY_PRAYERS) {
    const existing = prayerEntries[prayer.key];
    map[prayer.key] = {
      status: existing?.status ?? null,
      congregation: existing?.congregation ?? null,
      location: existing?.location ?? null,
    };
  }
  return map;
}

export function IbadahDayForm({
  prayerDay,
  memberId,
  prayerEntries,
  worship,
  dailyTracker,
}: {
  prayerDay: string;
  memberId: string;
  prayerEntries: Record<string, PrayerEntryInitial>;
  worship: Record<string, WorshipInitial>;
  dailyTracker: DailyTrackerInitial;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  const [prayerState, setPrayerState] = useState<Record<string, PrayerFieldState>>(() =>
    buildInitialPrayerState(prayerEntries),
  );
  const prayerStateRef = useRef(prayerState);

  const [expandedKey, setExpandedKey] = useState<string | null>(() => {
    const firstIncomplete = MANDATORY_PRAYERS.find(
      (prayer) => !prayerState[prayer.key].status,
    );
    return firstIncomplete?.key ?? null;
  });
  const [justCompletedKey, setJustCompletedKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = useRef(false);
  const pendingResaveRef = useRef(false);

  useEffect(
    () => () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    },
    [],
  );

  // Every save sends the whole day's current form snapshot (same shape the
  // old manual Save button submitted) — auto-save just calls this more
  // often instead of waiting for a click. If a save is already in flight
  // when another change comes in, we flag it and re-run once the first
  // finishes (with a fresh snapshot) rather than firing overlapping
  // requests, so a slow response can never clobber a newer one.
  const runSave = useCallback(async () => {
    if (isSavingRef.current) {
      pendingResaveRef.current = true;
      return;
    }
    isSavingRef.current = true;
    try {
      do {
        pendingResaveRef.current = false;
        const form = formRef.current;
        if (!form) break;
        const formData = new FormData(form);
        const result = await saveIbadahDay(initialActionState, formData);
        if (result.error) {
          setToastMessage(result.error);
        }
      } while (pendingResaveRef.current);
    } finally {
      isSavingRef.current = false;
    }
  }, []);

  const scheduleSave = useCallback(
    (delay: number) => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      if (delay <= 0) {
        void runSave();
      } else {
        saveTimerRef.current = setTimeout(() => {
          saveTimerRef.current = null;
          void runSave();
        }, delay);
      }
    },
    [runSave],
  );

  const updateField = useCallback(
    (prayerKey: string, field: keyof PrayerFieldState, value: string) => {
      setPrayerState((prev) => {
        const next = { ...prev, [prayerKey]: { ...prev[prayerKey], [field]: value } };
        prayerStateRef.current = next;
        return next;
      });
    },
    [],
  );

  const toggleExpand = useCallback((prayerKey: string) => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
      setJustCompletedKey(null);
    }
    setExpandedKey((prev) => (prev === prayerKey ? null : prayerKey));
  }, []);

  // Shared by all three fields (Status, Congregation, Location) so the card
  // stays open through the whole entry — picking one field just restarts
  // this timer instead of collapsing immediately. It only fires once the
  // user has paused, so a single-field entry (e.g. marking a prayer
  // "Missed") still auto-advances on its own, while a full Status →
  // Congregation → Location pass never has to be reopened.
  const scheduleAdvance = useCallback((prayerKey: string) => {
    setJustCompletedKey(prayerKey);
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = setTimeout(() => {
      setJustCompletedKey(null);
      const idx = MANDATORY_PRAYERS.findIndex((prayer) => prayer.key === prayerKey);
      const nextIncomplete = MANDATORY_PRAYERS.slice(idx + 1).find(
        (prayer) => !prayerStateRef.current[prayer.key].status,
      );
      setExpandedKey(nextIncomplete?.key ?? null);
    }, COMPLETION_ADVANCE_MS);
  }, []);

  const handleStatusChange = useCallback(
    (prayerKey: string, value: string) => {
      updateField(prayerKey, "status", value);
      scheduleSave(0);
      scheduleAdvance(prayerKey);
    },
    [scheduleSave, updateField, scheduleAdvance],
  );

  const handleCongregationChange = useCallback(
    (prayerKey: string, value: string) => {
      updateField(prayerKey, "congregation", value);
      scheduleSave(0);
      scheduleAdvance(prayerKey);
    },
    [scheduleSave, updateField, scheduleAdvance],
  );

  const handleLocationChange = useCallback(
    (prayerKey: string, value: string) => {
      updateField(prayerKey, "location", value);
      scheduleSave(0);
      scheduleAdvance(prayerKey);
    },
    [scheduleSave, updateField, scheduleAdvance],
  );

  const handleGenericChange = useCallback(
    (event: React.ChangeEvent<HTMLFormElement>) => {
      const target = event.target as unknown as HTMLInputElement;
      scheduleSave(target.type === "text" ? TEXT_INPUT_DEBOUNCE_MS : 0);
    },
    [scheduleSave],
  );

  const completedCount = MANDATORY_PRAYERS.filter(
    (prayer) => prayerState[prayer.key].status,
  ).length;

  return (
    <form
      ref={formRef}
      onSubmit={(event) => event.preventDefault()}
      onChange={handleGenericChange}
      className="flex flex-col gap-6"
    >
      <input type="hidden" name="prayer_day" value={prayerDay} />
      <input type="hidden" name="member_id" value={memberId} />
      {MANDATORY_PRAYERS.map((prayer) => (
        <Fragment key={prayer.key}>
          <input
            type="hidden"
            name={`${prayer.key}_status`}
            value={prayerState[prayer.key].status ?? ""}
          />
          <input
            type="hidden"
            name={`${prayer.key}_congregation`}
            value={prayerState[prayer.key].congregation ?? ""}
          />
          <input
            type="hidden"
            name={`${prayer.key}_location`}
            value={prayerState[prayer.key].location ?? ""}
          />
        </Fragment>
      ))}

      <ProgressIndicator completed={completedCount} total={MANDATORY_PRAYERS.length} />

      <section className="flex flex-col gap-3">
        <h2 className="px-1 font-heading text-lg font-semibold text-foreground">
          Mandatory Salah
        </h2>
        <div className="flex flex-col gap-3">
          {MANDATORY_PRAYERS.map((prayer) => {
            const visual = PRAYER_VISUALS[prayer.key];
            const state = prayerState[prayer.key];
            return (
              <PrayerCard
                key={prayer.key}
                label={prayer.label}
                arabic={prayer.arabic}
                icon={visual.icon}
                iconClassName={visual.className}
                status={state.status}
                congregation={state.congregation}
                location={state.location}
                expanded={expandedKey === prayer.key}
                justCompleted={justCompletedKey === prayer.key}
                onToggleExpand={() => toggleExpand(prayer.key)}
                onStatusChange={(value) => handleStatusChange(prayer.key, value)}
                onCongregationChange={(value) =>
                  handleCongregationChange(prayer.key, value)
                }
                onLocationChange={(value) => handleLocationChange(prayer.key, value)}
              />
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="px-1 font-heading text-lg font-semibold text-foreground">
          Additional Worship
        </h2>
        <Card>
          <CardContent className="flex flex-col gap-2.5 pt-1">
            {ADDITIONAL_WORSHIP.map((item) => {
              const existing = worship[item.key];
              return (
                <div
                  key={item.key}
                  className="flex items-center gap-3 rounded-xl bg-muted/40 px-3 py-2"
                >
                  <label className="flex min-h-12 flex-1 cursor-pointer items-center gap-2.5 text-sm font-medium text-foreground">
                    <Checkbox
                      name={`worship_${item.key}`}
                      defaultChecked={Boolean(existing)}
                      className="size-5"
                    />
                    {item.label}
                    <span className="font-arabic text-muted-foreground">
                      {item.arabic}
                    </span>
                  </label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    name={`worship_${item.key}_rakat`}
                    placeholder="Rakat"
                    defaultValue={existing?.rakat_count ?? undefined}
                    className="h-12 w-24 shrink-0 rounded-xl text-center"
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="px-1 font-heading text-lg font-semibold text-foreground">
          Daily Tracking
        </h2>
        <Card>
          <CardContent className="flex flex-col gap-4 pt-1">
            <div className="flex flex-col gap-2">
              <Label htmlFor="dhikr_count">Dhikr count</Label>
              <Input
                id="dhikr_count"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                name="dhikr_count"
                defaultValue={dailyTracker.dhikr_count}
                className="h-12 rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="swalath_count">Swalath count</Label>
              <Input
                id="swalath_count"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                name="swalath_count"
                defaultValue={dailyTracker.swalath_count}
                className="h-12 rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="quran_pages">Quran pages read</Label>
              <Input
                id="quran_pages"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                name="quran_pages"
                defaultValue={dailyTracker.quran_pages}
                className="h-12 rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="fasting_type">Fasting</Label>
              <Select name="fasting_type" defaultValue={dailyTracker.fasting_type ?? undefined}>
                <SelectTrigger id="fasting_type" className="h-12 w-full rounded-xl sm:w-64">
                  <SelectValue placeholder="Not fasting" />
                </SelectTrigger>
                <SelectContent>
                  {FASTING_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </section>

      <AutosaveToast message={toastMessage} onDismiss={() => setToastMessage(null)} />
    </form>
  );
}
