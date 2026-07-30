"use client";

import { useActionState, useState } from "react";
import { UtensilsCrossed, Wallet, Clock, HandCoins } from "lucide-react";
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
  { value: "intended", label: "Intended", icon: Clock },
  { value: "donated", label: "Donated", icon: HandCoins },
] as const;

export function LogTransactionForm({
  memberId,
  unitPrice,
}: {
  memberId: string;
  unitPrice: number;
}) {
  const [state, formAction, isPending] = useActionState(
    logSponsorshipTransaction,
    initialActionState,
  );
  const [meals, setMeals] = useState("");
  const amount = (Number(meals) || 0) * unitPrice;

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
                  <option.icon className="size-3.5" />
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="meals" className="flex items-center gap-1.5">
            <UtensilsCrossed className="size-3.5 text-muted-foreground" />
            Meals
          </Label>
          <Input
            id="meals"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            name="meals"
            value={meals}
            onChange={(event) => setMeals(event.target.value.replace(/[^0-9]/g, ""))}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Price/meal</Label>
          <p className="flex h-10 items-center text-sm text-muted-foreground tabular-nums">
            {formatRs(unitPrice)}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Label className="flex items-center gap-1.5">
            <Wallet className="size-3.5 text-muted-foreground" />
            Amount
          </Label>
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
