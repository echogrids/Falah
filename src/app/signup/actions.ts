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

  // Always create through the admin API and sign in directly — never
  // Supabase's public signUp(), which (depending on project mailer
  // settings) can require confirming a link that gets emailed out and
  // points at an unreachable Site URL (localhost in dev). This also keeps
  // the no-email path (placeholder login address) and the with-email path
  // identical, instead of forking on whether an email was given.
  const authEmail = providedEmail || placeholderEmail(username);

  const adminClient = createAdminClient();
  const { error: createError } = await adminClient.auth.admin.createUser({
    email: authEmail,
    password,
    email_confirm: true,
    user_metadata: metadata,
  });

  if (createError) {
    return { error: createError.message, message: null };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: authEmail,
    password,
  });

  if (signInError) {
    return { error: signInError.message, message: null };
  }

  redirect("/");
}
