import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserRoleRow } from "@/components/admin/user-role-row";
import { AssignmentManager } from "@/components/admin/assignment-manager";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single();

  if (profile?.role !== "master_admin") {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Users
        </h1>
        <Card>
          <CardHeader>
            <CardTitle>Master Admin only</CardTitle>
            <CardDescription>
              Ask your Master Admin for account or assignment changes.
            </CardDescription>
          </CardHeader>
          <CardContent />
        </Card>
      </div>
    );
  }

  const [{ data: profiles }, { data: assignments }] = await Promise.all([
    supabase.from("profiles").select("id, email, role").order("email"),
    supabase.from("admin_members").select("admin_id, member_id"),
  ]);

  const admins = (profiles ?? []).filter(
    (p) => p.role === "admin" || p.role === "master_admin",
  );
  const members = (profiles ?? []).filter((p) => p.role === "member");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Users
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage roles and Admin-to-Member assignments.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All users</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col">
            {(profiles ?? []).map((p) => (
              <UserRoleRow key={p.id} userId={p.id} email={p.email} role={p.role} />
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin-to-Member assignments</CardTitle>
          <CardDescription>
            A Member can have multiple Admins.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AssignmentManager
            admins={admins}
            members={members}
            assignments={assignments ?? []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
