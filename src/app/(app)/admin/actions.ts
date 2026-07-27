"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AdminActionState = {
  error: string | null;
};

const initialState: AdminActionState = { error: null };
export { initialState as adminInitialState };

export async function updateUserRole(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const supabase = await createClient();
  const userId = formData.get("user_id");
  const role = formData.get("role");

  if (typeof userId !== "string" || typeof role !== "string") {
    return { error: "User and role are required." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { error: null };
}

export async function assignMember(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in." };

  const adminId = formData.get("admin_id");
  const memberId = formData.get("member_id");

  if (typeof adminId !== "string" || typeof memberId !== "string") {
    return { error: "An Admin and a Member are required." };
  }

  const { error } = await supabase.from("admin_members").insert({
    admin_id: adminId,
    member_id: memberId,
    assigned_by: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { error: null };
}

export async function unassignMember(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const supabase = await createClient();
  const adminId = formData.get("admin_id");
  const memberId = formData.get("member_id");

  if (typeof adminId !== "string" || typeof memberId !== "string") {
    return { error: "An Admin and a Member are required." };
  }

  const { error } = await supabase
    .from("admin_members")
    .delete()
    .eq("admin_id", adminId)
    .eq("member_id", memberId);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { error: null };
}
