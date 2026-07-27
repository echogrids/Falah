import { createClient } from "@/lib/supabase/server";
import { ScoringSettingsForm } from "@/components/settings/scoring-settings-form";
import type { ScoringSettings } from "@/lib/ibadah/scoring";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: settings }] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user?.id).single(),
    supabase.from("scoring_settings").select("*").single(),
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
    </div>
  );
}
