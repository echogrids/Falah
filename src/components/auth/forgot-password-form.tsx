"use client";

import { useActionState } from "react";
import { UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/app/forgot-password/actions";

const initialState = { error: null, message: null };

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    requestPasswordReset,
    initialState,
  );

  if (state.message) {
    return (
      <p className="text-sm text-muted-foreground">{state.message}</p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="identifier">Username or Email</Label>
        <div className="relative">
          <UserIcon className="pointer-events-none absolute inset-y-0 left-2.5 my-auto size-4 text-muted-foreground" />
          <Input
            id="identifier"
            name="identifier"
            type="text"
            autoComplete="username"
            className="pl-8"
            required
          />
        </div>
      </div>
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Sending..." : "Send request"}
      </Button>
    </form>
  );
}
