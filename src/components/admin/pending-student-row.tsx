"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { approveStudent, rejectStudent } from "@/app/(app)/admin/actions";
import { initialActionState } from "@/lib/action-state";

export function PendingStudentRow({
  studentId,
  email,
  requestedAdminId,
  requestedAdminEmail,
}: {
  studentId: string;
  email: string;
  requestedAdminId: string;
  requestedAdminEmail: string;
}) {
  const [approveState, approveAction] = useActionState(
    approveStudent,
    initialActionState,
  );
  const [rejectState, rejectAction] = useActionState(
    rejectStudent,
    initialActionState,
  );

  return (
    <li className="flex items-center justify-between gap-4 border-b border-border py-3 text-sm last:border-0">
      <span className="truncate">
        {email}{" "}
        <span className="text-muted-foreground">
          → requested {requestedAdminEmail}
        </span>
      </span>
      <div className="flex items-center gap-2">
        <form action={approveAction}>
          <input type="hidden" name="student_id" value={studentId} />
          <input type="hidden" name="admin_id" value={requestedAdminId} />
          <Button type="submit" size="sm">
            Approve
          </Button>
        </form>
        <form action={rejectAction}>
          <input type="hidden" name="student_id" value={studentId} />
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
