import { createClient } from "@/lib/supabase/server";
import { MANDATORY_PRAYERS } from "@/lib/ibadah/constants";
import { QalaLogForm } from "@/components/qala/qala-log-form";
import { QalaSettingsCard } from "@/components/qala/qala-settings-card";
import { QalaLogTable } from "@/components/qala/qala-log-table";
import { ModuleDisabledNotice } from "@/components/layout/module-disabled-notice";
import { StudentSelector } from "@/components/layout/student-selector";
import { getManageableStudents, resolveTargetMemberId } from "@/lib/proxy-entry";
import type { ModuleAccess } from "@/lib/module-access";

export default async function QalaPage({
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

  const [{ data: balances }, { data: logRows }] = await Promise.all([
    supabase
      .from("qala_balances")
      .select("prayer, initial_balance, current_balance")
      .eq("member_id", memberId),
    supabase
      .from("qala_transactions")
      .select("id, prayer, count, remarks, created_at")
      .eq("member_id", memberId)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const pendingByPrayer: Record<string, number> = {};
  const initialByPrayer: Record<string, number> = {};
  for (const balance of balances ?? []) {
    pendingByPrayer[balance.prayer] = balance.current_balance;
    initialByPrayer[balance.prayer] = balance.initial_balance;
  }

  const canManage =
    profile?.role === "admin" || profile?.role === "master_admin";

  const totalPending = MANDATORY_PRAYERS.reduce(
    (sum, prayer) => sum + (pendingByPrayer[prayer.key] ?? 0),
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Qala Tracker
        </h1>
        <p className="mt-1 text-muted-foreground">
          Outstanding prayers, and each one completed.
        </p>
      </div>

      <StudentSelector
        students={students}
        selectedId={memberId === user!.id ? "self" : memberId}
        selfLabel="Myself"
      />

      {totalPending > 0 ? (
        <div className="flex items-center gap-3 rounded-xl border-2 border-destructive/30 bg-destructive/10 px-4 py-3">
          <span className="font-heading text-2xl font-bold tabular-nums text-destructive">
            {totalPending}
          </span>
          <span className="text-sm font-medium text-destructive">
            {totalPending === 1 ? "prayer" : "prayers"} pending across all Salah
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border-2 border-primary/30 bg-primary/10 px-4 py-3">
          <span className="text-sm font-medium text-primary">
            Nothing pending — all caught up.
          </span>
        </div>
      )}

      <QalaLogForm memberId={memberId} pendingByPrayer={pendingByPrayer} />

      {canManage ? (
        <QalaSettingsCard memberId={memberId} initialByPrayer={initialByPrayer} />
      ) : null}

      <QalaLogTable rows={logRows ?? []} />
    </div>
  );
}
