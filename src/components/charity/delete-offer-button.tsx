"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteCharityOffer } from "@/app/(app)/charity/actions";
import { initialActionState } from "@/lib/action-state";

export function DeleteOfferButton({
  offerId,
  institutionId,
  purpose,
  hasPayments,
}: {
  offerId: string;
  institutionId: string;
  purpose: string;
  hasPayments: boolean;
}) {
  const [state, formAction, isPending] = useActionState(deleteCharityOffer, initialActionState);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        const message = hasPayments
          ? `Delete "${purpose}"? This also removes its donation history.`
          : `Delete "${purpose}"?`;
        if (!window.confirm(message)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="offer_id" value={offerId} />
      <input type="hidden" name="institution_id" value={institutionId} />
      <Button
        type="submit"
        variant="destructive"
        disabled={isPending}
        className="w-full sm:w-auto"
      >
        <Trash2 className="size-4" />
        {isPending ? "Deleting..." : "Delete Offer"}
      </Button>
      {state.error ? <p className="mt-2 text-sm text-destructive">{state.error}</p> : null}
    </form>
  );
}
