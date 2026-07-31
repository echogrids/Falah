import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Landmark, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { OfferCard, type OfferListRow } from "@/components/charity/offer-card";
import { DonationForm } from "@/components/charity/donation-form";
import { DonationToast } from "@/components/charity/donation-toast";
import { EmptyState } from "@/components/ui/empty-state";
import { ModuleDisabledNotice } from "@/components/layout/module-disabled-notice";
import { StudentSelector } from "@/components/layout/student-selector";
import { getManageableStudents, resolveTargetMemberId } from "@/lib/proxy-entry";
import { formatMoney } from "@/lib/format-currency";
import type { ModuleAccess } from "@/lib/module-access";

export default async function InstitutionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ student?: string }>;
}) {
  const { id } = await params;
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
  const isAdminRole = role === "admin" || role === "master_admin";

  const students = await getManageableStudents(supabase, user!.id, role);
  const memberId = resolveTargetMemberId(student, user!.id, students);
  const canDonate = memberId === user!.id || isAdminRole;

  const { data: institution } = await supabase
    .from("charity_institutions")
    .select("id, name, notes, created_by")
    .eq("id", id)
    .single();

  if (!institution) notFound();

  // An Admin (Parent) may only edit institutions they created themselves —
  // not Master Admin's global ones, nor another Admin's family-scoped ones.
  const canEditInstitution =
    role === "master_admin" || (role === "admin" && institution.created_by === user!.id);

  const { data: offers } = await supabase
    .from("charity_offers")
    .select("id, amount, remarks, paid_total, status, created_at")
    .eq("institution_id", id)
    .eq("member_id", memberId)
    .order("created_at", { ascending: false });

  const offerRows: OfferListRow[] = (offers ?? []).map((offer) => ({
    id: offer.id,
    purpose: offer.remarks,
    amount: offer.amount,
    paidTotal: offer.paid_total,
    status: offer.status,
    createdAt: offer.created_at,
  }));

  const pendingAmount = (offers ?? [])
    .filter((offer) => offer.status === "pending" || offer.status === "partial")
    .reduce((sum, offer) => sum + (offer.amount - offer.paid_total), 0);

  const totalOffered = (offers ?? []).reduce((sum, offer) => sum + offer.amount, 0);
  const totalDonated = (offers ?? []).reduce((sum, offer) => sum + offer.paid_total, 0);
  const progressPct = totalOffered > 0 ? (totalDonated / totalOffered) * 100 : 0;

  const homeHref = `/charity${memberId !== user!.id ? `?student=${memberId}` : ""}`;

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
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Landmark className="size-5" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate font-heading text-2xl font-semibold text-foreground">
                {institution.name}
              </h1>
              {institution.notes ? (
                <p className="truncate text-sm text-muted-foreground">{institution.notes}</p>
              ) : null}
            </div>
          </div>
          {canEditInstitution ? (
            <Button type="button" size="icon-sm" variant="ghost" asChild>
              <Link href={`/charity/institutions/${id}/edit`} aria-label={`Edit ${institution.name}`}>
                <Pencil className="size-4" />
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <StudentSelector
        students={students}
        selectedId={memberId === user!.id ? "self" : memberId}
        selfLabel="Myself"
      />

      <Card>
        <CardContent className="flex flex-col gap-4 pt-1">
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="flex flex-col gap-0.5 rounded-xl bg-muted/60 px-3 py-2">
              <span className="text-xs text-muted-foreground">Outstanding</span>
              <span className="font-medium tabular-nums text-foreground">
                {formatMoney(pendingAmount)}
              </span>
            </div>
            <div className="flex flex-col gap-0.5 rounded-xl bg-muted/60 px-3 py-2">
              <span className="text-xs text-muted-foreground">Donated</span>
              <span className="font-medium tabular-nums text-foreground">
                {formatMoney(totalDonated)}
              </span>
            </div>
            <div className="flex flex-col gap-0.5 rounded-xl bg-muted/60 px-3 py-2">
              <span className="text-xs text-muted-foreground">Offers</span>
              <span className="font-medium tabular-nums text-foreground">{offerRows.length}</span>
            </div>
          </div>
          <Progress value={progressPct} />
        </CardContent>
      </Card>

      {canDonate && pendingAmount > 0 ? (
        <Card>
          <CardHeader>
            <p className="font-heading text-base font-semibold text-foreground">Record a donation</p>
          </CardHeader>
          <CardContent>
            <DonationForm
              mode="institution"
              institutionId={id}
              memberId={memberId}
              pendingAmount={pendingAmount}
              returnHref={`/charity/institutions/${id}${memberId !== user!.id ? `?student=${memberId}` : ""}`}
            />
          </CardContent>
        </Card>
      ) : null}

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-heading text-lg font-semibold text-foreground">Offers</h2>
          <Button variant="link" size="sm" asChild className="h-auto p-0">
            <Link href={`/charity/offers/new?institution=${id}${memberId !== user!.id ? `&student=${memberId}` : ""}`}>
              New Niyyah
            </Link>
          </Button>
        </div>
        {offerRows.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {offerRows.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Landmark}
            title="No offers yet"
            description="Make an offer against this institution to start sponsoring it."
            action={{
              label: "New Niyyah",
              href: `/charity/offers/new?institution=${id}`,
            }}
          />
        )}
      </section>

      <DonationToast />
    </div>
  );
}
