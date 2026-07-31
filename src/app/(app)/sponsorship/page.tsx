import Link from "next/link";
import { Clock, HandCoins, History, Settings, Wallet, HeartHandshake } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ModuleActionCard } from "@/components/home/module-action-card";
import { SummaryCard } from "@/components/sponsorship/summary-card";
import { ActivityItem } from "@/components/sponsorship/activity-item";
import { EmptyState } from "@/components/sponsorship/empty-state";
import { AddTransactionFab } from "@/components/sponsorship/add-transaction-fab";
import { SavedToast } from "@/components/sponsorship/saved-toast";
import { ModuleDisabledNotice } from "@/components/layout/module-disabled-notice";
import { StudentSelector } from "@/components/layout/student-selector";
import { getManageableStudents, resolveTargetMemberId } from "@/lib/proxy-entry";
import type { ModuleAccess } from "@/lib/module-access";
import type { SponsorshipTransaction } from "@/components/sponsorship/types";

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
      .limit(5),
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
  const progressPct = intendedMeals > 0 ? (donatedMeals / intendedMeals) * 100 : 0;

  const studentParam = memberId !== user!.id ? `&student=${memberId}` : "";
  const studentQS = memberId !== user!.id ? `?student=${memberId}` : "";
  const intendedHref = `/sponsorship/new?type=intended${studentParam}`;
  const donatedHref = `/sponsorship/new?type=donated${studentParam}`;
  const historyHref = `/sponsorship/history${studentQS}`;
  const settingsHref = "/sponsorship/settings";

  const rows = (transactions ?? []) as SponsorshipTransaction[];

  return (
    <div className="flex flex-col gap-6 pb-16">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Zād</h1>
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
        <SummaryCard
          label="Outstanding"
          icon={Wallet}
          amount={pendingAmount}
          meals={pendingMeals}
          alert={pendingMeals > 0}
        />
        <SummaryCard
          label="Donated"
          icon={Wallet}
          amount={totals?.donated_total ?? 0}
          meals={donatedMeals}
        />
        <SummaryCard label="Remaining" icon={HandCoins} meals={pendingMeals} progress={progressPct} />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="px-1 font-heading text-lg font-semibold text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <ModuleActionCard
            href={intendedHref}
            label="Add Intention"
            description="Commit to meals to give"
            icon={Clock}
            badgeClassName="bg-primary/15"
            iconClassName="text-primary"
          />
          <ModuleActionCard
            href={donatedHref}
            label="Record Donation"
            description="Log meals you've given"
            icon={HandCoins}
            badgeClassName="bg-gold/20"
            iconClassName="text-gold-foreground"
          />
          <ModuleActionCard
            href={historyHref}
            label="History"
            description="View all transactions"
            icon={History}
            badgeClassName="bg-accent/15"
            iconClassName="text-accent"
          />
          <ModuleActionCard
            href={settingsHref}
            label="Settings"
            description="Price per meal"
            icon={Settings}
            badgeClassName="bg-terracotta/20"
            iconClassName="text-terracotta-foreground"
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-heading text-lg font-semibold text-foreground">Recent Activity</h2>
          {rows.length > 0 ? (
            <Button variant="link" size="sm" asChild className="h-auto p-0">
              <Link href={historyHref}>View All</Link>
            </Button>
          ) : null}
        </div>
        {rows.length > 0 ? (
          <Card>
            <CardContent>
              <ul className="flex flex-col">
                {rows.map((transaction) => (
                  <ActivityItem key={transaction.id} transaction={transaction} />
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : (
          <EmptyState
            icon={HeartHandshake}
            title="No activity yet"
            description="Add an intention or record a donation to get started."
          />
        )}
      </section>

      <AddTransactionFab intendedHref={intendedHref} donatedHref={donatedHref} />
      <SavedToast />
    </div>
  );
}
