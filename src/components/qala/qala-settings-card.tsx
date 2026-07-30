"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MANDATORY_PRAYERS } from "@/lib/ibadah/constants";
import { setQalaTotal } from "@/app/(app)/qala/actions";
import { initialActionState } from "@/lib/action-state";

export function QalaSettingsCard({
  memberId,
  initialByPrayer,
}: {
  memberId: string;
  initialByPrayer: Record<string, number>;
}) {
  const [state, formAction, isPending] = useActionState(
    setQalaTotal,
    initialActionState,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>
          Set or correct the total owed for each prayer. Fixing a number here
          shifts what&apos;s pending — it doesn&apos;t erase what&apos;s already logged.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="member_id" value={memberId} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {MANDATORY_PRAYERS.map((prayer) => (
              <div key={prayer.key} className="flex flex-col gap-2">
                <Label htmlFor={`total_${prayer.key}`}>{prayer.label}</Label>
                <Input
                  id={`total_${prayer.key}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name={`total_${prayer.key}`}
                  defaultValue={initialByPrayer[prayer.key] ?? ""}
                  placeholder="0"
                />
              </div>
            ))}
          </div>
          {state.error ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}
          <Button type="submit" disabled={isPending} className="w-full sm:w-fit">
            {isPending ? "Saving..." : "Save totals"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
