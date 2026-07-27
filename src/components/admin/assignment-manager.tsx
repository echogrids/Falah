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
import {
  assignMember,
  unassignMember,
  adminInitialState,
} from "@/app/(app)/admin/actions";

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
    adminInitialState,
  );
  const [unassignState, unassignAction] = useActionState(
    unassignMember,
    adminInitialState,
  );

  const emailById = new Map(
    [...admins, ...members].map((profile) => [profile.id, profile.email]),
  );

  return (
    <div className="flex flex-col gap-4">
      <form action={assignAction} className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Admin</span>
          <Select name="admin_id">
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Choose an Admin" />
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
          <span className="text-sm font-medium">Member</span>
          <Select name="member_id">
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Choose a Member" />
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
        <Button type="submit" disabled={isAssigning}>
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
              className="flex items-center justify-between border-b border-border pb-2 text-sm last:border-0"
            >
              <span>
                {emailById.get(assignment.admin_id) ?? "Unknown"} manages{" "}
                {emailById.get(assignment.member_id) ?? "Unknown"}
              </span>
              <form action={unassignAction}>
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
