"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "@/components/layout/nav-items";
import type { ModuleAccess } from "@/lib/module-access";

export function SidebarNav({ moduleAccess }: { moduleAccess: ModuleAccess }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navItems
        .filter((item) => item.module === null || moduleAccess[item.module])
        .map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent",
              )}
            >
              <item.icon className="size-4.5" strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
    </nav>
  );
}
