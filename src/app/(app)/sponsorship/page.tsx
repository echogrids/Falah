import { createClient } from "@/lib/supabase/server";
import { UtensilsCrossed, Wallet, AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogTransactionForm } from "@/components/sponsorship/log-transaction-form";
import { SponsorshipSettingsForm } from "@/components/settings/sponsorship-settings-form";
import { ModuleDisabledNotice } from "@/components/layout/module-disabled-notice";
import { StudentSelector } from "@/components/layout/student-selector";
import { getManageableStudents, resolveTargetMemberId } from "@/lib/proxy-entry";
import type { ModuleAccess } from "@/lib/module-access";
import { formatRs } from "@/lib/format-currency";
import { cn } from "@/lib/utils";

export default async function SponsorshipPage({
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

  const students = await getManageableStudents(supabase, user!.id, profile?.role ?? "member");
  const memberId = resolveTargetMemberId(student, user!.id, students);

  const [{ data: totals }, { data: transactions }, { data: settings }] = await Promise.all([
    supabase
      .from("sponsorships")
      .select("intended_total, donated_total, intended_meals, donated_meals")
      .eq("member_id", memberId)
      .maybeSingle(),
    supabase
      .from("sponsorship_transactions")
      .select("id, type, amount, meals, unit_price, note, created_at")
      .eq("member_id", memberId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("sponsorship_settings").select("unit_price").single(),
  ]);

  const unitPrice = settings?.unit_price ?? 0;
  const intendedMeals = totals?.intended_meals ?? 0;
  const donatedMeals = totals?.donated_meals ?? 0;
  // Pending isn't its own logged category anymore — it's always whatever's
  // left, priced at today's rate. Donated keeps whatever rate applied when
  // it was actually given.
  const pendingMeals = Math.max(0, intendedMeals - donatedMeals);
  const pendingAmount = pendingMeals * unitPrice;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Zād
        </h1>
        <p className="mt-1 text-muted-foreground">
          Intended, donated, and pending running totals.
        </p>
      </div>

      <StudentSelector
        students={students}
        selectedId={memberId === user!.id ? "self" : memberId}
        selfLabel="Myself"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card
          className={cn(
            pendingMeals > 0 &&
              "border-2 border-destructive/40 bg-destructive/5 shadow-[0_0_0_1px_var(--destructive)_inset]",
          )}
        >
          <CardHeader>
            <CardDescription
              className={cn(
                "flex items-center gap-1.5",
                pendingMeals > 0 && "text-destructive",
              )}
            >
              {pendingMeals > 0 ? <AlertTriangle className="size-3.5" /> : null}
              Pending
            </CardDescription>
            <CardTitle
              className={cn(
                "flex items-center gap-1.5 font-sans text-2xl tabular-nums",
                pendingMeals > 0 && "text-destructive",
              )}
            >
              <Wallet className="size-4.5" />
              {formatRs(pendingAmount)}
            </CardTitle>
            <p
              className={cn(
                "flex items-center gap-1 text-xs",
                pendingMeals > 0 ? "text-destructive/80" : "text-muted-foreground",
              )}
            >
              <UtensilsCrossed className="size-3" />
              {pendingMeals} meals
            </p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Intended</CardDescription>
            <CardTitle className="flex items-center gap-1.5 font-sans text-2xl tabular-nums">
              <Wallet className="size-4.5 text-muted-foreground" />
              {formatRs(totals?.intended_total ?? 0)}
            </CardTitle>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <UtensilsCrossed className="size-3" />
              {intendedMeals} meals
            </p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Donated</CardDescription>
            <CardTitle className="flex items-center gap-1.5 font-sans text-2xl tabular-nums">
              <Wallet className="size-4.5 text-muted-foreground" />
              {formatRs(totals?.donated_total ?? 0)}
            </CardTitle>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <UtensilsCrossed className="size-3" />
              {donatedMeals} meals
            </p>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log a transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <LogTransactionForm memberId={memberId} unitPrice={unitPrice} />
        </CardContent>
      </Card>

      {profile?.role === "master_admin" ? (
        <SponsorshipSettingsForm unitPrice={unitPrice} />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {transactions.map((transaction) => (
                <li
                  key={transaction.id}
                  className="flex flex-col gap-0.5 border-b border-border py-2 text-sm last:border-0"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="capitalize">{transaction.type}</span>
                    <span className="font-medium tabular-nums">
                      {formatRs(transaction.amount)}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {transaction.meals && transaction.unit_price
                      ? `${transaction.meals} meals × ${formatRs(transaction.unit_price)}`
                      : transaction.note}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No transactions logged yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
