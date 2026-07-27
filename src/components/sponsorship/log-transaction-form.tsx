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
import { logSponsorshipTransaction } from "@/app/(app)/sponsorship/actions";
import { initialActionState } from "@/lib/action-state";

const TYPE_OPTIONS = [
  { value: "intended", label: "Intended" },
  { value: "donated", label: "Donated" },
  { value: "pending", label: "Pending" },
] as const;

export function LogTransactionForm({ memberId }: { memberId: string }) {
  const [state, formAction, isPending] = useActionState(
    logSponsorshipTransaction,
    initialActionState,
  );
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const amount = (Number(quantity) || 0) * (Number(unitPrice) || 0);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="member_id" value={memberId} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="type">Type</Label>
        <Select name="type" defaultValue="intended">
          <SelectTrigger id="type" className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="quantity">Quantity</Label>
        <Input
          id="quantity"
          type="number"
          name="quantity"
          min={0}
          step="1"
          className="w-24"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="unit_price">Price per unit</Label>
        <Input
          id="unit_price"
          type="number"
          name="unit_price"
          min={0}
          step="0.01"
          className="w-28"
          value={unitPrice}
          onChange={(event) => setUnitPrice(event.target.value)}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label>Amount</Label>
        <p className="flex h-9 w-28 items-center text-sm font-medium">
          {amount.toFixed(2)}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="note">Note</Label>
        <Input id="note" name="note" className="w-48" />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Log"}
      </Button>
      {state.error ? (
        <span className="text-sm text-destructive">{state.error}</span>
      ) : null}
    </form>
  );
}
