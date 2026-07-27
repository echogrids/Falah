import { createClient } from "@/lib/supabase/server";
import { MANDATORY_PRAYERS } from "@/lib/ibadah/constants";
import { QalaPrayerCard } from "@/components/qala/qala-prayer-card";

export default async function QalaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: balances }] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user?.id).single(),
    supabase
      .from("qala_balances")
      .select("prayer, initial_balance, current_balance")
      .eq("member_id", user?.id),
  ]);

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
          Outstanding prayers, and each one you complete.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {MANDATORY_PRAYERS.map((prayer) => (
          <QalaPrayerCard
            key={prayer.key}
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
