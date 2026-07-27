"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SponsorshipActionState = {
  error: string | null;
};

const initialState: SponsorshipActionState = { error: null };
export { initialState as sponsorshipInitialState };

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
  const quantity = Number(formData.get("quantity"));
  const unitPrice = Number(formData.get("unit_price"));
  const note = formData.get("note");
  const memberId = (formData.get("member_id") as string) || user.id;

  if (type !== "intended" && type !== "donated" && type !== "pending") {
    return { error: "A valid type is required." };
  }

  if (!(quantity > 0)) {
    return { error: "Quantity must be greater than zero." };
  }
  if (!(unitPrice > 0)) {
    return { error: "Price per unit must be greater than zero." };
  }

  const { error } = await supabase.from("sponsorship_transactions").insert({
    member_id: memberId,
    type,
    quantity,
    unit_price: unitPrice,
    amount: quantity * unitPrice,
    note: typeof note === "string" && note ? note : null,
    recorded_by: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/sponsorship");
  return { error: null };
}
