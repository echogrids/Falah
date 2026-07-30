"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { FalahMark } from "@/components/layout/falah-mark";
import { NavDrawer } from "@/components/layout/nav-drawer";
import { NotificationBell } from "@/components/layout/notification-bell";
import { ProfileSheet } from "@/components/layout/profile-sheet";
import { UserAvatar } from "@/components/layout/user-avatar";
import type { ModuleAccess } from "@/lib/module-access";

export function AppBar({
  displayName,
  role,
  moduleAccess,
}: {
  displayName: string;
  role: string;
  moduleAccess: ModuleAccess;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const isAdmin = role === "admin" || role === "master_admin";

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80">
        <div className="relative flex h-16 items-center justify-between px-3 sm:px-5">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setDrawerOpen(true)}
            className="flex size-11 shrink-0 items-center justify-center rounded-full text-foreground transition-colors duration-150 hover:bg-muted active:scale-95"
          >
            <Menu className="size-5" strokeWidth={2} />
          </button>

          <Link
            href="/"
            className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FalahMark className="size-3.5" />
            </span>
            <span className="font-heading text-lg font-semibold tracking-tight text-foreground">
              Falah
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-1">
            <NotificationBell />
            <button
              type="button"
              aria-label="Open profile menu"
              onClick={() => setProfileOpen(true)}
              className="rounded-full transition-transform duration-150 active:scale-95"
            >
              <UserAvatar name={displayName} />
            </button>
          </div>
        </div>
      </header>

      <NavDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        moduleAccess={moduleAccess}
        isAdmin={isAdmin}
      />
      <ProfileSheet
        open={profileOpen}
        onOpenChange={setProfileOpen}
        displayName={displayName}
        role={role}
        isAdmin={isAdmin}
      />
    </>
  );
}
