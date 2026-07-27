"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { assignMember, unassignMember } from "@/app/(app)/admin/actions";
import { initialActionState } from "@/lib/action-state";

type Profile = { id: string; email: string };
type Assignment = { admin_id: string; member_id: string };

export function AssignmentManager({
  admins,
  members,
  assignments,
}: {
  admins: Profile[];
  members: Profile[];
  assignments: Assignment[];
}) {
  const [assignState, assignAction, isAssigning] = useActionState(
    assignMember,
    initialActionState,
  );
  const [unassignState, unassignAction] = useActionState(
    unassignMember,
    initialActionState,
  );

  const emailById = new Map(
    [...admins, ...members].map((profile) => [profile.id, profile.email]),
  );

  return (
    <div className="flex flex-col gap-4">
      <form action={assignAction} className="flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Parent</span>
          <Select name="admin_id">
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Choose a Parent" />
            </SelectTrigger>
            <SelectContent>
              {admins.map((admin) => (
                <SelectItem key={admin.id} value={admin.id}>
                  {admin.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Student</span>
          <Select name="member_id">
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Choose a Student" />
            </SelectTrigger>
            <SelectContent>
              {members.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={isAssigning} className="w-full sm:w-auto">
          Assign
        </Button>
        {assignState.error ? (
          <span className="text-sm text-destructive">
            {assignState.error}
          </span>
        ) : null}
      </form>

      <ul className="flex flex-col gap-2">
        {assignments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No assignments yet.
          </p>
        ) : (
          assignments.map((assignment) => (
            <li
              key={`${assignment.admin_id}-${assignment.member_id}`}
              className="flex flex-wrap items-center justify-between gap-2 border-b border-border py-2 text-sm last:border-0"
            >
              <span>
                {emailById.get(assignment.admin_id) ?? "Unknown"} manages{" "}
                {emailById.get(assignment.member_id) ?? "Unknown"}
              </span>
              <form action={unassignAction} className="shrink-0">
                <input type="hidden" name="admin_id" value={assignment.admin_id} />
                <input
                  type="hidden"
                  name="member_id"
                  value={assignment.member_id}
                />
                <Button type="submit" size="sm" variant="outline">
                  Remove
                </Button>
              </form>
            </li>
          ))
        )}
      </ul>
      {unassignState.error ? (
        <span className="text-sm text-destructive">
          {unassignState.error}
        </span>
      ) : null}
    </div>
  );
}
