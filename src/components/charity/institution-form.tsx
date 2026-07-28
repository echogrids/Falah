"use client";

import { useActionState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createInstitution } from "@/app/(app)/charity/actions";
import { initialActionState } from "@/lib/action-state";
import { CURRENCY_OPTIONS } from "@/lib/format-currency";

export function InstitutionForm() {
  const [state, formAction, isPending] = useActionState(
    createInstitution,
    initialActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="col-span-2 flex flex-col gap-2">
          <Label htmlFor="institution_name">Institution name</Label>
          <Input id="institution_name" name="name" required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="default_currency">Default currency</Label>
          <Input
            id="default_currency"
            name="default_currency"
            list="charity-currency-options"
            defaultValue="Rs"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="institution_notes">Notes</Label>
        <Input id="institution_notes" name="notes" placeholder="Address, contact, cause…" />
      </div>
      <datalist id="charity-currency-options">
        {CURRENCY_OPTIONS.map((code) => (
          <option key={code} value={code} />
        ))}
      </datalist>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          <Plus className="size-4" />
          {isPending ? "Adding..." : "Add institution"}
        </Button>
        {state.error ? (
          <span className="text-sm text-destructive">{state.error}</span>
        ) : null}
      </div>
    </form>
  );
}
