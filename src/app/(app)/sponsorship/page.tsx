import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogTransactionForm } from "@/components/sponsorship/log-transaction-form";
import { ModuleDisabledNotice } from "@/components/layout/module-disabled-notice";
import { StudentSelector } from "@/components/layout/student-selector";
import { getManageableStudents, resolveTargetMemberId } from "@/lib/proxy-entry";
import type { ModuleAccess } from "@/lib/module-access";
import { formatRs } from "@/lib/format-currency";

export default async function SponsorshipPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string }>;
}) {
  const { student } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, module_access")
    .eq("id", user?.id)
    .single();

  if (!(profile?.module_access as ModuleAccess | undefined)?.sponsorship) {
    return <ModuleDisabledNotice title="Sponsorship Tracker" />;
  }

  const students = await getManageableStudents(supabase, user!.id, profile?.role ?? "member");
  const memberId = resolveTargetMemberId(student, user!.id, students);

  const [{ data: totals }, { data: transactions }] = await Promise.all([
    supabase
      .from("sponsorships")
      .select(
        "intended_total, donated_total, pending_total, intended_qty, donated_qty, pending_qty",
      )
      .eq("member_id", memberId)
      .maybeSingle(),
    supabase
      .from("sponsorship_transactions")
      .select("id, type, amount, quantity, unit_price, note, created_at")
      .eq("member_id", memberId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Sponsorship Tracker
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
        <Card>
          <CardHeader>
            <CardDescription>Intended</CardDescription>
            <CardTitle className="font-sans text-2xl tabular-nums">
              {formatRs(totals?.intended_total ?? 0)}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {totals?.intended_qty ?? 0} qty
            </p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Donated</CardDescription>
            <CardTitle className="font-sans text-2xl tabular-nums">
              {formatRs(totals?.donated_total ?? 0)}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {totals?.donated_qty ?? 0} qty
            </p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Pending</CardDescription>
            <CardTitle className="font-sans text-2xl tabular-nums">
              {formatRs(totals?.pending_total ?? 0)}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {totals?.pending_qty ?? 0} qty
            </p>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log a transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <LogTransactionForm memberId={memberId} />
        </CardContent>
      </Card>

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
                    {transaction.quantity && transaction.unit_price
                      ? `${transaction.quantity} qty × ${formatRs(transaction.unit_price)}`
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
