import { SidebarNav } from "@/components/layout/sidebar-nav";
import { BottomNav } from "@/components/layout/bottom-nav";
import { LogoutButton } from "@/components/auth/logout-button";

const roleLabels: Record<string, string> = {
  master_admin: "Master Admin",
  admin: "Admin",
  member: "Member",
};

export function AppShell({
  email,
  role,
  children,
}: {
  email: string;
  role: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 md:flex">
        <span className="px-4 font-heading text-xl font-semibold text-sidebar-foreground">
          Falah
        </span>
        <div className="mt-8 flex-1">
          <SidebarNav />
        </div>
        <div className="flex flex-col gap-3 border-t border-sidebar-border px-4 pt-4">
          <div className="flex flex-col">
            <span className="truncate text-sm font-medium text-sidebar-foreground">
              {email}
            </span>
            <span className="text-xs text-muted-foreground">
              {roleLabels[role] ?? role}
            </span>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
          <span className="font-heading text-lg font-semibold">Falah</span>
          <LogoutButton />
        </header>

        <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-8">
          {children}
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
