"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity-log";

export type LoginState = {
  error: string | null;
};

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const identifier = formData.get("identifier");
  const password = formData.get("password");

  if (typeof identifier !== "string" || typeof password !== "string" || !identifier || !password) {
    return { error: "Username/Email and password are required." };
  }

  const supabase = await createClient();

  let email = identifier;
  if (!identifier.includes("@")) {
    const { data: resolvedEmail, error: resolveError } = await supabase.rpc(
      "get_login_email",
      { p_username: identifier },
    );
    if (resolveError) return { error: resolveError.message };
    if (!resolvedEmail) return { error: "No account found with that username." };
    email = resolvedEmail;
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  await logActivity(supabase, {
    actorId: data.user.id,
    action: "login",
    targetType: "auth",
    targetId: data.user.id,
  });

  redirect("/");
}
