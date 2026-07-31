import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ModuleDisabledNotice } from "@/components/layout/module-disabled-notice";
import { QalaLogForm } from "@/components/qala/qala-log-form";
import { getManageableStudents, resolveTargetMemberId } from "@/lib/proxy-entry";
import type { ModuleAccess } from "@/lib/module-access";

export default async function QalaLogPage({
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

  const students = await getManageableStudents(supabase, user!.id, profile?.role ?? "member");
  const memberId = resolveTargetMemberId(student, user!.id, students);

  const { data: balances } = await supabase
    .from("qala_balances")
    .select("prayer, current_balance")
    .eq("member_id", memberId);

  const pendingByPrayer: Record<string, number> = {};
  for (const balance of balances ?? []) {
    pendingByPrayer[balance.prayer] = balance.current_balance;
  }

  const homeHref = `/qala${memberId !== user!.id ? `?student=${memberId}` : ""}`;

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
        <h1 className="font-heading text-2xl font-semibold text-foreground">Log Completed</h1>
      </div>

      <QalaLogForm memberId={memberId} pendingByPrayer={pendingByPrayer} homeHref={homeHref} />
    </div>
  );
}
