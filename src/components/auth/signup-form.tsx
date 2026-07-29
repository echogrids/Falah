"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { signup } from "@/app/signup/actions";
import { profileLabel } from "@/lib/profile-label";

const signupInitialState = { error: null, message: null };

type AdminOption = { id: string; email: string; username: string | null };

export function SignupForm({ admins }: { admins: AdminOption[] }) {
  const [state, formAction, isPending] = useActionState(signup, signupInitialState);
  const [requestedRole, setRequestedRole] = useState<"admin" | "member">("member");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="first_name">First Name</Label>
        <Input id="first_name" name="first_name" autoComplete="given-name" required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="last_name">Last Name</Label>
        <Input id="last_name" name="last_name" autoComplete="family-name" required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="username">Username</Label>
        <Input id="username" name="username" autoComplete="username" required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email (optional)</Label>
        <Input id="email" name="email" type="email" autoComplete="email" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="mobile">Mobile</Label>
        <Input id="mobile" name="mobile" type="tel" autoComplete="tel" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          minLength={6}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="confirm_password">Confirm Password</Label>
        <PasswordInput
          id="confirm_password"
          name="confirm_password"
          autoComplete="new-password"
          minLength={6}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>I am a</Label>
        <RadioGroup
          name="requested_role"
          value={requestedRole}
          onValueChange={(value) => setRequestedRole(value as "admin" | "member")}
          className="flex gap-4"
        >
          <label className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="member" />
            Student
          </label>
          <label className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="admin" />
            Parent
          </label>
        </RadioGroup>
      </div>

      {requestedRole === "member" ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor="requested_admin_id">Your Parent</Label>
          <Select name="requested_admin_id">
            <SelectTrigger id="requested_admin_id" className="w-full">
              <SelectValue placeholder="Choose your Parent" />
            </SelectTrigger>
            <SelectContent>
              {admins.map((admin) => (
                <SelectItem key={admin.id} value={admin.id}>
                  {profileLabel(admin)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {admins.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No approved Parents yet — ask one to sign up first.
            </p>
          ) : null}
        </div>
      ) : null}

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.message ? (
        <p className="text-sm text-muted-foreground">{state.message}</p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating account..." : "Sign up"}
      </Button>
    </form>
  );
}
