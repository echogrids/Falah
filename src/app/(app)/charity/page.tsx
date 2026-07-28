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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, module_access")
    .eq("id", user?.id)
    .single();

  if (!(profile?.module_access as ModuleAccess | undefined)?.charity) {
    return <ModuleDisabledNotice title="Charity Sponsorship" />;
  }

  const role = profile?.role ?? "member";
  const canManageInstitutions = role === "admin" || role === "master_admin";

  const students = await getManageableStudents(supabase, user!.id, role);
  const memberId = resolveTargetMemberId(student, user!.id, students);

  const [{ data: institutions }, { data: offers }] = await Promise.all([
    supabase
      .from("charity_institutions")
      .select("id, name, notes, default_currency")
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("charity_offers")
      .select(
        "id, amount, currency, remarks, paid_total, status, created_at, charity_institutions(name)",
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

  const institutionOptions: InstitutionOption[] = (institutions ?? []).map((institution) => ({
    id: institution.id,
    name: institution.name,
    default_currency: institution.default_currency,
  }));

  const canManageOffers = memberId === user!.id || canManageInstitutions;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Charity Sponsorship
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
          <CardTitle>Institutions</CardTitle>
          <CardDescription>
            {canManageInstitutions
              ? "Add an institution once, then it's available to everyone when making an offer."
              : "Institutions available to sponsor."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {canManageInstitutions ? <InstitutionForm /> : null}
          {institutionOptions.length > 0 ? (
            <ul className="flex flex-col gap-2 border-t border-border pt-3">
              {institutionOptions.map((institution) => (
                <li key={institution.id} className="text-sm">
                  <span className="font-medium text-foreground">{institution.name}</span>{" "}
                  <span className="text-muted-foreground">
                    ({institution.default_currency})
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No institutions added yet.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Make an offer</CardTitle>
        </CardHeader>
        <CardContent>
          <OfferForm memberId={memberId} institutions={institutionOptions} />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">Offers</h2>
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
                  canManage={canManageOffers}
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
