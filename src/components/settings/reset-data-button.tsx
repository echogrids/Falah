"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { SettingsActionState } from "@/app/(app)/settings/actions";

const initialState: SettingsActionState = { error: null };

export function ResetDataButton({
  label,
  confirmMessage,
  action,
}: {
  label: string;
  confirmMessage: string;
  action: (
    prevState: SettingsActionState,
    formData: FormData,
  ) => Promise<SettingsActionState>;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
      className="flex flex-col items-start gap-1"
    >
      <Button type="submit" variant="destructive" disabled={isPending}>
        {isPending ? "Resetting..." : label}
      </Button>
      {state.error ? (
        <span className="text-xs text-destructive">{state.error}</span>
      ) : null}
    </form>
  );
}
