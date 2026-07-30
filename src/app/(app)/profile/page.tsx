import { createClient } from "@/lib/supabase/server";
import { UserAvatar } from "@/components/layout/user-avatar";
import { Card, CardContent } from "@/components/ui/card";
import { roleLabel } from "@/lib/roles";
import { displayName } from "@/lib/profile-label";
import { isPlaceholderEmail } from "@/lib/placeholder-email";

export default async function ProfilePage() {
  const supabase = await createClient();
  // Middleware already validated this request's JWT against Supabase's
  // Auth server; read the session locally instead of re-validating.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, first_name, last_name, username, email")
    .eq("id", user?.id)
    .single();

  const name = profile ? displayName(profile) : (user?.email ?? "");
  const email = profile?.email ?? user?.email ?? null;
  const showEmail = email && !isPlaceholderEmail(email);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Profile</h1>
        <p className="mt-1 text-muted-foreground">Your account details.</p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-5 pt-2">
          <div className="flex items-center gap-3">
            <UserAvatar name={name} size="lg" />
            <div className="min-w-0">
              <p className="truncate font-heading text-lg font-semibold text-foreground">
                {name}
              </p>
              <p className="text-sm text-muted-foreground">
                {roleLabel(profile?.role ?? "member")}
              </p>
            </div>
          </div>

          <dl className="flex flex-col gap-3 border-t border-border pt-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Username</dt>
              <dd className="truncate font-medium text-foreground">
                {profile?.username ?? "—"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="truncate font-medium text-foreground">
                {showEmail ? email : "—"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Role</dt>
              <dd className="font-medium text-foreground">
                {roleLabel(profile?.role ?? "member")}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
