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
import { PasswordResetRequestRow } from "@/components/admin/password-reset-request-row";
import { ModuleAccessRow } from "@/components/admin/module-access-row";
import { CreateUserForm } from "@/components/admin/create-user-form";
import { CredentialsTable } from "@/components/admin/credentials-table";
import { EditUserSheet } from "@/components/admin/edit-user-sheet";
import { DeleteUserButton } from "@/components/admin/delete-user-button";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEFAULT_MODULE_ACCESS, type ModuleAccess } from "@/lib/module-access";
import { profileLabel } from "@/lib/profile-label";

export default async function AdminPage() {
  const supabase = await createClient();
  // Middleware already validated this request's JWT against Supabase's
  // Auth server; read the session locally instead of re-validating.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

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

  const [{ data: activityRows }, { data: pendingStudents }] = await Promise.all([
    isMasterAdmin
      ? supabase
          .from("activity_log")
          .select("id, actor_id, action, target_type, target_id, details, created_at")
          .order("created_at", { ascending: false })
          .limit(50)
      : Promise.resolve({ data: [] }),
    supabase
      .from("profiles")
      .select("id, email, username, requested_admin_id")
      .eq("role", "member")
      .eq("status", "pending"),
  ]);

  const activityUserIds = Array.from(
    new Set(
      (activityRows ?? [])
        .flatMap((row) => [row.actor_id, row.target_id])
        .filter((id): id is string => Boolean(id)),
    ),
  );

  const requestedAdminIds = Array.from(
    new Set((pendingStudents ?? []).map((s) => s.requested_admin_id).filter(Boolean)),
  ) as string[];

  const [{ data: activityProfiles }, { data: requestedAdmins }] = await Promise.all([
    activityUserIds.length > 0
      ? supabase.from("profiles").select("id, email, username").in("id", activityUserIds)
      : Promise.resolve({ data: [] }),
    requestedAdminIds.length > 0
      ? supabase.from("profiles").select("id, email, username").in("id", requestedAdminIds)
      : Promise.resolve({ data: [] }),
  ]);

  const activityEmail = new Map(
    (activityProfiles ?? []).map((p) => [p.id, profileLabel(p)]),
  );

  const requestedAdminEmail = new Map(
    (requestedAdmins ?? []).map((admin) => [admin.id, profileLabel(admin)]),
  );

  let pendingAdmins: { id: string; email: string; username: string | null }[] = [];
  let allProfiles: {
    id: string;
    email: string;
    contact_email: string | null;
    role: string;
    module_access: ModuleAccess;
    first_name: string | null;
    last_name: string | null;
    username: string | null;
    mobile: string | null;
  }[] = [];
  let admins: { id: string; email: string; username: string | null }[] = [];
  let members: { id: string; email: string; username: string | null }[] = [];
  let assignments: { admin_id: string; member_id: string }[] = [];
  let credentials: {
    id: string;
    email: string;
    username: string | null;
    plaintext_password: string;
    created_at: string;
  }[] = [];
  let passwordResetRequests: {
    id: string;
    identifier: string;
    profile_id: string | null;
    created_at: string;
  }[] = [];

  if (isMasterAdmin) {
    const [
      { data: pendingAdminRows },
      { data: profiles },
      { data: assignmentRows },
      { data: credentialRows },
      { data: resetRequestRows },
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, email, username")
        .eq("role", "admin")
        .eq("status", "pending"),
      supabase
        .from("profiles")
        .select(
          "id, email, contact_email, role, module_access, first_name, last_name, username, mobile",
        )
        .order("email"),
      supabase.from("admin_members").select("admin_id, member_id"),
      supabase
        .from("user_credentials")
        .select("id, user_id, email, plaintext_password, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("password_reset_requests")
        .select("id, identifier, profile_id, created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: false }),
    ]);
    pendingAdmins = pendingAdminRows ?? [];
    allProfiles = profiles ?? [];
    admins = allProfiles.filter((p) => p.role === "admin" || p.role === "master_admin");
    members = allProfiles.filter((p) => p.role === "member");
    assignments = assignmentRows ?? [];
    const usernameByUserId = new Map(allProfiles.map((p) => [p.id, p.username]));
    credentials = (credentialRows ?? []).map((row) => ({
      ...row,
      username: usernameByUserId.get(row.user_id) ?? null,
    }));
    passwordResetRequests = resetRequestRows ?? [];
  }

  const profileById = new Map(allProfiles.map((p) => [p.id, p]));

  let yourStudents: { id: string; email: string; username: string | null }[] = [];
  if (!isMasterAdmin && profile.role === "admin") {
    const { data: memberRows } = await supabase
      .from("admin_members")
      .select("member_id")
      .eq("admin_id", user!.id);

    const memberIds = (memberRows ?? []).map((row) => row.member_id);
    if (memberIds.length > 0) {
      const { data: studentProfiles } = await supabase
        .from("profiles")
        .select("id, email, username")
        .in("id", memberIds)
        .order("email");
      yourStudents = studentProfiles ?? [];
    }
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

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {isMasterAdmin ? <TabsTrigger value="all-users">All Users</TabsTrigger> : null}
          {isMasterAdmin ? <TabsTrigger value="activity">Activity Log</TabsTrigger> : null}
        </TabsList>

        <TabsContent value="overview" className="flex flex-col gap-6">
          {isMasterAdmin && passwordResetRequests.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Password reset requests</CardTitle>
                <CardDescription>
                  People who can&apos;t sign in and need a new password set.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col">
                  {passwordResetRequests.map((request) => (
                    <PasswordResetRequestRow
                      key={request.id}
                      requestId={request.id}
                      identifier={request.identifier}
                      createdAt={request.created_at}
                      profile={
                        request.profile_id
                          ? (profileById.get(request.profile_id) ?? null)
                          : null
                      }
                    />
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}

          {isMasterAdmin && pendingAdmins.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Pending Parent approvals</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col">
                  {pendingAdmins.map((admin) => (
                    <PendingAdminRow key={admin.id} userId={admin.id} email={profileLabel(admin)} />
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
                      email={profileLabel(student)}
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

          {!isMasterAdmin ? (
            <Card>
              <CardHeader>
                <CardTitle>Your Students</CardTitle>
                <CardDescription>Students assigned to you.</CardDescription>
              </CardHeader>
              <CardContent>
                {yourStudents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No Students assigned to you yet.
                  </p>
                ) : (
                  <ul className="flex flex-col">
                    {yourStudents.map((student) => (
                      <li
                        key={student.id}
                        className="border-b border-border py-3 text-sm last:border-0"
                      >
                        {profileLabel(student)}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          ) : null}

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
                        email={profileLabel(p)}
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
        </TabsContent>

        {isMasterAdmin ? (
          <TabsContent value="all-users">
            <Card>
              <CardHeader>
                <CardTitle>All users</CardTitle>
                <CardDescription>
                  Edit a user&apos;s name, username, email, or mobile.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col">
                  {allProfiles.map((p) => (
                    <UserRoleRow key={p.id} userId={p.id} email={profileLabel(p)} role={p.role}>
                      <EditUserSheet profile={p} />
                      {p.id !== user?.id ? (
                        <DeleteUserButton userId={p.id} label={profileLabel(p)} />
                      ) : null}
                    </UserRoleRow>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        ) : null}

        {isMasterAdmin ? (
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent activity</CardTitle>
                <CardDescription>Everything happening in Falah.</CardDescription>
              </CardHeader>
              <CardContent>
                <ActivityFeed rows={activityRows ?? []} emailById={activityEmail} />
              </CardContent>
            </Card>
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  );
}
