"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createInstitution, updateInstitution } from "@/app/(app)/charity/actions";
import { initialActionState } from "@/lib/action-state";

export function InstitutionForm({
  mode,
  institutionId,
  defaultValues,
  cancelHref,
}: {
  mode: "create" | "edit";
  institutionId?: string;
  defaultValues?: { name: string; notes: string | null };
  cancelHref: string;
}) {
  const [state, formAction, isPending] = useActionState(
    mode === "create" ? createInstitution : updateInstitution,
    initialActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {mode === "edit" ? (
        <input type="hidden" name="institution_id" value={institutionId} />
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Institution name</Label>
        <Input
          id="name"
          name="name"
          placeholder="e.g. Al-Noor Orphanage"
          defaultValue={defaultValues?.name}
          autoFocus
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Address, contact, cause…"
          defaultValue={defaultValues?.notes ?? ""}
          rows={3}
        />
      </div>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending} className="flex-1 sm:flex-none">
          {isPending ? "Saving..." : mode === "create" ? "Add Institution" : "Save changes"}
        </Button>
        <Button type="button" variant="outline" asChild className="flex-1 sm:flex-none">
          <Link href={cancelHref}>Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
