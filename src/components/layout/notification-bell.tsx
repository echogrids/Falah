"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function NotificationBell({
  pendingApprovals,
  pendingPasswordResets,
}: {
  pendingApprovals: number;
  pendingPasswordResets: number;
}) {
  const [open, setOpen] = useState(false);

  const notifications = [
    pendingApprovals > 0
      ? {
          id: "approvals",
          title: `${pendingApprovals} pending ${pendingApprovals === 1 ? "approval" : "approvals"}`,
          detail: "Review requests waiting in Family.",
        }
      : null,
    pendingPasswordResets > 0
      ? {
          id: "password-resets",
          title: `${pendingPasswordResets} password reset ${pendingPasswordResets === 1 ? "request" : "requests"}`,
          detail: "Resolve them in Family → Overview.",
        }
      : null,
  ].filter((n): n is { id: string; title: string; detail: string } => n !== null);

  // No actionable notifications: hide the bell entirely instead of showing
  // an empty state.
  if (notifications.length === 0) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex size-11 shrink-0 items-center justify-center rounded-full text-foreground transition-colors duration-150 hover:bg-muted active:scale-95"
        >
          <Bell className="size-5" strokeWidth={2} />
          <span
            aria-hidden="true"
            className="absolute top-2.5 right-2.5 flex size-2.5 rounded-full bg-destructive ring-2 ring-card"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="border-b border-border px-4 py-3">
          <p className="font-heading text-sm font-semibold text-foreground">
            Notifications
          </p>
        </div>
        <ul className="flex flex-col">
          {notifications.map((notification) => (
            <li key={notification.id} className="border-b border-border last:border-0">
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex flex-col gap-0.5 px-4 py-3 transition-colors hover:bg-muted"
              >
                <span className="text-sm font-medium text-foreground">
                  {notification.title}
                </span>
                <span className="text-xs text-muted-foreground">{notification.detail}</span>
              </Link>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
