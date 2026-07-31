import { createClient } from "@/lib/supabase/server";
import { ScoringSettingsForm } from "@/components/settings/scoring-settings-form";
import { ResetDataButton } from "@/components/settings/reset-data-button";
import {
  resetSponsorshipData,
  resetQalaData,
  resetCharityData,
} from "@/app/(app)/settings/actions";
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

      {profile?.role === "master_admin" ? (
        <Card>
          <CardHeader>
            <CardTitle>Reset data</CardTitle>
            <CardDescription>
              Wipes the module&apos;s logged history and zeroes its running
              counts for every member. This can&apos;t be undone.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <ResetDataButton
              label="Reset Zad / Zakat Counts"
              confirmMessage="Reset all Zad (food sponsorship) counts? This clears every member's log and totals — it can't be undone."
              action={resetSponsorshipData}
            />
            <ResetDataButton
              label="Reset Sadaqa Counts"
              confirmMessage="Reset all Sadaqa (charity) counts? This clears every member's offers and payments — it can't be undone."
              action={resetCharityData}
            />
            <ResetDataButton
              label="Reset Qada / Qala Counts"
              confirmMessage="Reset all Qada/Qala counts? This clears every member's log and balances — it can't be undone."
              action={resetQalaData}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
