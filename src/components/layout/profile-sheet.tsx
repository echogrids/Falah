"use client";

import Link from "next/link";
import {
  ChevronRight,
  User,
  Users,
  Settings,
  Languages,
  SunMoon,
  Info,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { UserAvatar } from "@/components/layout/user-avatar";
import { roleLabel } from "@/lib/roles";
import { logout } from "@/app/logout/actions";

function ProfileLink({
  href,
  icon: Icon,
  label,
  onNavigate,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-[15px] font-medium text-foreground transition-colors duration-150 hover:bg-muted active:scale-[0.98]"
    >
      <Icon className="size-5 shrink-0 text-muted-foreground" strokeWidth={2} />
      <span className="flex-1">{label}</span>
      <ChevronRight className="size-4 text-muted-foreground/60" />
    </Link>
  );
}

// Language/Theme have no real switching logic behind them yet — shown as
// inert rows (current value only) rather than wired-up controls, same
// "structure without backend" treatment as the notification bell.
function ProfileRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-[15px] font-medium text-muted-foreground">
      <Icon className="size-5 shrink-0" strokeWidth={2} />
      <span className="flex-1">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

export function ProfileSheet({
  open,
  onOpenChange,
  displayName,
  role,
  isAdmin,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  displayName: string;
  role: string;
  isAdmin: boolean;
}) {
  const close = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="gap-0 rounded-t-3xl p-0 pb-[calc(1rem+env(safe-area-inset-bottom))]"
      >
        <SheetHeader className="flex-row items-center gap-3 border-b border-border px-5 py-5">
          <UserAvatar name={displayName} size="lg" />
          <div className="flex min-w-0 flex-col">
            <SheetTitle className="truncate text-base font-semibold">
              {displayName}
            </SheetTitle>
            <span className="text-sm text-muted-foreground">{roleLabel(role)}</span>
          </div>
        </SheetHeader>

        <nav className="flex flex-col px-2 py-2">
          <ProfileLink href="/profile" icon={User} label="Profile" onNavigate={close} />
          {isAdmin ? (
            <ProfileLink href="/admin" icon={Users} label="Family" onNavigate={close} />
          ) : null}
          <ProfileLink href="/settings" icon={Settings} label="Settings" onNavigate={close} />
          <ProfileRow icon={Languages} label="Language" value="English" />
          <ProfileRow icon={SunMoon} label="Theme" value="Light" />
          <ProfileLink href="/about" icon={Info} label="About" onNavigate={close} />
        </nav>

        <form action={logout} className="border-t border-border px-2 pt-2">
          <button
            type="submit"
            className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-[15px] font-medium text-destructive transition-colors duration-150 hover:bg-destructive/10 active:scale-[0.98]"
          >
            <LogOut className="size-5 shrink-0" strokeWidth={2} />
            Sign Out
          </button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
