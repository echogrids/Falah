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
  const amount = formData.get("amount");
  const note = formData.get("note");

  if (type !== "intended" && type !== "donated" && type !== "pending") {
    return { error: "A valid type is required." };
  }

  const amountValue = Number(amount);
  if (!amount || !(amountValue > 0)) {
    return { error: "Amount must be greater than zero." };
  }

  const { error } = await supabase.from("sponsorship_transactions").insert({
    member_id: user.id,
    type,
    amount: amountValue,
    note: typeof note === "string" && note ? note : null,
    recorded_by: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/sponsorship");
  return { error: null };
}
