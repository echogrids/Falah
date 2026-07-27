"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems } from "@/components/layout/nav-items";
import type { ModuleAccess } from "@/lib/module-access";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function BottomNav({ moduleAccess }: { moduleAccess: ModuleAccess }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const visibleItems = navItems.filter(
    (item) => item.module === null || moduleAccess[item.module],
  );
  const primaryItems = visibleItems.filter((item) => item.primary);
  const secondaryItems = visibleItems.filter((item) => !item.primary);
  const isSecondaryActive = secondaryItems.some((item) => item.href === pathname);

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-card/95 backdrop-blur md:hidden">
        <ul className="flex items-stretch justify-between px-1">
          {primaryItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className={cn(
                    "flex min-h-11 flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-medium",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <item.icon className="size-5" strokeWidth={isActive ? 2.5 : 2} />
                  {item.label}
                </Link>
              </li>
            );
          })}
          {secondaryItems.length > 0 ? (
            <li className="flex-1">
              <button
                type="button"
                onClick={() => setMoreOpen(true)}
                className={cn(
                  "flex min-h-11 w-full flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-medium",
                  isSecondaryActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                <MoreHorizontal
                  className="size-5"
                  strokeWidth={isSecondaryActive ? 2.5 : 2}
                />
                More
              </button>
            </li>
          ) : null}
        </ul>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="pb-8">
          <SheetHeader>
            <SheetTitle>More</SheetTitle>
          </SheetHeader>
          <ul className="flex flex-col gap-1 px-4">
            {secondaryItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex min-h-12 items-center gap-3 rounded-xl px-3 text-base font-medium",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    <item.icon className="size-5" strokeWidth={2} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </SheetContent>
      </Sheet>
    </>
  );
}
