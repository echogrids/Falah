"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCharityOffer } from "@/app/(app)/charity/actions";
import { initialActionState } from "@/lib/action-state";
import { CURRENCY_OPTIONS } from "@/lib/format-currency";

export type InstitutionOption = {
  id: string;
  name: string;
  default_currency: string;
};

export function OfferForm({
  memberId,
  institutions,
}: {
  memberId: string;
  institutions: InstitutionOption[];
}) {
  const [state, formAction, isPending] = useActionState(
    createCharityOffer,
    initialActionState,
  );
  const [currency, setCurrency] = useState("Rs");

  if (institutions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Add an institution above before making an offer.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="member_id" value={memberId} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="col-span-2 flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="institution_id">Institution</Label>
          <Select
            name="institution_id"
            defaultValue={institutions[0].id}
            onValueChange={(value) => {
              const institution = institutions.find((item) => item.id === value);
              if (institution) setCurrency(institution.default_currency);
            }}
          >
            <SelectTrigger id="institution_id" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {institutions.map((institution) => (
                <SelectItem key={institution.id} value={institution.id}>
                  {institution.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="amount">Amount</Label>
          <Input id="amount" type="number" name="amount" min={0} step="0.01" required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="currency">Currency</Label>
          <Input
            id="currency"
            name="currency"
            list="charity-currency-options"
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
          />
          <datalist id="charity-currency-options">
            {CURRENCY_OPTIONS.map((code) => (
              <option key={code} value={code} />
            ))}
          </datalist>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="offer_remarks">Remarks</Label>
        <Input id="offer_remarks" name="remarks" placeholder="What's this offer for?" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? "Saving..." : "Make offer"}
        </Button>
        {state.error ? (
          <span className="text-sm text-destructive">{state.error}</span>
        ) : null}
      </div>
    </form>
  );
}
