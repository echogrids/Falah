import { Landmark, HandCoins, ListChecks } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InstitutionForm } from "@/components/charity/institution-form";
import { OfferForm, type InstitutionOption } from "@/components/charity/offer-form";
import { OfferCard, type PaymentEntry } from "@/components/charity/offer-card";
import {
  InstitutionCard,
  type CurrencyTotal,
  type OutstandingOffer,
} from "@/components/charity/institution-card";
import { ModuleDisabledNotice } from "@/components/layout/module-disabled-notice";
import { StudentSelector } from "@/components/layout/student-selector";
import { getManageableStudents, resolveTargetMemberId } from "@/lib/proxy-entry";
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
  const canEditInstitution = role === "admin" || role === "master_admin";

  const students = await getManageableStudents(supabase, user!.id, role);
  const memberId = resolveTargetMemberId(student, user!.id, students);
  const canRecordPayment = memberId === user!.id || canEditInstitution;

  const [{ data: institutions }, { data: offers }] = await Promise.all([
    supabase
      .from("charity_institutions")
      .select("id, name, notes, default_currency")
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("charity_offers")
      .select(
        "id, institution_id, amount, currency, remarks, paid_total, status, created_at, charity_institutions(name)",
      )
      .eq("member_id", memberId)
      .order("created_at", { ascending: false }),
  ]);

  const offerIds = (offers ?? []).map((offer) => offer.id);
  const { data: payments } =
    offerIds.length > 0
      ? await supabase
          .from("charity_payments")
          .select("id, offer_id, amount, remarks, created_at")
          .in("offer_id", offerIds)
          .order("created_at", { ascending: false })
      : { data: [] as (PaymentEntry & { offer_id: string })[] };

  const paymentsByOffer = new Map<string, PaymentEntry[]>();
  for (const payment of payments ?? []) {
    const list = paymentsByOffer.get(payment.offer_id) ?? [];
    list.push(payment);
    paymentsByOffer.set(payment.offer_id, list);
  }

  // Per institution, per currency (an institution can in principle receive
  // offers in more than one currency, so totals are never summed across
  // currencies).
  const totalsByInstitution = new Map<string, Map<string, CurrencyTotal>>();
  const outstandingByInstitution = new Map<string, OutstandingOffer[]>();

  for (const offer of offers ?? []) {
    const currencyMap = totalsByInstitution.get(offer.institution_id) ?? new Map();
    const existing = currencyMap.get(offer.currency) ?? {
      currency: offer.currency,
      offered: 0,
      paid: 0,
      pending: 0,
    };
    existing.offered += offer.amount;
    existing.paid += offer.paid_total;
    existing.pending += offer.amount - offer.paid_total;
    currencyMap.set(offer.currency, existing);
    totalsByInstitution.set(offer.institution_id, currencyMap);

    if (offer.status !== "fulfilled" && offer.status !== "cancelled") {
      const list = outstandingByInstitution.get(offer.institution_id) ?? [];
      list.push({
        id: offer.id,
        amount: offer.amount,
        currency: offer.currency,
        paidTotal: offer.paid_total,
        remarks: offer.remarks,
      });
      outstandingByInstitution.set(offer.institution_id, list);
    }
  }

  const institutionOptions: InstitutionOption[] = (institutions ?? []).map((institution) => ({
    id: institution.id,
    name: institution.name,
    default_currency: institution.default_currency,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Sadaqah
        </h1>
        <p className="mt-1 text-muted-foreground">
          Sponsor charity institutions: make an offer, then record payments against it.
        </p>
      </div>

      <StudentSelector
        students={students}
        selectedId={memberId === user!.id ? "self" : memberId}
        selfLabel="Myself"
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Landmark className="size-4" />
            </span>
            <div>
              <CardTitle>Institutions</CardTitle>
              <CardDescription>
                {canEditInstitution
                  ? "Add an institution once, then it's available to everyone when making an offer."
                  : "Institutions available to sponsor."}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {canEditInstitution ? <InstitutionForm /> : null}
          {institutionOptions.length > 0 ? (
            <div className="grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
              {(institutions ?? []).map((institution) => {
                const currencyMap = totalsByInstitution.get(institution.id);
                return (
                  <InstitutionCard
                    key={institution.id}
                    id={institution.id}
                    name={institution.name}
                    notes={institution.notes}
                    defaultCurrency={institution.default_currency}
                    canEditInstitution={canEditInstitution}
                    canRecordPayment={canRecordPayment}
                    totals={currencyMap ? Array.from(currencyMap.values()) : []}
                    outstandingOffers={outstandingByInstitution.get(institution.id) ?? []}
                  />
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No institutions added yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
              <HandCoins className="size-4" />
            </span>
            <CardTitle>Make an offer</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <OfferForm memberId={memberId} institutions={institutionOptions} />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold-foreground">
            <ListChecks className="size-4" />
          </span>
          <h2 className="font-heading text-lg font-semibold text-foreground">Offers</h2>
        </div>
        {offers && offers.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {offers.map((offer) => {
              const institution = offer.charity_institutions as unknown as
                | { name: string }
                | { name: string }[]
                | null;
              const institutionName = Array.isArray(institution)
                ? (institution[0]?.name ?? "Unknown")
                : (institution?.name ?? "Unknown");
              return (
                <OfferCard
                  key={offer.id}
                  offerId={offer.id}
                  institutionName={institutionName}
                  amount={offer.amount}
                  currency={offer.currency}
                  paidTotal={offer.paid_total}
                  status={offer.status}
                  remarks={offer.remarks}
                  createdAt={offer.created_at}
                  canManage={canRecordPayment}
                  payments={paymentsByOffer.get(offer.id) ?? []}
                />
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No offers made yet.</p>
        )}
      </div>
    </div>
  );
}
