"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logNiyyahCount } from "@/app/(app)/niyyah/actions";
import { initialActionState } from "@/lib/action-state";

export function AddCountForm({ niyyahId }: { niyyahId: string }) {
  const [state, formAction, isPending] = useActionState(
    logNiyyahCount,
    initialActionState,
  );
  const [count, setCount] = useState("");

  const wasPending = useRef(false);
  useEffect(() => {
    if (wasPending.current && !isPending && !state.error) {
      setCount("");
    }
    wasPending.current = isPending;
  }, [isPending, state.error]);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="niyyah_id" value={niyyahId} />
      <Label htmlFor="niyyah_count" className="sr-only">
        Count to add
      </Label>
      <div className="flex items-stretch gap-2">
        <Input
          id="niyyah_count"
          name="count"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="0"
          value={count}
          onChange={(event) => setCount(event.target.value.replace(/[^0-9]/g, ""))}
          className="h-14 flex-1 rounded-2xl text-center text-2xl font-semibold tabular-nums"
          autoComplete="off"
        />
        <Button
          type="submit"
          disabled={isPending || count === "" || Number(count) === 0}
          className="h-14 shrink-0 rounded-2xl px-6 text-base"
        >
          {isPending ? "Saving..." : "Add"}
        </Button>
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
    </form>
  );
}
