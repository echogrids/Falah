"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity-log";

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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

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

  await logActivity(supabase, {
    actorId: user.id,
    action: "update_role",
    targetType: "profile",
    targetId: userId,
    details: { role },
  });

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

  await logActivity(supabase, {
    actorId: user.id,
    action: "assign_member",
    targetType: "admin_members",
    targetId: memberId,
    details: { admin_id: adminId },
  });

  revalidatePath("/admin");
  return { error: null };
}

export async function unassignMember(
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

  const { error } = await supabase
    .from("admin_members")
    .delete()
    .eq("admin_id", adminId)
    .eq("member_id", memberId);

  if (error) return { error: error.message };

  await logActivity(supabase, {
    actorId: user.id,
    action: "unassign_member",
    targetType: "admin_members",
    targetId: memberId,
    details: { admin_id: adminId },
  });

  revalidatePath("/admin");
  return { error: null };
}

export async function approveAdmin(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const userId = formData.get("user_id");
  if (typeof userId !== "string") return { error: "User is required." };

  const { error } = await supabase
    .from("profiles")
    .update({ status: "active" })
    .eq("id", userId);

  if (error) return { error: error.message };

  await logActivity(supabase, {
    actorId: user.id,
    action: "approve_admin",
    targetType: "profile",
    targetId: userId,
  });

  revalidatePath("/admin");
  return { error: null };
}

export async function rejectAdmin(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const userId = formData.get("user_id");
  if (typeof userId !== "string") return { error: "User is required." };

  const { error } = await supabase
    .from("profiles")
    .update({ status: "rejected" })
    .eq("id", userId);

  if (error) return { error: error.message };

  await logActivity(supabase, {
    actorId: user.id,
    action: "reject_admin",
    targetType: "profile",
    targetId: userId,
  });

  revalidatePath("/admin");
  return { error: null };
}

export async function approveStudent(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const studentId = formData.get("student_id");
  const adminId = formData.get("admin_id");

  if (typeof studentId !== "string" || typeof adminId !== "string") {
    return { error: "Student and requested Parent are required." };
  }

  const { error: assignError } = await supabase.from("admin_members").insert({
    admin_id: adminId,
    member_id: studentId,
    assigned_by: adminId,
  });
  if (assignError) return { error: assignError.message };

  const { error: statusError } = await supabase
    .from("profiles")
    .update({ status: "active" })
    .eq("id", studentId);
  if (statusError) return { error: statusError.message };

  await logActivity(supabase, {
    actorId: user.id,
    action: "approve_student",
    targetType: "profile",
    targetId: studentId,
    details: { admin_id: adminId },
  });

  revalidatePath("/admin");
  return { error: null };
}

export async function updateModuleAccess(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const userId = formData.get("user_id");
  if (typeof userId !== "string") return { error: "User is required." };

  const moduleAccess = {
    ibadah: formData.get("ibadah") === "on",
    qala: formData.get("qala") === "on",
    sponsorship: formData.get("sponsorship") === "on",
    reports: formData.get("reports") === "on",
  };

  const { error } = await supabase
    .from("profiles")
    .update({ module_access: moduleAccess })
    .eq("id", userId);

  if (error) return { error: error.message };

  await logActivity(supabase, {
    actorId: user.id,
    action: "update_module_access",
    targetType: "profile",
    targetId: userId,
    details: moduleAccess,
  });

  revalidatePath("/admin");
  return { error: null };
}

export async function rejectStudent(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const studentId = formData.get("student_id");
  if (typeof studentId !== "string") return { error: "Student is required." };

  const { error } = await supabase
    .from("profiles")
    .update({ status: "rejected" })
    .eq("id", studentId);

  if (error) return { error: error.message };

  await logActivity(supabase, {
    actorId: user.id,
    action: "reject_student",
    targetType: "profile",
    targetId: studentId,
  });

  revalidatePath("/admin");
  return { error: null };
}
