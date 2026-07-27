"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  logSponsorshipTransaction,
  sponsorshipInitialState,
} from "@/app/(app)/sponsorship/actions";

const TYPE_OPTIONS = [
  { value: "intended", label: "Intended" },
  { value: "donated", label: "Donated" },
  { value: "pending", label: "Pending" },
] as const;

export function LogTransactionForm() {
  const [state, formAction, isPending] = useActionState(
    logSponsorshipTransaction,
    sponsorshipInitialState,
  );

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-2">
        <Label htmlFor="type">Type</Label>
        <Select name="type" defaultValue="intended">
          <SelectTrigger id="type" className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          name="amount"
          min={0}
          step="0.01"
          className="w-32"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="note">Note</Label>
        <Input id="note" name="note" className="w-48" />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Log"}
      </Button>
      {state.error ? (
        <span className="text-sm text-destructive">{state.error}</span>
      ) : null}
    </form>
  );
}
