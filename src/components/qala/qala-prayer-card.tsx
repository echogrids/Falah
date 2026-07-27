"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  completeQala,
  setQalaBalance,
  adjustQalaBalance,
} from "@/app/(app)/qala/actions";
import { initialActionState } from "@/lib/action-state";

export function QalaPrayerCard({
  memberId,
  prayerKey,
  label,
  arabic,
  balance,
  canManage,
}: {
  memberId: string;
  prayerKey: string;
  label: string;
  arabic: string;
  balance: { initial_balance: number; current_balance: number } | null;
  canManage: boolean;
}) {
  const [completeState, completeAction, isCompleting] = useActionState(
    completeQala,
    initialActionState,
  );
  const [setState, setAction, isSetting] = useActionState(
    setQalaBalance,
    initialActionState,
  );
  const [adjustState, adjustAction, isAdjusting] = useActionState(
    adjustQalaBalance,
    initialActionState,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-baseline gap-2">
          {label}
          <span className="font-arabic text-sm font-normal text-muted-foreground">
            {arabic}
          </span>
        </CardTitle>
        <CardDescription>
          {balance
            ? `${balance.current_balance} of ${balance.initial_balance} outstanding`
            : "No balance set yet"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {balance ? (
          <form action={completeAction} className="flex flex-col gap-2">
            <input type="hidden" name="member_id" value={memberId} />
            <input type="hidden" name="prayer" value={prayerKey} />
            <Button
              type="submit"
              disabled={isCompleting || balance.current_balance <= 0}
              className="w-full sm:w-auto"
            >
              Mark one done
            </Button>
            {completeState.error ? (
              <span className="text-sm text-destructive">
                {completeState.error}
              </span>
            ) : null}
          </form>
        ) : canManage ? (
          <form action={setAction} className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input type="hidden" name="member_id" value={memberId} />
            <input type="hidden" name="prayer" value={prayerKey} />
            <Input
              type="number"
              name="initial_balance"
              min={0}
              placeholder="Outstanding count"
              className="w-full sm:w-40"
            />
            <Button type="submit" disabled={isSetting} className="w-full sm:w-auto">
              Set balance
            </Button>
            {setState.error ? (
              <span className="text-sm text-destructive">
                {setState.error}
              </span>
            ) : null}
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">
            Ask a Parent to set your starting balance.
          </p>
        )}

        {balance && canManage ? (
          <form
            action={adjustAction}
            className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:flex-wrap"
          >
            <input type="hidden" name="member_id" value={memberId} />
            <input type="hidden" name="prayer" value={prayerKey} />
            <Input
              type="number"
              name="delta"
              placeholder="+/- adjustment"
              className="w-full sm:w-32"
            />
            <Input name="reason" placeholder="Reason" className="w-full sm:w-48" />
            <Button
              type="submit"
              disabled={isAdjusting}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Adjust
            </Button>
            {adjustState.error ? (
              <span className="text-sm text-destructive">
                {adjustState.error}
              </span>
            ) : null}
          </form>
        ) : null}
      </CardContent>
    </Card>
  );
}
