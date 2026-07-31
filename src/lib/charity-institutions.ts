import type { SupabaseClient } from "@supabase/supabase-js";
import type { InstitutionListRow } from "@/components/charity/institution-list-card";

// Institution stats are scoped to the current member (self or the student
// being managed), same as every other Sadaqah query — the institution
// directory is shared, but each member's offers/donations against it are
// their own.
export async function getInstitutionRows(
  supabase: SupabaseClient,
  memberId: string,
): Promise<InstitutionListRow[]> {
  const [{ data: institutions }, { data: offers }] = await Promise.all([
    supabase
      .from("charity_institutions")
      .select("id, name")
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("charity_offers")
      .select("id, institution_id, amount, paid_total, created_at")
      .eq("member_id", memberId),
  ]);

  const offerRows = offers ?? [];
  const offerIds = offerRows.map((offer) => offer.id);
  const { data: payments } =
    offerIds.length > 0
      ? await supabase
          .from("charity_payments")
          .select("offer_id, created_at")
          .in("offer_id", offerIds)
      : { data: [] as { offer_id: string; created_at: string }[] };

  const lastDonationByOffer = new Map<string, string>();
  for (const payment of payments ?? []) {
    const existing = lastDonationByOffer.get(payment.offer_id);
    if (!existing || payment.created_at > existing) {
      lastDonationByOffer.set(payment.offer_id, payment.created_at);
    }
  }

  const rows = new Map<string, InstitutionListRow>();
  for (const institution of institutions ?? []) {
    rows.set(institution.id, {
      id: institution.id,
      name: institution.name,
      outstanding: 0,
      donated: 0,
      offerCount: 0,
      lastDonationDate: null,
    });
  }
  for (const offer of offerRows) {
    const row = rows.get(offer.institution_id);
    if (!row) continue;
    row.outstanding += offer.amount - offer.paid_total;
    row.donated += offer.paid_total;
    row.offerCount += 1;
    const lastDonation = lastDonationByOffer.get(offer.id);
    if (lastDonation && (!row.lastDonationDate || lastDonation > row.lastDonationDate)) {
      row.lastDonationDate = lastDonation;
    }
  }

  return Array.from(rows.values());
}
