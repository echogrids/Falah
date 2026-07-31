"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, UtensilsCrossed, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { logSponsorshipTransaction } from "@/app/(app)/sponsorship/actions";
import { initialActionState } from "@/lib/action-state";
import { formatMoney } from "@/lib/format-currency";

export function TransactionForm({
  memberId,
  unitPrice,
  type,
  homeHref,
}: {
  memberId: string;
  unitPrice: number;
  type: "intended" | "donated";
  homeHref: string;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    logSponsorshipTransaction,
    initialActionState,
  );
  const [meals, setMeals] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const amount = (Number(meals) || 0) * unitPrice;

  const wasPending = useRef(false);
  useEffect(() => {
    if (wasPending.current && !isPending && !state.error) {
      const separator = homeHref.includes("?") ? "&" : "?";
      router.push(`${homeHref}${separator}saved=${type}`);
    }
    wasPending.current = isPending;
  }, [isPending, state.error, homeHref, type, router]);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="member_id" value={memberId} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="meals" className="flex items-center gap-1.5 text-base">
          <UtensilsCrossed className="size-4 text-muted-foreground" />
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
          placeholder="0"
          autoFocus
          autoComplete="off"
          required
          className="h-20 rounded-2xl text-center text-4xl font-semibold tabular-nums"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2 rounded-xl bg-muted/60 px-4 py-3">
          <Label className="text-xs text-muted-foreground">Price per Meal</Label>
          <p className="text-sm font-medium tabular-nums text-foreground">
            {formatMoney(unitPrice)}
          </p>
        </div>
        <div className="flex flex-col gap-2 rounded-xl bg-muted/60 px-4 py-3">
          <Label className="flex items-center gap-1 text-xs text-muted-foreground">
            <Wallet className="size-3" />
            Amount
          </Label>
          <p className="text-sm font-medium tabular-nums text-foreground">{formatMoney(amount)}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {noteOpen ? (
          <>
            <Label htmlFor="note">Note</Label>
            <Textarea id="note" name="note" rows={3} autoFocus />
          </>
        ) : (
          <button
            type="button"
            onClick={() => setNoteOpen(true)}
            className="flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronDown className="size-4" />
            Add a note
          </button>
        )}
      </div>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

      <Button type="submit" disabled={isPending} className="h-14 w-full rounded-2xl text-base font-semibold">
        {isPending ? "Saving..." : "Save Transaction"}
      </Button>
    </form>
  );
}
