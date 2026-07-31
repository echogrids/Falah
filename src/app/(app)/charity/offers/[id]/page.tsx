import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { OFFER_STATUS_META } from "@/components/charity/types";
import { OfferTimeline, type TimelineEntry } from "@/components/charity/offer-timeline";
import { DonationForm } from "@/components/charity/donation-form";
import { DonationToast } from "@/components/charity/donation-toast";
import { DeleteOfferButton } from "@/components/charity/delete-offer-button";
import { ModuleDisabledNotice } from "@/components/layout/module-disabled-notice";
import { formatMoney } from "@/lib/format-currency";
import { cn } from "@/lib/utils";
import type { ModuleAccess } from "@/lib/module-access";

export default async function OfferDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
  const canManageAny = role === "admin" || role === "master_admin";

  const { data: offer } = await supabase
    .from("charity_offers")
    .select(
      "id, institution_id, member_id, amount, remarks, notes, paid_total, status, created_at, charity_institutions(name)",
    )
    .eq("id", id)
    .single();

  if (!offer) notFound();

  const canManage = offer.member_id === user!.id || canManageAny;

  const { data: payments } = await supabase
    .from("charity_payments")
    .select("id, amount, remarks, created_at")
    .eq("offer_id", id)
    .order("created_at", { ascending: false });

  const institution = offer.charity_institutions as unknown as
    | { name: string }
    | { name: string }[]
    | null;
  const institutionName = Array.isArray(institution)
    ? (institution[0]?.name ?? "Unknown institution")
    : (institution?.name ?? "Unknown institution");

  const pending = Math.max(0, offer.amount - offer.paid_total);
  const status = OFFER_STATUS_META[offer.status] ?? OFFER_STATUS_META.pending;

  const timeline: TimelineEntry[] = [
    { type: "created" as const, date: offer.created_at },
    ...(payments ?? []).map(
      (payment): TimelineEntry => ({
        type: "donation",
        id: payment.id,
        date: payment.created_at,
        amount: payment.amount,
        notes: payment.remarks,
      }),
    ),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const institutionHref = `/charity/institutions/${offer.institution_id}`;
  const canDonate = canManage && offer.status !== "fulfilled" && offer.status !== "cancelled";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href={institutionHref}
          className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          {institutionName}
        </Link>
        <div className="flex items-start justify-between gap-3">
          <h1 className="min-w-0 truncate font-heading text-2xl font-semibold text-foreground">
            {offer.remarks ?? "Offer"}
          </h1>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
              status.className,
            )}
          >
            {status.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="flex flex-col gap-0.5 rounded-xl bg-muted/60 px-3 py-2">
          <span className="text-xs text-muted-foreground">Offered</span>
          <span className="font-medium tabular-nums text-foreground">
            {formatMoney(offer.amount)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-xl bg-muted/60 px-3 py-2">
          <span className="text-xs text-muted-foreground">Donated</span>
          <span className="font-medium tabular-nums text-foreground">
            {formatMoney(offer.paid_total)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-xl bg-muted/60 px-3 py-2">
          <span className="text-xs text-muted-foreground">Pending</span>
          <span className="font-medium tabular-nums text-foreground">{formatMoney(pending)}</span>
        </div>
      </div>

      {offer.notes ? <p className="text-sm text-muted-foreground">{offer.notes}</p> : null}

      {canDonate ? (
        <Card>
          <CardHeader>
            <p className="font-heading text-base font-semibold text-foreground">Record a donation</p>
          </CardHeader>
          <CardContent>
            <DonationForm
              mode="offer"
              offerId={id}
              pendingAmount={pending}
              returnHref={`/charity/offers/${id}`}
            />
          </CardContent>
        </Card>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="px-1 font-heading text-lg font-semibold text-foreground">Timeline</h2>
        <OfferTimeline entries={timeline} />
      </section>

      {canManage ? (
        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
          <Button type="button" variant="outline" asChild>
            <Link href={`/charity/offers/${id}/edit`}>
              <Pencil className="size-4" />
              Edit Offer
            </Link>
          </Button>
          <DeleteOfferButton
            offerId={id}
            institutionId={offer.institution_id}
            purpose={offer.remarks ?? "this offer"}
            hasPayments={(payments ?? []).length > 0}
          />
        </div>
      ) : null}

      <DonationToast />
    </div>
  );
}
