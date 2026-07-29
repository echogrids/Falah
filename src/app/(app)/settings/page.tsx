import { createClient } from "@/lib/supabase/server";
import { ScoringSettingsForm } from "@/components/settings/scoring-settings-form";
import { SponsorshipSettingsForm } from "@/components/settings/sponsorship-settings-form";
import type { ScoringSettings } from "@/lib/ibadah/scoring";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SettingsPage() {
  const supabase = await createClient();
  // Middleware already validated this request's JWT against Supabase's
  // Auth server; read the session locally instead of re-validating.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  const [{ data: profile }, { data: settings }, { data: sponsorshipSettings }] =
    await Promise.all([
      supabase.from("profiles").select("role").eq("id", user?.id).single(),
      supabase.from("scoring_settings").select("*").single(),
      supabase.from("sponsorship_settings").select("unit_price").single(),
    ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-muted-foreground">
          Scores are for reporting and motivation only.
        </p>
      </div>

      {profile?.role === "master_admin" && settings ? (
        <ScoringSettingsForm settings={settings as ScoringSettings} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Scoring settings</CardTitle>
            <CardDescription>
              Only a Master Admin can change these.
            </CardDescription>
          </CardHeader>
          <CardContent />
        </Card>
      )}

      {profile?.role === "master_admin" && sponsorshipSettings ? (
        <SponsorshipSettingsForm unitPrice={sponsorshipSettings.unit_price} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Zād settings</CardTitle>
            <CardDescription>
              Only a Master Admin can change these.
            </CardDescription>
          </CardHeader>
          <CardContent />
        </Card>
      )}
    </div>
  );
}
