"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity-log";
import { MANDATORY_PRAYERS } from "@/lib/ibadah/constants";

export type QalaActionState = {
  error: string | null;
};

const PRAYER_KEYS = MANDATORY_PRAYERS.map((p) => p.key);

// "Total" is the corrected/current owed count for a prayer. Changing it
// shifts current_balance by the same delta so already-logged completions
// are never lost — fixing a miscount isn't the same as resetting progress.
export async function setQalaTotal(
  _prevState: QalaActionState,
  formData: FormData,
): Promise<QalaActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const memberId = formData.get("member_id");
  if (typeof memberId !== "string" || !memberId) {
    return { error: "Student is required." };
  }

  const { data: existingRows } = await supabase
    .from("qala_balances")
    .select("prayer, initial_balance, current_balance")
    .eq("member_id", memberId);
  const existingByPrayer = new Map((existingRows ?? []).map((row) => [row.prayer, row]));

  const inserts: {
    member_id: string;
    prayer: string;
    initial_balance: number;
    current_balance: number;
    set_by: string;
  }[] = [];
  const updates: { prayer: string; initial_balance: number; current_balance: number }[] = [];

  for (const prayer of PRAYER_KEYS) {
    const raw = formData.get(`total_${prayer}`);
    if (raw === null || raw === "") continue;
    const total = Number(raw);
    if (!Number.isInteger(total) || total < 0) {
      return { error: `${prayer}: total must be a non-negative whole number.` };
    }

    const existing = existingByPrayer.get(prayer);
    if (!existing) {
      inserts.push({
        member_id: memberId,
        prayer,
        initial_balance: total,
        current_balance: total,
        set_by: user.id,
      });
    } else {
      const delta = total - existing.initial_balance;
      updates.push({
        prayer,
        initial_balance: total,
        current_balance: Math.max(0, existing.current_balance + delta),
      });
    }
  }

  if (inserts.length > 0) {
    const { error } = await supabase.from("qala_balances").insert(inserts);
    if (error) return { error: error.message };
  }

  for (const update of updates) {
    const { error } = await supabase
      .from("qala_balances")
      .update({
        initial_balance: update.initial_balance,
        current_balance: update.current_balance,
        set_by: user.id,
      })
      .eq("member_id", memberId)
      .eq("prayer", update.prayer);
    if (error) return { error: error.message };
  }

  await logActivity(supabase, {
    actorId: user.id,
    action: "set_qala_total",
    targetType: "qala_balance",
    targetId: memberId,
    details: { inserts, updates },
  });

  revalidatePath("/qala");
  return { error: null };
}

export async function logQalaCompletions(
  _prevState: QalaActionState,
  formData: FormData,
): Promise<QalaActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const memberId = formData.get("member_id");
  if (typeof memberId !== "string" || !memberId) {
    return { error: "Student is required." };
  }

  const remarksRaw = formData.get("remarks");
  const remarks = typeof remarksRaw === "string" && remarksRaw.trim() ? remarksRaw.trim() : null;

  const counts: { prayer: string; count: number }[] = [];
  for (const prayer of PRAYER_KEYS) {
    const raw = formData.get(`count_${prayer}`);
    const count = raw ? Number(raw) : 0;
    if (!Number.isInteger(count) || count < 0) {
      return { error: `${prayer}: count must be a non-negative whole number.` };
    }
    if (count > 0) counts.push({ prayer, count });
  }

  if (counts.length === 0) {
    return { error: "Tap a prayer at least once before saving." };
  }

  const { data: balances } = await supabase
    .from("qala_balances")
    .select("prayer, current_balance")
    .eq("member_id", memberId)
    .in(
      "prayer",
      counts.map((c) => c.prayer),
    );
  const pendingByPrayer = new Map((balances ?? []).map((b) => [b.prayer, b.current_balance]));

  for (const { prayer, count } of counts) {
    const pending = pendingByPrayer.get(prayer) ?? 0;
    if (count > pending) {
      return { error: `${prayer}: only ${pending} pending, can't log ${count}.` };
    }
  }

  const { error } = await supabase.from("qala_transactions").insert(
    counts.map(({ prayer, count }) => ({
      member_id: memberId,
      prayer,
      count,
      remarks,
      recorded_by: user.id,
    })),
  );
  if (error) return { error: error.message };

  await logActivity(supabase, {
    actorId: user.id,
    action: "log_qala_completions",
    targetType: "qala_transaction",
    targetId: memberId,
    details: { counts, remarks },
  });

  revalidatePath("/qala");
  return { error: null };
}
