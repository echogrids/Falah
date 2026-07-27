"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { approveAdmin, rejectAdmin } from "@/app/(app)/admin/actions";
import { initialActionState } from "@/lib/action-state";

export function PendingAdminRow({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) {
  const [approveState, approveAction] = useActionState(
    approveAdmin,
    initialActionState,
  );
  const [rejectState, rejectAction] = useActionState(
    rejectAdmin,
    initialActionState,
  );

  return (
    <li className="flex items-center justify-between gap-4 border-b border-border py-3 text-sm last:border-0">
      <span className="truncate">{email}</span>
      <div className="flex items-center gap-2">
        <form action={approveAction}>
          <input type="hidden" name="user_id" value={userId} />
          <Button type="submit" size="sm">
            Approve
          </Button>
        </form>
        <form action={rejectAction}>
          <input type="hidden" name="user_id" value={userId} />
          <Button type="submit" size="sm" variant="outline">
            Reject
          </Button>
        </form>
      </div>
      {approveState.error ? (
        <span className="text-xs text-destructive">{approveState.error}</span>
      ) : null}
      {rejectState.error ? (
        <span className="text-xs text-destructive">{rejectState.error}</span>
      ) : null}
    </li>
  );
}
