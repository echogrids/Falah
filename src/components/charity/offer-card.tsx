"use client";

import { useActionState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { recordCharityPayment } from "@/app/(app)/charity/actions";
import { initialActionState } from "@/lib/action-state";
import { formatMoney } from "@/lib/format-currency";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  partial: "bg-accent/15 text-accent",
  fulfilled: "bg-primary/15 text-primary",
  cancelled: "bg-destructive/15 text-destructive",
};

export type PaymentEntry = {
  id: string;
  amount: number;
  remarks: string | null;
  created_at: string;
};

export function OfferCard({
  offerId,
  institutionName,
  amount,
  currency,
  paidTotal,
  status,
  remarks,
  canManage,
  payments,
}: {
  offerId: string;
  institutionName: string;
  amount: number;
  currency: string;
  paidTotal: number;
  status: string;
  remarks: string | null;
  canManage: boolean;
  payments: PaymentEntry[];
}) {
  const [state, formAction, isPending] = useActionState(
    recordCharityPayment,
    initialActionState,
  );

  return (
    <Card size="sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="truncate">{institutionName}</CardTitle>
            <CardDescription>
              {formatMoney(paidTotal, currency)} of {formatMoney(amount, currency)} paid
            </CardDescription>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize",
              STATUS_STYLES[status] ?? STATUS_STYLES.pending,
            )}
          >
            {status}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {remarks ? <p className="text-sm text-muted-foreground">{remarks}</p> : null}

        {payments.length > 0 ? (
          <ul className="flex flex-col gap-1 border-t border-border pt-2">
            {payments.map((payment) => (
              <li
                key={payment.id}
                className="flex items-center justify-between gap-2 text-xs text-muted-foreground"
              >
                <span className="min-w-0 truncate">
                  {new Date(payment.created_at).toLocaleDateString()}
                  {payment.remarks ? ` · ${payment.remarks}` : ""}
                </span>
                <span className="shrink-0 font-medium text-foreground">
                  {formatMoney(payment.amount, currency)}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        {canManage && status !== "cancelled" && status !== "fulfilled" ? (
          <form
            action={formAction}
            className="flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center"
          >
            <input type="hidden" name="offer_id" value={offerId} />
            <Input
              type="number"
              name="amount"
              min={0}
              step="0.01"
              placeholder={`Amount (${currency})`}
              required
              className="w-full sm:w-36"
            />
            <Input
              name="remarks"
              placeholder="Remarks"
              className="w-full sm:flex-1"
            />
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              {isPending ? "Saving..." : "Record payment"}
            </Button>
          </form>
        ) : null}
        {state.error ? (
          <span className="text-sm text-destructive">{state.error}</span>
        ) : null}
      </CardContent>
    </Card>
  );
}
