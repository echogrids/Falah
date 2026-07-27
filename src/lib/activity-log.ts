import type { SupabaseClient } from "@supabase/supabase-js";

export async function logActivity(
  supabase: SupabaseClient,
  params: {
    actorId: string;
    action: string;
    targetType: string;
    targetId?: string | null;
    details?: Record<string, unknown>;
  },
) {
  await supabase.from("activity_log").insert({
    actor_id: params.actorId,
    action: params.action,
    target_type: params.targetType,
    target_id: params.targetId ?? null,
    details: params.details ?? {},
  });
}
