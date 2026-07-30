import { AppBar } from "@/components/layout/app-bar";
import type { ModuleAccess } from "@/lib/module-access";

export function AppShell({
  displayName,
  role,
  moduleAccess,
  children,
}: {
  displayName: string;
  role: string;
  moduleAccess: ModuleAccess;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppBar displayName={displayName} role={role} moduleAccess={moduleAccess} />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6 pb-[calc(2rem+env(safe-area-inset-bottom))] md:px-8 md:py-8">
        {children}
      </main>
    </div>
  );
}
