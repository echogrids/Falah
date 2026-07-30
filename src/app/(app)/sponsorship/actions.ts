"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity-log";

export type SponsorshipActionState = {
  error: string | null;
};

export async function logSponsorshipTransaction(
  _prevState: SponsorshipActionState,
  formData: FormData,
): Promise<SponsorshipActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in." };

  const type = formData.get("type");
  const meals = Number(formData.get("meals"));
  const note = formData.get("note");
  const memberId = (formData.get("member_id") as string) || user.id;

  if (type !== "intended" && type !== "donated") {
    return { error: "A valid type is required." };
  }

  if (!Number.isInteger(meals) || meals <= 0) {
    return { error: "Meals must be a whole number greater than zero." };
  }

  const { data: settings } = await supabase
    .from("sponsorship_settings")
    .select("unit_price")
    .single();
  const unitPrice = settings?.unit_price ?? 0;

  if (!(unitPrice > 0)) {
    return { error: "Set the price per meal in Settings before logging." };
  }

  const { error } = await supabase.from("sponsorship_transactions").insert({
    member_id: memberId,
    type,
    meals,
    unit_price: unitPrice,
    amount: meals * unitPrice,
    note: typeof note === "string" && note ? note : null,
    recorded_by: user.id,
  });

  if (error) return { error: error.message };

  await logActivity(supabase, {
    actorId: user.id,
    action: "log_sponsorship_transaction",
    targetType: "sponsorship_transaction",
    targetId: memberId,
    details: { type, meals, unit_price: unitPrice, amount: meals * unitPrice },
  });

  revalidatePath("/sponsorship");
  return { error: null };
}
