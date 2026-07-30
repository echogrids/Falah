"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity-log";

export type NiyyahActionState = {
  error: string | null;
};

function parseTargetCount(raw: FormDataEntryValue | null): number | null {
  if (raw === null || raw === "") return null;
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) return null;
  return value;
}

export async function createNiyyah(
  _prevState: NiyyahActionState,
  formData: FormData,
): Promise<NiyyahActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const memberId = formData.get("member_id");
  if (typeof memberId !== "string" || !memberId) {
    return { error: "Student is required." };
  }

  const title = formData.get("title");
  if (typeof title !== "string" || !title.trim()) {
    return { error: "Title is required." };
  }

  const targetCount = parseTargetCount(formData.get("target_count"));
  if (targetCount === null) {
    return { error: "Target count must be a whole number greater than zero." };
  }

  const intentionRaw = formData.get("intention");
  const intention = typeof intentionRaw === "string" && intentionRaw.trim() ? intentionRaw.trim() : null;

  const deadlineRaw = formData.get("deadline");
  const deadline = typeof deadlineRaw === "string" && deadlineRaw ? deadlineRaw : null;

  const { data: niyyah, error } = await supabase
    .from("niyyahs")
    .insert({
      member_id: memberId,
      title: title.trim(),
      intention,
      target_count: targetCount,
      deadline,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  await logActivity(supabase, {
    actorId: user.id,
    action: "create_niyyah",
    targetType: "niyyah",
    targetId: niyyah.id,
    details: { member_id: memberId, title: title.trim(), target_count: targetCount },
  });

  revalidatePath("/niyyah");
  redirect(`/niyyah/${niyyah.id}`);
}

export async function updateNiyyah(
  _prevState: NiyyahActionState,
  formData: FormData,
): Promise<NiyyahActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const niyyahId = formData.get("niyyah_id");
  if (typeof niyyahId !== "string" || !niyyahId) {
    return { error: "Missing niyyah." };
  }

  const title = formData.get("title");
  if (typeof title !== "string" || !title.trim()) {
    return { error: "Title is required." };
  }

  const targetCount = parseTargetCount(formData.get("target_count"));
  if (targetCount === null) {
    return { error: "Target count must be a whole number greater than zero." };
  }

  const intentionRaw = formData.get("intention");
  const intention = typeof intentionRaw === "string" && intentionRaw.trim() ? intentionRaw.trim() : null;

  const deadlineRaw = formData.get("deadline");
  const deadline = typeof deadlineRaw === "string" && deadlineRaw ? deadlineRaw : null;

  const { error } = await supabase
    .from("niyyahs")
    .update({
      title: title.trim(),
      intention,
      target_count: targetCount,
      deadline,
    })
    .eq("id", niyyahId);

  if (error) return { error: error.message };

  await logActivity(supabase, {
    actorId: user.id,
    action: "update_niyyah",
    targetType: "niyyah",
    targetId: niyyahId,
    details: { title: title.trim(), target_count: targetCount },
  });

  revalidatePath("/niyyah");
  revalidatePath(`/niyyah/${niyyahId}`);
  redirect(`/niyyah/${niyyahId}`);
}

export async function logNiyyahCount(
  _prevState: NiyyahActionState,
  formData: FormData,
): Promise<NiyyahActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const niyyahId = formData.get("niyyah_id");
  if (typeof niyyahId !== "string" || !niyyahId) {
    return { error: "Missing niyyah." };
  }

  const raw = formData.get("count");
  const count = Number(raw);
  if (!Number.isInteger(count) || count <= 0) {
    return { error: "Enter a whole number greater than zero." };
  }

  const { error } = await supabase.from("niyyah_logs").insert({
    niyyah_id: niyyahId,
    count,
    logged_by: user.id,
  });

  if (error) return { error: error.message };

  await logActivity(supabase, {
    actorId: user.id,
    action: "log_niyyah_count",
    targetType: "niyyah",
    targetId: niyyahId,
    details: { count },
  });

  revalidatePath(`/niyyah/${niyyahId}`);
  revalidatePath("/niyyah");
  return { error: null };
}
