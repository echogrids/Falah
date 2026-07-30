import { createClient } from "@/lib/supabase/server";
import { getBadges } from "@/lib/reports/badges";
import { BadgesList } from "@/components/reports/badges-list";

export default async function BadgesPage() {
  const supabase = await createClient();
  // Middleware already validated this request's JWT against Supabase's
  // Auth server; read the session locally instead of re-validating.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) return null;

  const badges = await getBadges(supabase, user.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Badges</h1>
        <p className="mt-1 text-muted-foreground">Your consistency, recognized.</p>
      </div>

      <BadgesList badges={badges} />
    </div>
  );
}
