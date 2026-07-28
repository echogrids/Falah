"use client";

import { useActionState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateUserRole } from "@/app/(app)/admin/actions";
import { initialActionState } from "@/lib/action-state";
import { ROLE_LABELS } from "@/lib/roles";

const ROLE_OPTIONS = [
  { value: "member", label: ROLE_LABELS.member },
  { value: "admin", label: ROLE_LABELS.admin },
  { value: "master_admin", label: ROLE_LABELS.master_admin },
] as const;

export function UserRoleRow({
  userId,
  email,
  role,
  children,
}: {
  userId: string;
  email: string;
  role: string;
  children?: React.ReactNode;
}) {
  const [state, formAction] = useActionState(
    updateUserRole,
    initialActionState,
  );

  return (
    <li className="flex flex-col gap-2 border-b border-border py-3 text-sm last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="min-w-0 truncate">{email}</span>
      <div className="flex shrink-0 items-center gap-2">
        <form
          id={`role-form-${userId}`}
          action={formAction}
          className="flex items-center gap-2"
        >
          <input type="hidden" name="user_id" value={userId} />
          <Select
            name="role"
            defaultValue={role}
            onValueChange={() => {
              const form = document.getElementById(
                `role-form-${userId}`,
              ) as HTMLFormElement | null;
              form?.requestSubmit();
            }}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </form>
        {children}
      </div>
      {state.error ? (
        <span className="text-xs text-destructive">{state.error}</span>
      ) : null}
    </li>
  );
}
