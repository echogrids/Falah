import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, HandCoins, Landmark } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ModuleDisabledNotice } from "@/components/layout/module-disabled-notice";
import { DonationForm } from "@/components/charity/donation-form";
import { EmptyState } from "@/components/ui/empty-state";
import { formatMoney } from "@/lib/format-currency";
import { getManageableStudents, resolveTargetMemberId } from "@/lib/proxy-entry";
import { getInstitutionRows } from "@/lib/charity-institutions";
import type { ModuleAccess } from "@/lib/module-access";

export default async function RecordDonationPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string; institution?: string; offer?: string }>;
}) {
  const { student, institution: institutionId, offer: offerId } = await searchParams;
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

  const students = await getManageableStudents(supabase, user!.id, profile?.role ?? "member");
  const memberId = resolveTargetMemberId(student, user!.id, students);
  const studentQS = memberId !== user!.id ? `&student=${memberId}` : "";
  const homeHref = `/charity${memberId !== user!.id ? `?student=${memberId}` : ""}`;

  if (offerId) {
    const { data: offer } = await supabase
      .from("charity_offers")
      .select("id, remarks, amount, paid_total, status, member_id, charity_institutions(name)")
      .eq("id", offerId)
      .eq("member_id", memberId)
      .maybeSingle();

    if (!offer) notFound();

    const pending = Math.max(0, offer.amount - offer.paid_total);
    const institution = offer.charity_institutions as unknown as
      | { name: string }
      | { name: string }[]
      | null;
    const institutionName = Array.isArray(institution)
      ? (institution[0]?.name ?? "Unknown institution")
      : (institution?.name ?? "Unknown institution");

    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Link
            href={`/charity/offers/${offer.id}`}
            className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            {offer.remarks ?? "Offer"}
          </Link>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Record Donation</h1>
          <p className="text-sm text-muted-foreground">
            {institutionName} · {offer.remarks ?? "Offer"}
          </p>
        </div>

        {pending > 0 ? (
          <DonationForm
            mode="offer"
            offerId={offer.id}
            pendingAmount={pending}
            returnHref={`/charity/offers/${offer.id}`}
          />
        ) : (
          <EmptyState
            icon={HandCoins}
            title="Nothing pending"
            description="This offer has already been fully donated."
            action={{ label: "View Offer", href: `/charity/offers/${offer.id}` }}
          />
        )}
      </div>
    );
  }

  if (institutionId) {
    const { data: institution } = await supabase
      .from("charity_institutions")
      .select("id, name")
      .eq("id", institutionId)
      .maybeSingle();

    if (!institution) notFound();

    const { data: offers } = await supabase
      .from("charity_offers")
      .select("amount, paid_total")
      .eq("institution_id", institutionId)
      .eq("member_id", memberId)
      .in("status", ["pending", "partial"]);

    const pendingAmount = (offers ?? []).reduce(
      (sum, offer) => sum + (offer.amount - offer.paid_total),
      0,
    );

    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Link
            href={`/charity/institutions/${institution.id}`}
            className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            {institution.name}
          </Link>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Record Donation</h1>
          <p className="text-sm text-muted-foreground">
            Allocated automatically to the oldest pending offers first.
          </p>
        </div>

        {pendingAmount > 0 ? (
          <DonationForm
            mode="institution"
            institutionId={institution.id}
            memberId={memberId}
            pendingAmount={pendingAmount}
            returnHref={`/charity/institutions/${institution.id}${memberId !== user!.id ? `?student=${memberId}` : ""}`}
          />
        ) : (
          <EmptyState
            icon={HandCoins}
            title="Nothing pending"
            description="There are no pending offers for this institution."
            action={{ label: "View Institution", href: `/charity/institutions/${institution.id}` }}
          />
        )}
      </div>
    );
  }

  const rows = (await getInstitutionRows(supabase, memberId)).filter((row) => row.outstanding > 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href={homeHref}
          className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Sadaqah
        </Link>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Record Donation</h1>
        <p className="text-sm text-muted-foreground">Choose which institution to donate to.</p>
      </div>

      {rows.length > 0 ? (
        <div className="flex flex-col gap-3">
          {rows.map((row) => (
            <Link
              key={row.id}
              href={`/charity/donate?institution=${row.id}${studentQS}`}
              className="flex items-center justify-between gap-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/8 shadow-[var(--shadow-soft)] transition-all duration-150 active:scale-[0.98] hover:shadow-[var(--shadow-lift)]"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Landmark className="size-4.5" />
                </span>
                <p className="truncate font-medium text-foreground">{row.name}</p>
              </div>
              <span className="shrink-0 text-sm font-medium tabular-nums text-foreground">
                {formatMoney(row.outstanding)} pending
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={HandCoins}
          title="Nothing pending"
          description="You have no outstanding offers to donate against right now."
          action={{ label: "New Niyyah", href: `/charity/offers/new${studentQS ? `?${studentQS.slice(1)}` : ""}` }}
        />
      )}
    </div>
  );
}
