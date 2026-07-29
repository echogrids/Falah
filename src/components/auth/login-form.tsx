"use client";

import { useActionState } from "react";
import Link from "next/link";
import { UserIcon, LockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { login, type LoginState } from "@/app/login/actions";

const initialState: LoginState = { error: null };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState);

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
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <LockIcon className="pointer-events-none absolute inset-y-0 left-2.5 my-auto size-4 text-muted-foreground" />
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            className="pl-8"
            required
          />
        </div>
      </div>
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
