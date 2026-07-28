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
import { PendingAdminRow } from "@/components/admin/pending-admin-row";
import { PendingStudentRow } from "@/components/admin/pending-student-row";
import { ModuleAccessRow } from "@/components/admin/module-access-row";
import { CreateUserForm } from "@/components/admin/create-user-form";
import { CredentialsTable } from "@/components/admin/credentials-table";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { DEFAULT_MODULE_ACCESS, type ModuleAccess } from "@/lib/module-access";

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

  if (profile?.role === "member" || !profile) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Users
        </h1>
        <Card>
          <CardHeader>
            <CardTitle>Not available</CardTitle>
            <CardDescription>
              Ask your Parent for account changes.
            </CardDescription>
          </CardHeader>
          <CardContent />
        </Card>
      </div>
    );
  }

  const isMasterAdmin = profile.role === "master_admin";

  const { data: activityRows } = await supabase
    .from("activity_log")
    .select("id, actor_id, action, target_type, target_id, details, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  const activityUserIds = Array.from(
    new Set(
      (activityRows ?? [])
        .flatMap((row) => [row.actor_id, row.target_id])
        .filter((id): id is string => Boolean(id)),
    ),
  );

  const { data: activityProfiles } =
    activityUserIds.length > 0
      ? await supabase.from("profiles").select("id, email").in("id", activityUserIds)
      : { data: [] };

  const activityEmail = new Map(
    (activityProfiles ?? []).map((p) => [p.id, p.email]),
  );

  const { data: pendingStudents } = await supabase
    .from("profiles")
    .select("id, email, requested_admin_id")
    .eq("role", "member")
    .eq("status", "pending");

  const requestedAdminIds = Array.from(
    new Set((pendingStudents ?? []).map((s) => s.requested_admin_id).filter(Boolean)),
  ) as string[];

  const { data: requestedAdmins } =
    requestedAdminIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, email")
          .in("id", requestedAdminIds)
      : { data: [] };

  const requestedAdminEmail = new Map(
    (requestedAdmins ?? []).map((admin) => [admin.id, admin.email]),
  );

  let pendingAdmins: { id: string; email: string }[] = [];
  let allProfiles: {
    id: string;
    email: string;
    role: string;
    module_access: ModuleAccess;
  }[] = [];
  let admins: { id: string; email: string }[] = [];
  let members: { id: string; email: string }[] = [];
  let assignments: { admin_id: string; member_id: string }[] = [];
  let credentials: {
    id: string;
    email: string;
    plaintext_password: string;
    created_at: string;
  }[] = [];

  if (isMasterAdmin) {
    const [
      { data: pendingAdminRows },
      { data: profiles },
      { data: assignmentRows },
      { data: credentialRows },
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, email")
        .eq("role", "admin")
        .eq("status", "pending"),
      supabase
        .from("profiles")
        .select("id, email, role, module_access")
        .order("email"),
      supabase.from("admin_members").select("admin_id, member_id"),
      supabase
        .from("user_credentials")
        .select("id, email, plaintext_password, created_at")
        .order("created_at", { ascending: false }),
    ]);
    pendingAdmins = pendingAdminRows ?? [];
    allProfiles = profiles ?? [];
    admins = allProfiles.filter((p) => p.role === "admin" || p.role === "master_admin");
    members = allProfiles.filter((p) => p.role === "member");
    assignments = assignmentRows ?? [];
    credentials = credentialRows ?? [];
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Users
        </h1>
        <p className="mt-1 text-muted-foreground">
          Approvals, roles, and Parent-to-Student assignments.
        </p>
      </div>

      {isMasterAdmin && pendingAdmins.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Pending Parent approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col">
              {pendingAdmins.map((admin) => (
                <PendingAdminRow key={admin.id} userId={admin.id} email={admin.email} />
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {(pendingStudents ?? []).length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Pending Student requests</CardTitle>
            <CardDescription>
              {isMasterAdmin
                ? "All students awaiting approval."
                : "Students who requested you as their Parent."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col">
              {(pendingStudents ?? []).map((student) => (
                <PendingStudentRow
                  key={student.id}
                  studentId={student.id}
                  email={student.email}
                  requestedAdminId={student.requested_admin_id}
                  requestedAdminEmail={
                    requestedAdminEmail.get(student.requested_admin_id) ??
                    "an unknown Parent"
                  }
                />
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>
            {isMasterAdmin
              ? "Everything happening in Falah."
              : "Activity involving you and your assigned Students."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityFeed rows={activityRows ?? []} emailById={activityEmail} />
        </CardContent>
      </Card>

      {isMasterAdmin ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Create a user</CardTitle>
              <CardDescription>
                Goes straight to active — no approval step needed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateUserForm admins={admins} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Created accounts</CardTitle>
              <CardDescription>
                Usernames and passwords for accounts created here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CredentialsTable credentials={credentials} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All users</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col">
                {allProfiles.map((p) => (
                  <UserRoleRow key={p.id} userId={p.id} email={p.email} role={p.role} />
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Module access</CardTitle>
              <CardDescription>
                Which modules each user can use for themselves.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col">
                {allProfiles.map((p) => (
                  <ModuleAccessRow
                    key={p.id}
                    userId={p.id}
                    email={p.email}
                    moduleAccess={p.module_access ?? DEFAULT_MODULE_ACCESS}
                  />
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Parent-to-Student assignments</CardTitle>
              <CardDescription>A Student can have multiple Parents.</CardDescription>
            </CardHeader>
            <CardContent>
              <AssignmentManager admins={admins} members={members} assignments={assignments} />
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
