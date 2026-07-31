import Link from "next/link";
import { HandCoins, History, Landmark, ListChecks, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ModuleActionCard } from "@/components/home/module-action-card";
import { SummaryCard } from "@/components/charity/summary-card";
import { ActivityItem } from "@/components/charity/activity-item";
import { EmptyState } from "@/components/ui/empty-state";
import { DonationToast } from "@/components/charity/donation-toast";
import { ModuleDisabledNotice } from "@/components/layout/module-disabled-notice";
import { StudentSelector } from "@/components/layout/student-selector";
import { getManageableStudents, resolveTargetMemberId } from "@/lib/proxy-entry";
import { getCharityActivity } from "@/lib/charity-activity";
import { formatMoney } from "@/lib/format-currency";
import type { ModuleAccess } from "@/lib/module-access";

export default async function CharityPage({
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

  if (!(profile?.module_access as ModuleAccess | undefined)?.charity) {
    return <ModuleDisabledNotice title="Sadaqah" />;
  }

  const role = profile?.role ?? "member";
  const students = await getManageableStudents(supabase, user!.id, role);
  const memberId = resolveTargetMemberId(student, user!.id, students);

  const [{ data: institutions }, { data: offers }, activity] = await Promise.all([
    supabase.from("charity_institutions").select("id").eq("is_active", true),
    supabase
      .from("charity_offers")
      .select("id, amount, paid_total, status")
      .eq("member_id", memberId),
    getCharityActivity(supabase, memberId, 5),
  ]);

  const offerRows = offers ?? [];
  const offerIds = offerRows.map((offer) => offer.id);
  const { count: donationCount } =
    offerIds.length > 0
      ? await supabase
          .from("charity_payments")
          .select("id", { count: "exact", head: true })
          .in("offer_id", offerIds)
      : { count: 0 };

  const activeOffers = offerRows.filter(
    (offer) => offer.status === "pending" || offer.status === "partial",
  );
  const totalOutstanding = activeOffers.reduce(
    (sum, offer) => sum + (offer.amount - offer.paid_total),
    0,
  );
  const totalDonated = offerRows.reduce((sum, offer) => sum + offer.paid_total, 0);

  const studentQS = memberId !== user!.id ? `?student=${memberId}` : "";
  const newOfferHref = `/charity/offers/new${studentQS}`;
  const donateHref = `/charity/donate${studentQS}`;
  const institutionsHref = `/charity/institutions${studentQS}`;
  const historyHref = `/charity/history${studentQS}`;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Sadaqah</h1>
        <p className="mt-1 text-muted-foreground">A personal charity journal.</p>
      </div>

      <StudentSelector
        students={students}
        selectedId={memberId === user!.id ? "self" : memberId}
        selfLabel="Myself"
      />

      <div className="grid grid-cols-2 gap-4">
        <SummaryCard
          label="Outstanding"
          icon={Wallet}
          value={formatMoney(totalOutstanding)}
          sublabel={`${activeOffers.length} pending ${activeOffers.length === 1 ? "offer" : "offers"}`}
          alert={totalOutstanding > 0}
        />
        <SummaryCard
          label="Donated"
          icon={HandCoins}
          value={formatMoney(totalDonated)}
          sublabel={`${donationCount ?? 0} completed ${donationCount === 1 ? "donation" : "donations"}`}
        />
        <SummaryCard
          label="Institutions"
          icon={Landmark}
          value={String(institutions?.length ?? 0)}
          sublabel="Total institutions"
        />
        <SummaryCard
          label="Offers"
          icon={ListChecks}
          value={String(activeOffers.length)}
          sublabel="Active offers"
        />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="px-1 font-heading text-lg font-semibold text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <ModuleActionCard
            href={newOfferHref}
            label="New Niyyah"
            description="Commit to an offer"
            icon={HandCoins}
            badgeClassName="bg-primary/15"
            iconClassName="text-primary"
          />
          <ModuleActionCard
            href={donateHref}
            label="Record Donation"
            description="Log a donation you gave"
            icon={Wallet}
            badgeClassName="bg-gold/20"
            iconClassName="text-gold-foreground"
          />
          <ModuleActionCard
            href={institutionsHref}
            label="Institutions"
            description="Browse and manage"
            icon={Landmark}
            badgeClassName="bg-accent/15"
            iconClassName="text-accent"
          />
          <ModuleActionCard
            href={historyHref}
            label="History"
            description="View all activity"
            icon={History}
            badgeClassName="bg-terracotta/20"
            iconClassName="text-terracotta-foreground"
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-heading text-lg font-semibold text-foreground">Recent Activity</h2>
          {activity.length > 0 ? (
            <Button variant="link" size="sm" asChild className="h-auto p-0">
              <Link href={historyHref}>View All</Link>
            </Button>
          ) : null}
        </div>
        {activity.length > 0 ? (
          <ul className="flex flex-col rounded-2xl bg-card px-4 ring-1 ring-foreground/8 shadow-[var(--shadow-soft)]">
            {activity.map((event) => (
              <ActivityItem key={`${event.type}-${event.id}`} event={event} />
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={HandCoins}
            title="No activity yet"
            description="Make an offer to get started."
          />
        )}
      </section>

      <DonationToast />
    </div>
  );
}
