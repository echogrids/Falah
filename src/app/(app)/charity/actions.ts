"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity-log";

export type CharityActionState = {
  error: string | null;
};

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
  const notes = formData.get("notes");
  const defaultCurrency = formData.get("default_currency");

  if (typeof name !== "string" || !name.trim()) {
    return { error: "Institution name is required." };
  }

  const { data, error } = await supabase
    .from("charity_institutions")
    .insert({
      name: name.trim(),
      notes: typeof notes === "string" && notes ? notes : null,
      default_currency:
        typeof defaultCurrency === "string" && defaultCurrency ? defaultCurrency : "Rs",
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

  revalidatePath("/charity");
  return { error: null };
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
  const currency = formData.get("currency");
  const remarks = formData.get("remarks");
  const memberId = (formData.get("member_id") as string) || user.id;

  if (typeof institutionId !== "string" || !institutionId) {
    return { error: "Choose an institution." };
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
      currency: typeof currency === "string" && currency ? currency : "Rs",
      remarks: typeof remarks === "string" && remarks ? remarks : null,
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
    details: { institution_id: institutionId, amount, currency },
  });

  revalidatePath("/charity");
  return { error: null };
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
  const remarks = formData.get("remarks");

  if (typeof offerId !== "string" || !offerId) {
    return { error: "Offer is required." };
  }
  if (!(amount > 0)) {
    return { error: "Payment amount must be greater than zero." };
  }

  const { error } = await supabase.from("charity_payments").insert({
    offer_id: offerId,
    amount,
    remarks: typeof remarks === "string" && remarks ? remarks : null,
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

  revalidatePath("/charity");
  return { error: null };
}
