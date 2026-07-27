"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createUserByAdmin } from "@/app/(app)/admin/actions";
import { initialActionState } from "@/lib/action-state";

type AdminOption = { id: string; email: string };

export function CreateUserForm({ admins }: { admins: AdminOption[] }) {
  const [state, formAction, isPending] = useActionState(
    createUserByAdmin,
    initialActionState,
  );
  const [requestedRole, setRequestedRole] = useState<"admin" | "member">("member");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="create_email">Email</Label>
          <Input id="create_email" name="email" type="email" required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="create_password">Password</Label>
          <Input
            id="create_password"
            name="password"
            type="text"
            minLength={6}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Role</Label>
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
          <Label htmlFor="create_admin">Parent</Label>
          <Select name="requested_admin_id">
            <SelectTrigger id="create_admin" className="w-full sm:w-64">
              <SelectValue placeholder="Choose a Parent" />
            </SelectTrigger>
            <SelectContent>
              {admins.map((admin) => (
                <SelectItem key={admin.id} value={admin.id}>
                  {admin.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}

      <Button type="submit" disabled={isPending} className="w-full sm:w-fit">
        {isPending ? "Creating..." : "Create account"}
      </Button>
    </form>
  );
}
