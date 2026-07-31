import type { SupabaseClient } from "@supabase/supabase-js";

export type CharityActivityEvent = {
  id: string;
  type: "institution_created" | "offer_created" | "donation_recorded";
  date: string;
  institutionName: string;
  institutionId: string | null;
  offerId: string | null;
  amount: number | null;
  purpose: string | null;
  notes: string | null;
};

function institutionNameOf(
  row: { name: string } | { name: string }[] | null,
): string {
  if (Array.isArray(row)) return row[0]?.name ?? "Unknown institution";
  return row?.name ?? "Unknown institution";
}

// Merges institution/offer/donation rows into one chronological feed. There's
// no unified events table, so this fetches each source table (capped so a
// very active family can't blow up the query) and merges in memory.
export async function getCharityActivity(
  supabase: SupabaseClient,
  memberId: string,
  limit: number,
): Promise<CharityActivityEvent[]> {
  const fetchCap = Math.max(limit, 100);

  const [{ data: institutions }, { data: offers }] = await Promise.all([
    supabase
      .from("charity_institutions")
      .select("id, name, created_at")
      .order("created_at", { ascending: false })
      .limit(fetchCap),
    supabase
      .from("charity_offers")
      .select("id, institution_id, amount, remarks, created_at, charity_institutions(name)")
      .eq("member_id", memberId)
      .order("created_at", { ascending: false })
      .limit(fetchCap),
  ]);

  const offerRows = offers ?? [];
  const offerIds = offerRows.map((offer) => offer.id);
  const institutionNameByOffer = new Map(
    offerRows.map((offer) => [offer.id, institutionNameOf(offer.charity_institutions as never)]),
  );
  const purposeByOffer = new Map(offerRows.map((offer) => [offer.id, offer.remarks]));
  const institutionIdByOffer = new Map(offerRows.map((offer) => [offer.id, offer.institution_id]));

  const { data: payments } =
    offerIds.length > 0
      ? await supabase
          .from("charity_payments")
          .select("id, offer_id, amount, created_at")
          .in("offer_id", offerIds)
          .order("created_at", { ascending: false })
          .limit(fetchCap)
      : { data: [] as { id: string; offer_id: string; amount: number; created_at: string }[] };

  const events: CharityActivityEvent[] = [
    ...(institutions ?? []).map((institution): CharityActivityEvent => ({
      id: institution.id,
      type: "institution_created",
      date: institution.created_at,
      institutionName: institution.name,
      institutionId: institution.id,
      offerId: null,
      amount: null,
      purpose: null,
      notes: null,
    })),
    ...offerRows.map((offer): CharityActivityEvent => ({
      id: offer.id,
      type: "offer_created",
      date: offer.created_at,
      institutionName: institutionNameByOffer.get(offer.id) ?? "Unknown institution",
      institutionId: offer.institution_id,
      offerId: offer.id,
      amount: offer.amount,
      purpose: offer.remarks,
      notes: null,
    })),
    ...(payments ?? []).map((payment): CharityActivityEvent => ({
      id: payment.id,
      type: "donation_recorded",
      date: payment.created_at,
      institutionName: institutionNameByOffer.get(payment.offer_id) ?? "Unknown institution",
      institutionId: institutionIdByOffer.get(payment.offer_id) ?? null,
      offerId: payment.offer_id,
      amount: payment.amount,
      purpose: purposeByOffer.get(payment.offer_id) ?? null,
      notes: null,
    })),
  ];

  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return events.slice(0, limit);
}
