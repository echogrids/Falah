import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { LogoutButton } from "@/components/auth/logout-button";
import { DEFAULT_MODULE_ACCESS, type ModuleAccess } from "@/lib/module-access";
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status, module_access")
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
      email={user?.email ?? ""}
      role={profile?.role ?? "member"}
      moduleAccess={(profile?.module_access as ModuleAccess) ?? DEFAULT_MODULE_ACCESS}
    >
      {children}
    </AppShell>
  );
}
