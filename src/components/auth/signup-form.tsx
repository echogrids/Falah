"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signup, signupInitialState } from "@/app/signup/actions";

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(signup, signupInitialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
        />
      </div>
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {state.message ? (
        <p className="text-sm text-muted-foreground">{state.message}</p>
      ) : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating account..." : "Sign up"}
      </Button>
    </form>
  );
}
