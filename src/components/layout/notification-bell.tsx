"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// UI structure only — no notifications backend exists yet, so this is
// static placeholder content, not wired to any real data source.
const PLACEHOLDER_NOTIFICATIONS = [
  {
    id: "1",
    title: "Asr is coming up",
    detail: "Log it once you've prayed.",
    time: "Just now",
  },
  {
    id: "2",
    title: "Zād balance pending",
    detail: "A couple of meals are still awaiting payment.",
    time: "Yesterday",
  },
];

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const hasUnread = PLACEHOLDER_NOTIFICATIONS.length > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex size-11 shrink-0 items-center justify-center rounded-full text-foreground transition-colors duration-150 hover:bg-muted active:scale-95"
        >
          <Bell className="size-5" strokeWidth={2} />
          {hasUnread ? (
            <span
              aria-hidden="true"
              className="absolute top-2.5 right-2.5 flex size-2.5 rounded-full bg-destructive ring-2 ring-card"
            />
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="border-b border-border px-4 py-3">
          <p className="font-heading text-sm font-semibold text-foreground">
            Notifications
          </p>
        </div>
        <ul className="flex flex-col">
          {PLACEHOLDER_NOTIFICATIONS.map((notification) => (
            <li
              key={notification.id}
              className="flex flex-col gap-0.5 border-b border-border px-4 py-3 last:border-0"
            >
              <span className="text-sm font-medium text-foreground">
                {notification.title}
              </span>
              <span className="text-xs text-muted-foreground">{notification.detail}</span>
              <span className="mt-0.5 text-[11px] text-muted-foreground/70">
                {notification.time}
              </span>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
