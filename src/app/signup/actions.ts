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

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return { error: "Email and password are required.", message: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message, message: null };
  }

  if (!data.session) {
    return {
      error: null,
      message: "Check your email to confirm your account before signing in.",
    };
  }

  redirect("/");
}
