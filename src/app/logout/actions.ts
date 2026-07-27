"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity-log";

export async function logout() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await logActivity(supabase, {
      actorId: user.id,
      action: "logout",
      targetType: "auth",
      targetId: user.id,
    });
  }

  await supabase.auth.signOut();
  redirect("/login");
}
