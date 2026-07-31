"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity-log";

export type CharityActionState = {
  error: string | null;
};

function optionalText(formData: FormData, key: string): string | null {
  const raw = formData.get(key);
  return typeof raw === "string" && raw.trim() ? raw.trim() : null;
}

function revalidateCharity(institutionId?: string, offerId?: string) {
  revalidatePath("/charity");
  revalidatePath("/charity/history");
  if (institutionId) {
    revalidatePath(`/charity/institutions/${institutionId}`);
    revalidatePath(`/charity/institutions/${institutionId}/edit`);
  }
  if (offerId) {
    revalidatePath(`/charity/offers/${offerId}`);
    revalidatePath(`/charity/offers/${offerId}/edit`);
  }
}

export async function createInstitution(
  _prevState: CharityActionState,
  formData: FormData,
): Promise<CharityActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in." };

  const name = formData.get("name");
  if (typeof name !== "string" || !name.trim()) {
    return { error: "Institution name is required." };
  }

  const { data, error } = await supabase
    .from("charity_institutions")
    .insert({
      name: name.trim(),
      notes: optionalText(formData, "notes"),
      default_currency: "₹",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  await logActivity(supabase, {
    actorId: user.id,
    action: "create_charity_institution",
    targetType: "charity_institution",
    targetId: data.id,
    details: { name: name.trim() },
  });

  revalidateCharity();
  redirect(`/charity/institutions/${data.id}`);
}

export async function updateInstitution(
  _prevState: CharityActionState,
  formData: FormData,
): Promise<CharityActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in." };

  const institutionId = formData.get("institution_id");
  const name = formData.get("name");

  if (typeof institutionId !== "string" || !institutionId) {
    return { error: "Institution is required." };
  }
  if (typeof name !== "string" || !name.trim()) {
    return { error: "Institution name is required." };
  }

  const { error } = await supabase
    .from("charity_institutions")
    .update({
      name: name.trim(),
      notes: optionalText(formData, "notes"),
    })
    .eq("id", institutionId);

  if (error) return { error: error.message };

  await logActivity(supabase, {
    actorId: user.id,
    action: "update_charity_institution",
    targetType: "charity_institution",
    targetId: institutionId,
    details: { name: name.trim() },
  });

  revalidateCharity(institutionId);
  redirect(`/charity/institutions/${institutionId}`);
}

export async function createCharityOffer(
  _prevState: CharityActionState,
  formData: FormData,
): Promise<CharityActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in." };

  const institutionId = formData.get("institution_id");
  const amount = Number(formData.get("amount"));
  const purpose = formData.get("purpose");
  const memberId = (formData.get("member_id") as string) || user.id;

  if (typeof institutionId !== "string" || !institutionId) {
    return { error: "Choose an institution." };
  }
  if (typeof purpose !== "string" || !purpose.trim()) {
    return { error: "Tell us what this offer is for." };
  }
  if (!(amount > 0)) {
    return { error: "Offer amount must be greater than zero." };
  }

  const { data, error } = await supabase
    .from("charity_offers")
    .insert({
      institution_id: institutionId,
      member_id: memberId,
      amount,
      currency: "₹",
      remarks: purpose.trim(),
      notes: optionalText(formData, "notes"),
      recorded_by: user.id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  await logActivity(supabase, {
    actorId: user.id,
    action: "create_charity_offer",
    targetType: "charity_offer",
    targetId: data.id,
    details: { institution_id: institutionId, amount },
  });

  revalidateCharity(institutionId);
  redirect(`/charity/offers/${data.id}`);
}

export async function updateCharityOffer(
  _prevState: CharityActionState,
  formData: FormData,
): Promise<CharityActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in." };

  const offerId = formData.get("offer_id");
  const amount = Number(formData.get("amount"));
  const purpose = formData.get("purpose");

  if (typeof offerId !== "string" || !offerId) {
    return { error: "Offer is required." };
  }
  if (typeof purpose !== "string" || !purpose.trim()) {
    return { error: "Tell us what this offer is for." };
  }
  if (!(amount > 0)) {
    return { error: "Offer amount must be greater than zero." };
  }

  const { data: offer } = await supabase
    .from("charity_offers")
    .select("institution_id, paid_total, status")
    .eq("id", offerId)
    .single();

  if (!offer) return { error: "Offer not found." };
  if (amount < offer.paid_total) {
    return { error: `Amount can't be less than the ₹${offer.paid_total} already donated.` };
  }

  const status =
    offer.status === "cancelled"
      ? offer.status
      : offer.paid_total >= amount
        ? "fulfilled"
        : offer.paid_total > 0
          ? "partial"
          : "pending";

  const { error } = await supabase
    .from("charity_offers")
    .update({
      amount,
      remarks: purpose.trim(),
      notes: optionalText(formData, "notes"),
      status,
    })
    .eq("id", offerId);

  if (error) return { error: error.message };

  await logActivity(supabase, {
    actorId: user.id,
    action: "update_charity_offer",
    targetType: "charity_offer",
    targetId: offerId,
    details: { amount },
  });

  revalidateCharity(offer.institution_id, offerId);
  redirect(`/charity/offers/${offerId}`);
}

export async function deleteCharityOffer(
  _prevState: CharityActionState,
  formData: FormData,
): Promise<CharityActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in." };

  const offerId = formData.get("offer_id");
  const institutionId = formData.get("institution_id");

  if (typeof offerId !== "string" || !offerId) {
    return { error: "Offer is required." };
  }

  const { error } = await supabase.from("charity_offers").delete().eq("id", offerId);
  if (error) return { error: error.message };

  await logActivity(supabase, {
    actorId: user.id,
    action: "delete_charity_offer",
    targetType: "charity_offer",
    targetId: offerId,
  });

  revalidateCharity(typeof institutionId === "string" ? institutionId : undefined);
  redirect(
    typeof institutionId === "string" && institutionId
      ? `/charity/institutions/${institutionId}`
      : "/charity",
  );
}

export async function recordCharityPayment(
  _prevState: CharityActionState,
  formData: FormData,
): Promise<CharityActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in." };

  const offerId = formData.get("offer_id");
  const amount = Number(formData.get("amount"));

  if (typeof offerId !== "string" || !offerId) {
    return { error: "Offer is required." };
  }
  if (!(amount > 0)) {
    return { error: "Donation amount must be greater than zero." };
  }

  const { data: offer } = await supabase
    .from("charity_offers")
    .select("institution_id")
    .eq("id", offerId)
    .single();

  const { error } = await supabase.from("charity_payments").insert({
    offer_id: offerId,
    amount,
    remarks: optionalText(formData, "notes"),
    recorded_by: user.id,
  });

  if (error) return { error: error.message };

  await logActivity(supabase, {
    actorId: user.id,
    action: "record_charity_payment",
    targetType: "charity_offer",
    targetId: offerId,
    details: { amount },
  });

  revalidateCharity(offer?.institution_id, offerId);
  return { error: null };
}

export async function recordInstitutionDonation(
  _prevState: CharityActionState,
  formData: FormData,
): Promise<CharityActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in." };

  const institutionId = formData.get("institution_id");
  const memberId = (formData.get("member_id") as string) || user.id;
  const amount = Number(formData.get("amount"));
  const notes = optionalText(formData, "notes");

  if (typeof institutionId !== "string" || !institutionId) {
    return { error: "Institution is required." };
  }
  if (!(amount > 0)) {
    return { error: "Donation amount must be greater than zero." };
  }

  const { data: pendingOffers, error: fetchError } = await supabase
    .from("charity_offers")
    .select("id, amount, paid_total")
    .eq("institution_id", institutionId)
    .eq("member_id", memberId)
    .in("status", ["pending", "partial"])
    .order("created_at", { ascending: true });

  if (fetchError) return { error: fetchError.message };
  if (!pendingOffers || pendingOffers.length === 0) {
    return { error: "There are no pending offers to donate against for this institution." };
  }

  const totalPending = pendingOffers.reduce(
    (sum, offer) => sum + (offer.amount - offer.paid_total),
    0,
  );
  if (amount > totalPending) {
    return {
      error: `Amount exceeds the ₹${totalPending} pending across offers for this institution.`,
    };
  }

  // FIFO: walk pending/partial offers oldest-first, filling each one before
  // moving to the next, splitting the donation into one payment row per
  // offer it touches.
  let remaining = amount;
  const allocations: { offerId: string; amount: number }[] = [];
  for (const offer of pendingOffers) {
    if (remaining <= 0) break;
    const offerPending = offer.amount - offer.paid_total;
    const allocated = Math.min(offerPending, remaining);
    if (allocated > 0) {
      allocations.push({ offerId: offer.id, amount: allocated });
      remaining -= allocated;
    }
  }

  const { error: insertError } = await supabase.from("charity_payments").insert(
    allocations.map((allocation) => ({
      offer_id: allocation.offerId,
      amount: allocation.amount,
      remarks: notes,
      recorded_by: user.id,
    })),
  );

  if (insertError) return { error: insertError.message };

  await logActivity(supabase, {
    actorId: user.id,
    action: "record_charity_institution_donation",
    targetType: "charity_institution",
    targetId: institutionId,
    details: { amount, offers_touched: allocations.length },
  });

  revalidateCharity(institutionId);
  return { error: null };
}
