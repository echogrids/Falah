"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity-log";

export type QalaActionState = {
  error: string | null;
};

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

  await logActivity(supabase, {
    actorId: user.id,
    action: "complete_qala",
    targetType: "qala_transaction",
    targetId: memberId,
    details: { prayer },
  });

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

  await logActivity(supabase, {
    actorId: user.id,
    action: "set_qala_balance",
    targetType: "qala_balance",
    targetId: memberId,
    details: { prayer, initial_balance: balance },
  });

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

  const deltaValue = Number(delta);
  if (!Number.isInteger(deltaValue)) {
    return { error: "Adjustment must be a whole number." };
  }

  const { error } = await supabase.from("qala_balance_adjustments").insert({
    member_id: memberId,
    prayer,
    delta: deltaValue,
    reason,
    adjusted_by: user.id,
  });

  if (error) return { error: error.message };

  await logActivity(supabase, {
    actorId: user.id,
    action: "adjust_qala_balance",
    targetType: "qala_balance",
    targetId: memberId,
    details: { prayer, delta: deltaValue, reason },
  });

  revalidatePath("/qala");
  return { error: null };
}
