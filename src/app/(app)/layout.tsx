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
    >
      {children}
    </AppShell>
  );
}
