"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createNiyyah, updateNiyyah } from "@/app/(app)/niyyah/actions";
import { initialActionState } from "@/lib/action-state";

export function NiyyahForm({
  mode,
  memberId,
  niyyahId,
  defaultValues,
  cancelHref,
}: {
  mode: "create" | "edit";
  memberId: string;
  niyyahId?: string;
  defaultValues?: {
    title: string;
    intention: string | null;
    target_count: number;
    deadline: string | null;
  };
  cancelHref: string;
}) {
  const [state, formAction, isPending] = useActionState(
    mode === "create" ? createNiyyah : updateNiyyah,
    initialActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {mode === "create" ? (
        <input type="hidden" name="member_id" value={memberId} />
      ) : (
        <input type="hidden" name="niyyah_id" value={niyyahId} />
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="e.g. Subhanallahi wa bihamdih"
          defaultValue={defaultValues?.title}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="intention">Intention (optional)</Label>
        <Textarea
          id="intention"
          name="intention"
          placeholder="e.g. For my late grandmother, Fatima"
          defaultValue={defaultValues?.intention ?? ""}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="target_count">Target count</Label>
          <Input
            id="target_count"
            name="target_count"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="e.g. 70000"
            defaultValue={defaultValues?.target_count}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="deadline">Deadline (optional)</Label>
          <Input
            id="deadline"
            name="deadline"
            type="date"
            defaultValue={defaultValues?.deadline ?? ""}
          />
        </div>
      </div>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending} className="flex-1 sm:flex-none">
          {isPending ? "Saving..." : mode === "create" ? "Add Niyyah" : "Save changes"}
        </Button>
        <Button type="button" variant="outline" asChild className="flex-1 sm:flex-none">
          <Link href={cancelHref}>Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
