"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateSponsorshipSettings } from "@/app/(app)/settings/actions";
import { initialActionState } from "@/lib/action-state";

export function SponsorshipSettingsForm({ unitPrice }: { unitPrice: number }) {
  const [state, formAction, isPending] = useActionState(
    updateSponsorshipSettings,
    initialActionState,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Zād settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex max-w-xs flex-col gap-2">
            <Label htmlFor="unit_price">Price per meal (Rs)</Label>
            <Input
              id="unit_price"
              type="text"
              inputMode="decimal"
              name="unit_price"
              defaultValue={unitPrice}
              required
            />
          </div>
          {state.error ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}
          <Button type="submit" disabled={isPending} className="w-full sm:w-fit">
            {isPending ? "Saving..." : "Save"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
