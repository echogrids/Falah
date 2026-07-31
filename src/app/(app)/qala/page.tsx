import Link from "next/link";
import { CheckCircle2, History, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MANDATORY_PRAYERS } from "@/lib/ibadah/constants";
import { ModuleActionCard } from "@/components/home/module-action-card";
import { QalaLogTable } from "@/components/qala/qala-log-table";
import { Button } from "@/components/ui/button";
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
      .select("prayer, current_balance")
      .eq("member_id", memberId),
    supabase
      .from("qala_transactions")
      .select("id, prayer, count, remarks, created_at")
      .eq("member_id", memberId)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const pendingByPrayer: Record<string, number> = {};
  for (const balance of balances ?? []) {
    pendingByPrayer[balance.prayer] = balance.current_balance;
  }

  const canManage = profile?.role === "admin" || profile?.role === "master_admin";

  const totalPending = MANDATORY_PRAYERS.reduce(
    (sum, prayer) => sum + (pendingByPrayer[prayer.key] ?? 0),
    0,
  );

  const studentQS = memberId !== user!.id ? `?student=${memberId}` : "";
  const logHref = `/qala/log${studentQS}`;
  const historyHref = `/qala/history${studentQS}`;

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

      <section className="flex flex-col gap-3">
        <h2 className="px-1 font-heading text-lg font-semibold text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          <ModuleActionCard
            href={logHref}
            label="Log Completed"
            description="Record prayers made up"
            icon={CheckCircle2}
            badgeClassName="bg-primary/15"
            iconClassName="text-primary"
          />
          <ModuleActionCard
            href={historyHref}
            label="History"
            description="View the full log"
            icon={History}
            badgeClassName="bg-accent/15"
            iconClassName="text-accent"
          />
          {canManage ? (
            <ModuleActionCard
              href="/qala/settings"
              label="Settings"
              description="Set totals owed"
              icon={Settings}
              badgeClassName="bg-terracotta/20"
              iconClassName="text-terracotta-foreground"
            />
          ) : null}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-heading text-lg font-semibold text-foreground">Recent Log</h2>
          {(logRows ?? []).length > 0 ? (
            <Button variant="link" size="sm" asChild className="h-auto p-0">
              <Link href={historyHref}>View All</Link>
            </Button>
          ) : null}
        </div>
        <QalaLogTable rows={logRows ?? []} />
      </section>
    </div>
  );
}
