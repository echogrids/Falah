"use client";

import { useActionState } from "react";
import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteUser } from "@/app/(app)/admin/actions";
import { initialActionState } from "@/lib/action-state";

export function DeleteUserButton({
  userId,
  label,
}: {
  userId: string;
  label: string;
}) {
  const [state, formAction, isPending] = useActionState(
    deleteUser,
    initialActionState,
  );

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Delete ${label}? This permanently removes their account and all their data.`,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="user_id" value={userId} />
      <Button
        type="submit"
        variant="ghost"
        size="icon-sm"
        disabled={isPending}
        aria-label={`Delete ${label}`}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2Icon />
      </Button>
      {state.error ? (
        <span className="mt-1 block text-xs text-destructive">{state.error}</span>
      ) : null}
    </form>
  );
}
