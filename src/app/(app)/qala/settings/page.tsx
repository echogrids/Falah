import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ModuleDisabledNotice } from "@/components/layout/module-disabled-notice";
import { QalaSettingsCard } from "@/components/qala/qala-settings-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getManageableStudents, resolveTargetMemberId } from "@/lib/proxy-entry";
import type { ModuleAccess } from "@/lib/module-access";

export default async function QalaSettingsPage({
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

  if (!(profile?.module_access as ModuleAccess | undefined)?.qala) {
    return <ModuleDisabledNotice title="Qala Tracker" />;
  }

  const canManage = profile?.role === "admin" || profile?.role === "master_admin";
  const students = await getManageableStudents(supabase, user!.id, profile?.role ?? "member");
  const memberId = resolveTargetMemberId(student, user!.id, students);

  const homeHref = `/qala${memberId !== user!.id ? `?student=${memberId}` : ""}`;

  if (!canManage) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Link
            href={homeHref}
            className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Qala Tracker
          </Link>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Settings</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Totals owed</CardTitle>
            <CardDescription>Only a Parent or Master Admin can change this.</CardDescription>
          </CardHeader>
          <CardContent />
        </Card>
      </div>
    );
  }

  const { data: balances } = await supabase
    .from("qala_balances")
    .select("prayer, initial_balance")
    .eq("member_id", memberId);

  const initialByPrayer: Record<string, number> = {};
  for (const balance of balances ?? []) {
    initialByPrayer[balance.prayer] = balance.initial_balance;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href={homeHref}
          className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Qala Tracker
        </Link>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Settings</h1>
      </div>

      <QalaSettingsCard memberId={memberId} initialByPrayer={initialByPrayer} />
    </div>
  );
}
