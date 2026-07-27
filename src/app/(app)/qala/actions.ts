"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type QalaActionState = {
  error: string | null;
};

const initialState: QalaActionState = { error: null };
export { initialState as qalaInitialState };

export async function completeQala(
  _prevState: QalaActionState,
  formData: FormData,
): Promise<QalaActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in." };

  const prayer = formData.get("prayer");
  const memberId = (formData.get("member_id") as string) || user.id;
  if (typeof prayer !== "string") return { error: "Prayer is required." };

  const { error } = await supabase.from("qala_transactions").insert({
    member_id: memberId,
    prayer,
    recorded_by: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/qala");
  return { error: null };
}

export async function setQalaBalance(
  _prevState: QalaActionState,
  formData: FormData,
): Promise<QalaActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in." };

  const prayer = formData.get("prayer");
  const initialBalance = formData.get("initial_balance");
  const memberId = (formData.get("member_id") as string) || user.id;
  if (typeof prayer !== "string" || typeof initialBalance !== "string") {
    return { error: "Prayer and balance are required." };
  }

  const balance = Number(initialBalance);
  if (!Number.isInteger(balance) || balance < 0) {
    return { error: "Balance must be a non-negative whole number." };
  }

  const { error } = await supabase.from("qala_balances").insert({
    member_id: memberId,
    prayer,
    initial_balance: balance,
    current_balance: balance,
    set_by: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/qala");
  return { error: null };
}

export async function adjustQalaBalance(
  _prevState: QalaActionState,
  formData: FormData,
): Promise<QalaActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in." };

  const prayer = formData.get("prayer");
  const delta = formData.get("delta");
  const reason = formData.get("reason");
  const memberId = (formData.get("member_id") as string) || user.id;
  if (
    typeof prayer !== "string" ||
    typeof delta !== "string" ||
    typeof reason !== "string" ||
    !reason
  ) {
    return { error: "Prayer, delta, and a reason are required." };
  }

  const { error } = await supabase.from("qala_balance_adjustments").insert({
    member_id: memberId,
    prayer,
    delta: Number(delta),
    reason,
    adjusted_by: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/qala");
  return { error: null };
}
