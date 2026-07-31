import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ModuleDisabledNotice } from "@/components/layout/module-disabled-notice";
import { SponsorshipSettingsForm } from "@/components/sponsorship/settings-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ModuleAccess } from "@/lib/module-access";

export default async function SponsorshipSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string }>;
}) {
  const { student } = await searchParams;
  const supabase = await createClient();
  // Middleware already validated this request's JWT against Supabase's
  // Auth server; read the session locally instead of re-validating.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, module_access")
    .eq("id", user?.id)
    .single();

  if (!(profile?.module_access as ModuleAccess | undefined)?.sponsorship) {
    return <ModuleDisabledNotice title="Zād" />;
  }

  const { data: sponsorshipSettings } = await supabase
    .from("sponsorship_settings")
    .select("unit_price")
    .single();

  const homeHref = student ? `/sponsorship?student=${student}` : "/sponsorship";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href={homeHref}
          className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Zād
        </Link>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Settings</h1>
      </div>

      {profile?.role === "master_admin" ? (
        <SponsorshipSettingsForm unitPrice={sponsorshipSettings?.unit_price ?? 0} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Price per meal</CardTitle>
            <CardDescription>Only a Master Admin can change this.</CardDescription>
          </CardHeader>
          <CardContent />
        </Card>
      )}
    </div>
  );
}
