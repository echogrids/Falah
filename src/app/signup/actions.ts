"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type SignupState = {
  error: string | null;
  message: string | null;
};

const initialState: SignupState = { error: null, message: null };

export { initialState as signupInitialState };

export async function signup(
  _prevState: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const email = formData.get("email");
  const password = formData.get("password");
  const requestedRole = formData.get("requested_role");
  const requestedAdminId = formData.get("requested_admin_id");

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return { error: "Email and password are required.", message: null };
  }

  if (requestedRole !== "admin" && requestedRole !== "member") {
    return { error: "Choose whether you're a Parent or a Student.", message: null };
  }

  if (requestedRole === "member" && !requestedAdminId) {
    return { error: "Choose which Parent to request.", message: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        requested_role: requestedRole,
        requested_admin_id: requestedAdminId || null,
      },
    },
  });

  if (error) {
    return { error: error.message, message: null };
  }

  if (!data.session) {
    return {
      error: null,
      message:
        "Check your email to confirm your account. After that, wait for approval before signing in.",
    };
  }

  redirect("/");
}
