"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "@/components/layout/nav-items";
import { FalahMark } from "@/components/layout/falah-mark";
import type { ModuleAccess } from "@/lib/module-access";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function NavDrawer({
  open,
  onOpenChange,
  moduleAccess,
  isAdmin,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleAccess: ModuleAccess;
  isAdmin: boolean;
}) {
  const pathname = usePathname();

  const visibleItems = navItems.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.module && !moduleAccess[item.module]) return false;
    return true;
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-4/5 max-w-xs gap-0 p-0">
        <SheetHeader className="flex-row items-center gap-2.5 border-b border-border px-4 py-4">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FalahMark className="size-4" />
          </span>
          <SheetTitle className="font-heading text-lg font-semibold tracking-tight">
            Falah
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex min-h-12 items-center gap-3 rounded-xl px-3 text-[15px] font-medium transition-colors duration-150 active:scale-[0.98]",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted",
                )}
              >
                <item.icon className="size-5 shrink-0" strokeWidth={2} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
