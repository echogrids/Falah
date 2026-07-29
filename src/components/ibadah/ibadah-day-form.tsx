"use client";

import { useActionState } from "react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { User, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup } from "@/components/ui/radio-group";
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
import { PRAYER_VISUALS } from "@/lib/ibadah/prayer-visuals";
import { saveIbadahDay, type SaveIbadahDayState } from "@/app/(app)/ibadah/actions";

const STATUS_TINT_CLASSNAME: Record<string, string> = {
  on_time:
    "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary has-[[data-state=checked]]:text-primary-foreground has-[[data-state=checked]]:shadow-md",
  late: "border-accent/30 bg-accent/10 text-accent hover:bg-accent/20 has-[[data-state=checked]]:border-accent has-[[data-state=checked]]:bg-accent has-[[data-state=checked]]:text-accent-foreground has-[[data-state=checked]]:shadow-md",
  qala: "border-gold/40 bg-gold/15 text-gold-foreground hover:bg-gold/25 has-[[data-state=checked]]:border-gold has-[[data-state=checked]]:bg-gold has-[[data-state=checked]]:text-gold-foreground has-[[data-state=checked]]:shadow-md",
  missed:
    "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 has-[[data-state=checked]]:border-destructive has-[[data-state=checked]]:bg-destructive has-[[data-state=checked]]:text-white has-[[data-state=checked]]:shadow-md",
};

const CONGREGATION_TINT_CLASSNAME: Record<string, string> = {
  alone:
    "border-accent/30 bg-accent/10 text-accent hover:bg-accent/20 has-[[data-state=checked]]:border-accent has-[[data-state=checked]]:bg-accent has-[[data-state=checked]]:text-accent-foreground has-[[data-state=checked]]:shadow-md",
  jamaah:
    "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary has-[[data-state=checked]]:text-primary-foreground has-[[data-state=checked]]:shadow-md",
};

function ChoicePill({
  value,
  tintClassName,
  children,
}: {
  value: string;
  tintClassName: string;
  children: React.ReactNode;
}) {
  return (
    <label
      className={cn(
        "relative flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-all duration-150 active:scale-95 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2",
        tintClassName,
      )}
    >
      <RadioGroupPrimitive.Item value={value} className="absolute inset-0 opacity-0" />
      {children}
    </label>
  );
}

function CongregationCard({
  value,
  icon: Icon,
  label,
  tintClassName,
}: {
  value: string;
  icon: typeof User;
  label: string;
  tintClassName: string;
}) {
  return (
    <label
      className={cn(
        "relative flex min-h-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 px-3 py-3 text-sm font-semibold transition-all duration-150 active:scale-95 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2",
        tintClassName,
      )}
    >
      <RadioGroupPrimitive.Item value={value} className="absolute inset-0 opacity-0" />
      <Icon className="size-5" />
      {label}
    </label>
  );
}

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
  const [state, formAction, isPending] = useActionState(
    saveIbadahDay,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="prayer_day" value={prayerDay} />
      <input type="hidden" name="member_id" value={memberId} />

      <Card>
        <CardHeader>
          <CardTitle>Mandatory Salah</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {MANDATORY_PRAYERS.map((prayer) => {
            const existing = prayerEntries[prayer.key];
            const visual = PRAYER_VISUALS[prayer.key];
            const PrayerIcon = visual?.icon;
            return (
              <div
                key={prayer.key}
                className="flex flex-col gap-3 border-b border-border pb-6 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  {PrayerIcon ? (
                    <span
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-full",
                        visual.className,
                      )}
                    >
                      <PrayerIcon className="size-5" />
                    </span>
                  ) : null}
                  <div className="flex items-baseline gap-2">
                    <span className="font-heading text-lg font-semibold text-foreground">
                      {prayer.label}
                    </span>
                    <span className="font-arabic text-sm text-muted-foreground">
                      {prayer.arabic}
                    </span>
                  </div>
                </div>
                <RadioGroup
                  name={`${prayer.key}_status`}
                  defaultValue={existing?.status}
                  className="grid grid-cols-2 gap-2 sm:grid-cols-4"
                >
                  {PRAYER_STATUSES.map((status) => (
                    <ChoicePill
                      key={status.value}
                      value={status.value}
                      tintClassName={STATUS_TINT_CLASSNAME[status.value]}
                    >
                      {status.label}
                    </ChoicePill>
                  ))}
                </RadioGroup>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <RadioGroup
                    name={`${prayer.key}_congregation`}
                    defaultValue={existing?.congregation ?? undefined}
                    className="grid grid-cols-2 gap-2 sm:w-1/2"
                  >
                    {CONGREGATION_OPTIONS.map((option) => (
                      <CongregationCard
                        key={option.value}
                        value={option.value}
                        icon={option.value === "alone" ? User : Users}
                        label={option.label}
                        tintClassName={CONGREGATION_TINT_CLASSNAME[option.value]}
                      />
                    ))}
                  </RadioGroup>
                  <Select
                    name={`${prayer.key}_location`}
                    defaultValue={existing?.location ?? undefined}
                  >
                    <SelectTrigger className="w-full sm:w-1/2">
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
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              name="dhikr_count"
              defaultValue={dailyTracker.dhikr_count}
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
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="fasting_type">Fasting</Label>
            <Select
              name="fasting_type"
              defaultValue={dailyTracker.fasting_type ?? undefined}
            >
              <SelectTrigger id="fasting_type" className="w-full sm:w-64">
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

      <Button type="submit" disabled={isPending} className="w-full sm:w-fit">
        {isPending ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
