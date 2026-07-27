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
  qalaInitialState,
} from "@/app/(app)/qala/actions";

export function QalaPrayerCard({
  prayerKey,
  label,
  arabic,
  balance,
  canManage,
}: {
  prayerKey: string;
  label: string;
  arabic: string;
  balance: { initial_balance: number; current_balance: number } | null;
  canManage: boolean;
}) {
  const [completeState, completeAction, isCompleting] = useActionState(
    completeQala,
    qalaInitialState,
  );
  const [setState, setAction, isSetting] = useActionState(
    setQalaBalance,
    qalaInitialState,
  );
  const [adjustState, adjustAction, isAdjusting] = useActionState(
    adjustQalaBalance,
    qalaInitialState,
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
          <form action={completeAction} className="flex items-center gap-3">
            <input type="hidden" name="prayer" value={prayerKey} />
            <Button
              type="submit"
              disabled={isCompleting || balance.current_balance <= 0}
              size="sm"
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
          <form action={setAction} className="flex items-center gap-3">
            <input type="hidden" name="prayer" value={prayerKey} />
            <Input
              type="number"
              name="initial_balance"
              min={0}
              placeholder="Outstanding count"
              className="w-40"
            />
            <Button type="submit" disabled={isSetting} size="sm">
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
            Ask an Admin to set your starting balance.
          </p>
        )}

        {balance && canManage ? (
          <form
            action={adjustAction}
            className="flex flex-wrap items-center gap-2 border-t border-border pt-4"
          >
            <input type="hidden" name="prayer" value={prayerKey} />
            <Input
              type="number"
              name="delta"
              placeholder="+/- adjustment"
              className="w-32"
            />
            <Input name="reason" placeholder="Reason" className="w-48" />
            <Button type="submit" disabled={isAdjusting} size="sm" variant="outline">
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
