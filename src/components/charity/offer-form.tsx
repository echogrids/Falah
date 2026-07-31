"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCharityOffer, updateCharityOffer } from "@/app/(app)/charity/actions";
import { initialActionState } from "@/lib/action-state";

export type InstitutionOption = {
  id: string;
  name: string;
};

export function OfferForm({
  mode,
  memberId,
  offerId,
  institutions,
  institutionName,
  defaultInstitutionId,
  defaultValues,
  cancelHref,
}: {
  mode: "create" | "edit";
  memberId: string;
  offerId?: string;
  institutions?: InstitutionOption[];
  institutionName?: string;
  defaultInstitutionId?: string;
  defaultValues?: { purpose: string; amount: number; notes: string | null };
  cancelHref: string;
}) {
  const [state, formAction, isPending] = useActionState(
    mode === "create" ? createCharityOffer : updateCharityOffer,
    initialActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {mode === "create" ? (
        <input type="hidden" name="member_id" value={memberId} />
      ) : (
        <input type="hidden" name="offer_id" value={offerId} />
      )}

      {mode === "create" && institutions ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor="institution_id">Institution</Label>
          <Select name="institution_id" defaultValue={defaultInstitutionId ?? institutions[0]?.id}>
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
      ) : (
        <div className="flex flex-col gap-1.5 rounded-xl bg-muted/60 px-4 py-3">
          <span className="text-xs text-muted-foreground">Institution</span>
          <span className="text-sm font-medium text-foreground">{institutionName}</span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="purpose">Purpose</Label>
        <Input
          id="purpose"
          name="purpose"
          placeholder="What's this offer for?"
          defaultValue={defaultValues?.purpose}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="amount">Amount (₹)</Label>
        <Input
          id="amount"
          type="text"
          inputMode="decimal"
          name="amount"
          defaultValue={defaultValues?.amount}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Anything else worth remembering"
          defaultValue={defaultValues?.notes ?? ""}
          rows={3}
        />
      </div>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending} className="flex-1 sm:flex-none">
          {isPending ? "Saving..." : mode === "create" ? "Save Niyyah" : "Save changes"}
        </Button>
        <Button type="button" variant="outline" asChild className="flex-1 sm:flex-none">
          <Link href={cancelHref}>Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
