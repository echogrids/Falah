"use client";

import { useActionState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { updateModuleAccess } from "@/app/(app)/admin/actions";
import { initialActionState } from "@/lib/action-state";
import type { ModuleAccess } from "@/lib/module-access";

const MODULES: { key: keyof ModuleAccess; label: string }[] = [
  { key: "ibadah", label: "Munājāh" },
  { key: "qala", label: "Qala" },
  { key: "sponsorship", label: "Zād" },
  { key: "charity", label: "Sadaqah" },
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
    initialActionState,
  );

  return (
    <li className="flex flex-col gap-2 border-b border-border py-3 text-sm last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="min-w-0 truncate">{email}</span>
      <form
        action={formAction}
        className="grid grid-cols-2 gap-x-4 gap-y-2 sm:flex sm:flex-wrap sm:items-center"
        onChange={(event) => {
          (event.currentTarget as HTMLFormElement).requestSubmit();
        }}
      >
        <input type="hidden" name="user_id" value={userId} />
        {MODULES.map((module) => (
          <label key={module.key} className="flex items-center gap-2 text-sm">
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
