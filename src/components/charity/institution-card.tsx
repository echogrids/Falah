"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Landmark, Pencil, Banknote } from "lucide-react";
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { updateInstitution, recordCharityPayment } from "@/app/(app)/charity/actions";
import { initialActionState } from "@/lib/action-state";
import { formatMoney } from "@/lib/format-currency";

export type CurrencyTotal = { currency: string; offered: number; paid: number; pending: number };
export type OutstandingOffer = { id: string; amount: number; currency: string; paidTotal: number; remarks: string | null };

export function InstitutionCard({
  id,
  name,
  notes,
  defaultCurrency,
  canEditInstitution,
  canRecordPayment,
  totals,
  outstandingOffers,
}: {
  id: string;
  name: string;
  notes: string | null;
  defaultCurrency: string;
  canEditInstitution: boolean;
  canRecordPayment: boolean;
  totals: CurrencyTotal[];
  outstandingOffers: OutstandingOffer[];
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editState, editAction, isSavingEdit] = useActionState(
    updateInstitution,
    initialActionState,
  );
  const [payState, payAction, isPaying] = useActionState(
    recordCharityPayment,
    initialActionState,
  );

  const wasSavingEdit = useRef(false);
  useEffect(() => {
    if (wasSavingEdit.current && !isSavingEdit && !editState.error) {
      setIsEditing(false);
    }
    wasSavingEdit.current = isSavingEdit;
  }, [isSavingEdit, editState.error]);

  if (isEditing) {
    return (
      <Card size="sm">
        <CardContent className="pt-1">
          <form action={editAction} className="flex flex-col gap-3">
            <input type="hidden" name="institution_id" value={id} />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="col-span-2 flex flex-col gap-1.5">
                <Label htmlFor={`edit-name-${id}`}>Name</Label>
                <Input id={`edit-name-${id}`} name="name" defaultValue={name} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`edit-currency-${id}`}>Default currency</Label>
                <Input
                  id={`edit-currency-${id}`}
                  name="default_currency"
                  list="charity-currency-options"
                  defaultValue={defaultCurrency}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`edit-notes-${id}`}>Notes</Label>
              <Input id={`edit-notes-${id}`} name="notes" defaultValue={notes ?? ""} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="submit" size="sm" disabled={isSavingEdit}>
                {isSavingEdit ? "Saving..." : "Save"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              {editState.error ? (
                <span className="text-sm text-destructive">{editState.error}</span>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card size="sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Landmark className="size-4.5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{name}</p>
              {notes ? (
                <p className="truncate text-xs text-muted-foreground">{notes}</p>
              ) : null}
            </div>
          </div>
          {canEditInstitution ? (
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              onClick={() => setIsEditing(true)}
              aria-label={`Edit ${name}`}
            >
              <Pencil className="size-4" />
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {totals.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {totals.map((total) => (
              <li
                key={total.currency}
                className="flex items-center justify-between text-sm tabular-nums"
              >
                <span className="text-muted-foreground">Pending</span>
                <span className="font-medium text-foreground">
                  {formatMoney(total.pending, total.currency)}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    of {formatMoney(total.offered, total.currency)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">No offers made yet.</p>
        )}

        {canRecordPayment && outstandingOffers.length > 0 ? (
          <form
            action={payAction}
            className="flex flex-col gap-2 border-t border-border pt-3"
          >
            <Select name="offer_id" defaultValue={outstandingOffers[0].id}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {outstandingOffers.map((offer) => (
                  <SelectItem key={offer.id} value={offer.id}>
                    {formatMoney(offer.amount - offer.paidTotal, offer.currency)} pending
                    {offer.remarks ? ` · ${offer.remarks}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                type="text"
                inputMode="decimal"
                name="amount"
                placeholder="Amount"
                required
                className="w-full sm:w-32"
              />
              <Input name="remarks" placeholder="Remarks" className="w-full sm:flex-1" />
              <Button type="submit" size="sm" disabled={isPaying} className="w-full sm:w-auto">
                <Banknote className="size-4" />
                {isPaying ? "Saving..." : "Record payment"}
              </Button>
            </div>
            {payState.error ? (
              <span className="text-sm text-destructive">{payState.error}</span>
            ) : null}
          </form>
        ) : null}
      </CardContent>
    </Card>
  );
}
