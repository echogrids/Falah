"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type ForgotPasswordState = {
  error: string | null;
  message: string | null;
};

export async function requestPasswordReset(
  _prevState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const identifier = formData.get("identifier");

  if (typeof identifier !== "string" || !identifier.trim()) {
    return { error: "Enter your username or email.", message: null };
  }

  const trimmed = identifier.trim();

  // Server-only lookup (never exposed to the client) so we can attach a
  // profile to the request when possible, without granting anon read
  // access to the profiles table.
  const adminClient = createAdminClient();
  const { data: byUsername } = await adminClient
    .from("profiles")
    .select("id")
    .eq("username", trimmed)
    .maybeSingle();
  const profileId =
    byUsername?.id ??
    (
      await adminClient
        .from("profiles")
        .select("id")
        .eq("email", trimmed)
        .maybeSingle()
    ).data?.id ??
    null;

  const supabase = await createClient();
  const { error } = await supabase.from("password_reset_requests").insert({
    identifier: trimmed,
    profile_id: profileId,
  });

  if (error) return { error: error.message, message: null };

  return {
    error: null,
    message: "Request sent. A Master Admin will help you reset your password.",
  };
}
