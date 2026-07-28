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
import { formatRs } from "@/lib/format-currency";

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
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="member_id" value={memberId} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="col-span-2 flex flex-col gap-2 sm:col-span-1">
          <Label htmlFor="type">Type</Label>
          <Select name="type" defaultValue="intended">
            <SelectTrigger id="type" className="w-full">
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
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="unit_price">Price/unit (Rs)</Label>
          <Input
            id="unit_price"
            type="number"
            name="unit_price"
            min={0}
            step="0.01"
            value={unitPrice}
            onChange={(event) => setUnitPrice(event.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Amount</Label>
          <p className="flex h-10 items-center text-sm font-medium tabular-nums">
            {formatRs(amount)}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="note">Note</Label>
        <Input id="note" name="note" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? "Saving..." : "Log"}
        </Button>
        {state.error ? (
          <span className="text-sm text-destructive">{state.error}</span>
        ) : null}
      </div>
    </form>
  );
}
