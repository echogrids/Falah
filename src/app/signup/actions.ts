"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { placeholderEmail } from "@/lib/placeholder-email";

export type SignupState = {
  error: string | null;
  message: string | null;
};

export async function signup(
  _prevState: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const firstName = formData.get("first_name");
  const lastName = formData.get("last_name");
  const username = formData.get("username");
  const email = formData.get("email");
  const mobile = formData.get("mobile");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirm_password");
  const requestedRole = formData.get("requested_role");
  const requestedAdminId = formData.get("requested_admin_id");

  if (typeof firstName !== "string" || !firstName) {
    return { error: "First Name is required.", message: null };
  }

  if (typeof lastName !== "string" || !lastName) {
    return { error: "Last Name is required.", message: null };
  }

  if (typeof username !== "string" || !username) {
    return { error: "Username is required.", message: null };
  }

  if (typeof password !== "string" || !password) {
    return { error: "Password is required.", message: null };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match.", message: null };
  }

  if (requestedRole !== "admin" && requestedRole !== "member") {
    return { error: "Choose whether you're a Parent or a Student.", message: null };
  }

  if (requestedRole === "member" && !requestedAdminId) {
    return { error: "Choose which Parent to request.", message: null };
  }

  const supabase = await createClient();

  const { data: usernameAvailable, error: usernameCheckError } = await supabase.rpc(
    "is_username_available",
    { p_username: username },
  );

  if (usernameCheckError) {
    return { error: usernameCheckError.message, message: null };
  }

  if (!usernameAvailable) {
    return { error: "That username is already taken.", message: null };
  }

  const providedEmail = typeof email === "string" ? email.trim() : "";
  const metadata = {
    requested_role: requestedRole,
    requested_admin_id: requestedAdminId || null,
    first_name: firstName,
    last_name: lastName,
    username,
    mobile: typeof mobile === "string" && mobile ? mobile : null,
  };

  let hasSession: boolean;

  if (providedEmail) {
    const { data, error } = await supabase.auth.signUp({
      email: providedEmail,
      password,
      options: { data: metadata },
    });

    if (error) {
      return { error: error.message, message: null };
    }

    hasSession = Boolean(data.session);
  } else {
    // No email given: create the account (with a placeholder login email)
    // through the admin API so it doesn't need an unreachable confirmation
    // link, then sign in with the password they just chose.
    const adminClient = createAdminClient();
    const { error: createError } = await adminClient.auth.admin.createUser({
      email: placeholderEmail(username),
      password,
      email_confirm: true,
      user_metadata: metadata,
    });

    if (createError) {
      return { error: createError.message, message: null };
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: placeholderEmail(username),
      password,
    });

    if (signInError) {
      return { error: signInError.message, message: null };
    }

    hasSession = true;
  }

  if (!hasSession) {
    return {
      error: null,
      message:
        "Check your email to confirm your account. After that, wait for approval before signing in.",
    };
  }

  redirect("/");
}
