import { createClient } from "@/lib/supabase/server";
import { MANDATORY_PRAYERS } from "@/lib/ibadah/constants";
import { QalaPrayerCard } from "@/components/qala/qala-prayer-card";
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

  const { data: balances } = await supabase
    .from("qala_balances")
    .select("prayer, initial_balance, current_balance")
    .eq("member_id", memberId);

  const balanceMap: Record<
    string,
    { initial_balance: number; current_balance: number }
  > = {};
  for (const balance of balances ?? []) {
    balanceMap[balance.prayer] = {
      initial_balance: balance.initial_balance,
      current_balance: balance.current_balance,
    };
  }

  const canManage =
    profile?.role === "admin" || profile?.role === "master_admin";

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

      <div className="grid gap-4 sm:grid-cols-2">
        {MANDATORY_PRAYERS.map((prayer) => (
          <QalaPrayerCard
            key={prayer.key}
            memberId={memberId}
            prayerKey={prayer.key}
            label={prayer.label}
            arabic={prayer.arabic}
            balance={balanceMap[prayer.key] ?? null}
            canManage={canManage}
          />
        ))}
      </div>
    </div>
  );
}
