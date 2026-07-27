"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MANDATORY_PRAYERS,
  ADDITIONAL_WORSHIP,
  PRAYER_STATUSES,
  CONGREGATION_OPTIONS,
  LOCATION_OPTIONS,
  FASTING_TYPE_OPTIONS,
} from "@/lib/ibadah/constants";
import { saveIbadahDay, type SaveIbadahDayState } from "@/app/(app)/ibadah/actions";

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

const initialState: SaveIbadahDayState = { error: null };

export function IbadahDayForm({
  prayerDay,
  prayerEntries,
  worship,
  dailyTracker,
}: {
  prayerDay: string;
  prayerEntries: Record<string, PrayerEntryInitial>;
  worship: Record<string, WorshipInitial>;
  dailyTracker: DailyTrackerInitial;
}) {
  const [state, formAction, isPending] = useActionState(
    saveIbadahDay,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="prayer_day" value={prayerDay} />

      <Card>
        <CardHeader>
          <CardTitle>Mandatory Salah</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {MANDATORY_PRAYERS.map((prayer) => {
            const existing = prayerEntries[prayer.key];
            return (
              <div
                key={prayer.key}
                className="flex flex-col gap-3 border-b border-border pb-6 last:border-0 last:pb-0"
              >
                <div className="flex items-baseline gap-2">
                  <span className="font-medium">{prayer.label}</span>
                  <span className="text-sm text-muted-foreground">
                    {prayer.arabic}
                  </span>
                </div>
                <RadioGroup
                  name={`${prayer.key}_status`}
                  defaultValue={existing?.status}
                  className="flex flex-wrap gap-4"
                >
                  {PRAYER_STATUSES.map((status) => (
                    <label
                      key={status.value}
                      className="flex items-center gap-2 text-sm"
                    >
                      <RadioGroupItem value={status.value} />
                      {status.label}
                    </label>
                  ))}
                </RadioGroup>
                <div className="flex flex-wrap gap-4">
                  <Select
                    name={`${prayer.key}_congregation`}
                    defaultValue={existing?.congregation ?? undefined}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Congregation" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONGREGATION_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    name={`${prayer.key}_location`}
                    defaultValue={existing?.location ?? undefined}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCATION_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Worship</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {ADDITIONAL_WORSHIP.map((item) => {
            const existing = worship[item.key];
            return (
              <div key={item.key} className="flex items-center gap-4">
                <label className="flex flex-1 items-center gap-2 text-sm">
                  <Checkbox
                    name={`worship_${item.key}`}
                    defaultChecked={Boolean(existing)}
                  />
                  {item.label}
                  <span className="text-muted-foreground">{item.arabic}</span>
                </label>
                <Input
                  type="number"
                  name={`worship_${item.key}_rakat`}
                  placeholder="Rakat"
                  min={0}
                  defaultValue={existing?.rakat_count ?? undefined}
                  className="w-24"
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily Tracking</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="dhikr_count">Dhikr count</Label>
            <Input
              id="dhikr_count"
              type="number"
              name="dhikr_count"
              min={0}
              defaultValue={dailyTracker.dhikr_count}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="swalath_count">Swalath count</Label>
            <Input
              id="swalath_count"
              type="number"
              name="swalath_count"
              min={0}
              defaultValue={dailyTracker.swalath_count}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="quran_pages">Quran pages read</Label>
            <Input
              id="quran_pages"
              type="number"
              name="quran_pages"
              min={0}
              defaultValue={dailyTracker.quran_pages}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="fasting_type">Fasting</Label>
            <Select
              name="fasting_type"
              defaultValue={dailyTracker.fasting_type ?? undefined}
            >
              <SelectTrigger id="fasting_type" className="w-48">
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

      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}

      <Button type="submit" disabled={isPending} className="w-fit">
        {isPending ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
