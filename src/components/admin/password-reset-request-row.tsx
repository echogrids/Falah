"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { dismissPasswordResetRequest } from "@/app/(app)/admin/actions";
import { initialActionState } from "@/lib/action-state";
import { EditUserSheet, type EditableProfile } from "@/components/admin/edit-user-sheet";
import { formatDateTime } from "@/lib/format-date";

export function PasswordResetRequestRow({
  requestId,
  identifier,
  createdAt,
  profile,
}: {
  requestId: string;
  identifier: string;
  createdAt: string;
  profile: EditableProfile | null;
}) {
  const [state, dismissAction] = useActionState(
    dismissPasswordResetRequest,
    initialActionState,
  );

  return (
    <li className="flex flex-col gap-2 border-b border-border py-3 text-sm last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="min-w-0 truncate">
        {identifier}{" "}
        <span className="text-muted-foreground" suppressHydrationWarning>
          · requested {formatDateTime(createdAt)}
        </span>
      </span>
      <div className="flex items-center gap-2">
        {profile ? <EditUserSheet profile={profile} /> : null}
        <form action={dismissAction}>
          <input type="hidden" name="request_id" value={requestId} />
          <Button type="submit" size="sm" variant="outline">
            Dismiss
          </Button>
        </form>
      </div>
      {state.error ? (
        <span className="text-xs text-destructive">{state.error}</span>
      ) : null}
    </li>
  );
}
