"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { updateUserProfile } from "@/app/(app)/admin/actions";
import { initialActionState } from "@/lib/action-state";
import { profileLabel } from "@/lib/profile-label";

export type EditableProfile = {
  id: string;
  email: string;
  contact_email: string | null;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  mobile: string | null;
};

export function EditUserSheet({ profile }: { profile: EditableProfile }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    updateUserProfile,
    initialActionState,
  );
  const realEmail = profile.contact_email ?? "";

  // Auto-close on success so the New password field (holding a plaintext
  // value) doesn't linger populated in the DOM after it's been saved.
  const wasSaving = useRef(false);
  useEffect(() => {
    if (wasSaving.current && !isPending && !state.error) {
      setOpen(false);
    }
    wasSaving.current = isPending;
  }, [isPending, state.error]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen(true)}
        aria-label={`Edit ${profileLabel(profile)}`}
      >
        <PencilIcon />
      </Button>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit user info</SheetTitle>
          <SheetDescription>{profileLabel(profile)}</SheetDescription>
        </SheetHeader>
        <form action={formAction} className="flex flex-col gap-4 px-4">
          <input type="hidden" name="user_id" value={profile.id} />
          <div className="flex flex-col gap-2">
            <Label htmlFor={`first_name-${profile.id}`}>First Name</Label>
            <Input
              id={`first_name-${profile.id}`}
              name="first_name"
              defaultValue={profile.first_name ?? ""}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`last_name-${profile.id}`}>Last Name</Label>
            <Input
              id={`last_name-${profile.id}`}
              name="last_name"
              defaultValue={profile.last_name ?? ""}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`username-${profile.id}`}>Username</Label>
            <Input
              id={`username-${profile.id}`}
              name="username"
              defaultValue={profile.username ?? ""}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`email-${profile.id}`}>Email (optional)</Label>
            <Input
              id={`email-${profile.id}`}
              name="email"
              type="email"
              defaultValue={realEmail}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`mobile-${profile.id}`}>Mobile</Label>
            <Input
              id={`mobile-${profile.id}`}
              name="mobile"
              type="tel"
              defaultValue={profile.mobile ?? ""}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`new_password-${profile.id}`}>New password</Label>
            <PasswordInput
              id={`new_password-${profile.id}`}
              name="new_password"
              autoComplete="new-password"
              placeholder="Leave blank to keep current password"
            />
          </div>
          {state.error ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}
          <SheetFooter className="p-0">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
