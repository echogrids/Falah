import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { LogoutButton } from "@/components/auth/logout-button";
import { DEFAULT_MODULE_ACCESS, type ModuleAccess } from "@/lib/module-access";
import { displayName } from "@/lib/profile-label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  // Middleware already validated this request's JWT against Supabase's
  // Auth server (see lib/supabase/middleware.ts); a second network round
  // trip here would just re-check the same thing, so read the session
  // locally instead of calling getUser() again.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status, module_access, first_name, last_name, username, email")
    .eq("id", user?.id)
    .single();

  const isAdminRole = profile?.role === "admin" || profile?.role === "master_admin";

  let pendingApprovals = 0;
  let pendingPasswordResets = 0;

  if (profile?.status === "active" && isAdminRole) {
    // RLS already scopes what each caller sees: a regular Admin gets only
    // students who requested them, Master Admin gets every pending row.
    const [{ count: approvalsCount }, { count: resetsCount }] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("status", "pending"),
      profile.role === "master_admin"
        ? supabase
            .from("password_reset_requests")
            .select("id", { count: "exact", head: true })
            .eq("status", "pending")
        : Promise.resolve({ count: 0 }),
    ]);
    pendingApprovals = approvalsCount ?? 0;
    pendingPasswordResets = resetsCount ?? 0;
  }

  if (profile && profile.status !== "active") {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>
              {profile.status === "pending" ? "Awaiting approval" : "Request declined"}
            </CardTitle>
            <CardDescription>
              {profile.status === "pending"
                ? "Your account is waiting for a Parent or Master Admin to approve it."
                : "Your request wasn't approved. Contact your Parent or Master Admin."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LogoutButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AppShell
      displayName={profile ? displayName(profile) : (user?.email ?? "")}
      role={profile?.role ?? "member"}
      moduleAccess={(profile?.module_access as ModuleAccess) ?? DEFAULT_MODULE_ACCESS}
      pendingApprovals={pendingApprovals}
      pendingPasswordResets={pendingPasswordResets}
    >
      {children}
    </AppShell>
  );
}
