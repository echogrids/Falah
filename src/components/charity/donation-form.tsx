"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { recordCharityPayment, recordInstitutionDonation } from "@/app/(app)/charity/actions";
import { initialActionState } from "@/lib/action-state";
import { formatMoney } from "@/lib/format-currency";

export function DonationForm({
  mode,
  offerId,
  institutionId,
  memberId,
  pendingAmount,
  returnHref,
}: {
  mode: "offer" | "institution";
  offerId?: string;
  institutionId?: string;
  memberId?: string;
  pendingAmount: number;
  returnHref: string;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    mode === "offer" ? recordCharityPayment : recordInstitutionDonation,
    initialActionState,
  );
  const [amount, setAmount] = useState("");

  const wasPending = useRef(false);
  useEffect(() => {
    if (wasPending.current && !isPending && !state.error) {
      const separator = returnHref.includes("?") ? "&" : "?";
      router.push(`${returnHref}${separator}donated=1`);
    }
    wasPending.current = isPending;
  }, [isPending, state.error, returnHref, router]);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {mode === "offer" ? (
        <input type="hidden" name="offer_id" value={offerId} />
      ) : (
        <>
          <input type="hidden" name="institution_id" value={institutionId} />
          <input type="hidden" name="member_id" value={memberId} />
        </>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="amount" className="flex items-center gap-1.5 text-base">
          <Wallet className="size-4 text-muted-foreground" />
          Amount
        </Label>
        <Input
          id="amount"
          type="text"
          inputMode="decimal"
          name="amount"
          value={amount}
          onChange={(event) => setAmount(event.target.value.replace(/[^0-9.]/g, ""))}
          placeholder="0"
          autoFocus
          autoComplete="off"
          required
          className="h-20 rounded-2xl text-center text-4xl font-semibold tabular-nums"
        />
        <p className="text-center text-xs text-muted-foreground">
          {formatMoney(pendingAmount)} pending
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea id="notes" name="notes" rows={3} />
      </div>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

      <Button
        type="submit"
        disabled={isPending}
        className="h-14 w-full rounded-2xl text-base font-semibold"
      >
        {isPending ? "Saving..." : "Record Donation"}
      </Button>
    </form>
  );
}
