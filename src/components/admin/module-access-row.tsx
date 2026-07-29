"use client";

import { useRef, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { updateModuleAccess } from "@/app/(app)/admin/actions";
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
  const [access, setAccess] = useState(moduleAccess);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Toggling checkboxes quickly used to fire one request per change; if an
  // earlier request happened to resolve after a later one, it would
  // silently overwrite the newer state and the checkbox looked "reverted."
  // These refs serialize saves and always send the latest desired state,
  // so out-of-order responses can never undo a more recent toggle.
  const savingRef = useRef(false);
  const latestRef = useRef(moduleAccess);

  async function persist(next: ModuleAccess) {
    latestRef.current = next;
    if (savingRef.current) return;
    savingRef.current = true;
    setIsSaving(true);
    let target = next;
    for (;;) {
      target = latestRef.current;
      const result = await updateModuleAccess(userId, target);
      setError(result.error);
      if (latestRef.current === target) break;
    }
    savingRef.current = false;
    setIsSaving(false);
  }

  function toggle(key: keyof ModuleAccess, checked: boolean) {
    const next = { ...access, [key]: checked };
    setAccess(next);
    persist(next);
  }

  return (
    <li className="flex flex-col gap-2 border-b border-border py-3 text-sm last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="min-w-0 truncate">{email}</span>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:flex sm:flex-wrap sm:items-center">
        {MODULES.map((module) => (
          <label key={module.key} className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={access[module.key]}
              onCheckedChange={(checked) => toggle(module.key, checked === true)}
            />
            {module.label}
          </label>
        ))}
      </div>
      {error ? (
        <span className="text-xs text-destructive">{error}</span>
      ) : isSaving ? (
        <span className="text-xs text-muted-foreground">Saving…</span>
      ) : null}
    </li>
  );
}
