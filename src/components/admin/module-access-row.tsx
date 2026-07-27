"use client";

import { useActionState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  updateModuleAccess,
  adminInitialState,
} from "@/app/(app)/admin/actions";
import type { ModuleAccess } from "@/lib/module-access";

const MODULES: { key: keyof ModuleAccess; label: string }[] = [
  { key: "ibadah", label: "Ibadah" },
  { key: "qala", label: "Qala" },
  { key: "sponsorship", label: "Sponsorship" },
  { key: "reports", label: "Reports" },
];

export function ModuleAccessRow({
  userId,
  email,
  moduleAccess,
}: {
  userId: string;
  email: string;
  moduleAccess: ModuleAccess;
}) {
  const [state, formAction] = useActionState(
    updateModuleAccess,
    adminInitialState,
  );

  return (
    <li className="flex flex-col gap-2 border-b border-border py-3 text-sm last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="truncate">{email}</span>
      <form
        action={formAction}
        className="flex flex-wrap items-center gap-4"
        onChange={(event) => {
          (event.currentTarget as HTMLFormElement).requestSubmit();
        }}
      >
        <input type="hidden" name="user_id" value={userId} />
        {MODULES.map((module) => (
          <label key={module.key} className="flex items-center gap-1.5 text-xs">
            <Checkbox
              name={module.key}
              defaultChecked={moduleAccess[module.key]}
            />
            {module.label}
          </label>
        ))}
      </form>
      {state.error ? (
        <span className="text-xs text-destructive">{state.error}</span>
      ) : null}
    </li>
  );
}
