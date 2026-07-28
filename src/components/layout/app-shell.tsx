import Link from "next/link";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { BottomNav } from "@/components/layout/bottom-nav";
import { FalahMark } from "@/components/layout/falah-mark";
import { LogoutButton } from "@/components/auth/logout-button";
import { roleLabel } from "@/lib/roles";
import type { ModuleAccess } from "@/lib/module-access";

export function AppShell({
  email,
  role,
  moduleAccess,
  children,
}: {
  email: string;
  role: string;
  moduleAccess: ModuleAccess;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1">
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 md:flex">
        <Link href="/" className="flex items-center gap-2.5 px-4">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary/10 text-sidebar-primary">
            <FalahMark className="size-4" />
          </span>
          <span className="font-heading text-xl font-semibold tracking-tight text-sidebar-foreground">
            Falah
          </span>
        </Link>
        <div className="mt-8 flex-1">
          <SidebarNav moduleAccess={moduleAccess} />
        </div>
        <div className="flex flex-col gap-3 border-t border-sidebar-border px-4 pt-4">
          <div className="flex flex-col">
            <span className="truncate text-sm font-medium text-sidebar-foreground">
              {email}
            </span>
            <span className="text-xs text-muted-foreground">
              {roleLabel(role)}
            </span>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FalahMark className="size-3.5" />
            </span>
            <span className="font-heading text-lg font-semibold tracking-tight">
              Falah
            </span>
          </Link>
          <LogoutButton />
        </header>

        <main className="flex-1 px-4 py-6 pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:px-8 md:py-8 md:pb-8">
          {children}
        </main>

        <BottomNav moduleAccess={moduleAccess} />
      </div>
    </div>
  );
}
