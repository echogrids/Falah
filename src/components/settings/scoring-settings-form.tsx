"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FASTING_TYPE_OPTIONS } from "@/lib/ibadah/constants";
import type { ScoringSettings, ScoringMilestone } from "@/lib/ibadah/scoring";
import { updateScoringSettings } from "@/app/(app)/settings/actions";
import { initialActionState } from "@/lib/action-state";

const BASE_POINT_FIELDS: { key: keyof ScoringSettings; label: string; min?: number }[] = [
  { key: "on_time_points", label: "On Time", min: 0 },
  { key: "late_points", label: "Late", min: 0 },
  // No min: Qala and Missed should be allowed to go negative, so Master
  // Admin can make skipping or making up prayers a genuine deduction.
  { key: "qala_points", label: "Qala" },
  { key: "missed_points", label: "Missed" },
  { key: "jamaah_bonus_points", label: "Jama'ah bonus", min: 0 },
  { key: "masjid_bonus_points", label: "Masjid bonus", min: 0 },
  { key: "dhuha_points", label: "Dhuha", min: 0 },
  { key: "tahajjud_points", label: "Tahajjud", min: 0 },
  { key: "witr_points", label: "Witr", min: 0 },
];

function MilestoneFields({
  prefix,
  label,
  milestones,
}: {
  prefix: string;
  label: string;
  milestones: ScoringMilestone[];
}) {
  const slots = [0, 1, 2];
  return (
    <div className="flex flex-col gap-2">
      <Label>{label} milestones</Label>
      <div className="flex flex-col gap-2">
        {slots.map((slot) => (
          <div key={slot} className="flex items-center gap-2">
            <Input
              type="number"
              name={`${prefix}_threshold_${slot + 1}`}
              placeholder="Threshold"
              min={0}
              defaultValue={milestones[slot]?.threshold}
              className="w-28"
            />
            <span className="text-sm text-muted-foreground">→</span>
            <Input
              type="number"
              name={`${prefix}_points_${slot + 1}`}
              placeholder="Points"
              min={0}
              defaultValue={milestones[slot]?.points}
              className="w-24"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ScoringSettingsForm({
  settings,
}: {
  settings: ScoringSettings;
}) {
  const [state, formAction, isPending] = useActionState(
    updateScoringSettings,
    initialActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Base points</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {BASE_POINT_FIELDS.map((field) => (
            <div key={field.key} className="flex flex-col gap-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              <Input
                id={field.key}
                type="number"
                name={field.key}
                min={field.min}
                defaultValue={settings[field.key] as number}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Milestones</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-3">
          <MilestoneFields
            prefix="dhikr"
            label="Dhikr count"
            milestones={settings.dhikr_milestones}
          />
          <MilestoneFields
            prefix="swalath"
            label="Swalath count"
            milestones={settings.swalath_milestones}
          />
          <MilestoneFields
            prefix="quran"
            label="Quran pages"
            milestones={settings.quran_milestones}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fasting points</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {FASTING_TYPE_OPTIONS.map((option) => (
            <div key={option.value} className="flex flex-col gap-2">
              <Label htmlFor={`fasting_${option.value}`}>{option.label}</Label>
              <Input
                id={`fasting_${option.value}`}
                type="number"
                name={`fasting_${option.value}`}
                min={0}
                defaultValue={settings.fasting_points[option.value]}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}

      <Button type="submit" disabled={isPending} className="w-full sm:w-fit">
        {isPending ? "Saving..." : "Save scoring settings"}
      </Button>
    </form>
  );
}
