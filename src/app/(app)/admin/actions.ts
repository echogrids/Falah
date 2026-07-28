"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/activity-log";
import { placeholderEmail } from "@/lib/placeholder-email";

export type AdminActionState = {
  error: string | null;
};

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
    charity: formData.get("charity") === "on",
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

export async function createUserByAdmin(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { data: actorProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (actorProfile?.role !== "master_admin") {
    return { error: "Only Master Admin can create users directly." };
  }

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
    return { error: "First Name is required." };
  }
  if (typeof lastName !== "string" || !lastName) {
    return { error: "Last Name is required." };
  }
  if (typeof username !== "string" || !username) {
    return { error: "Username is required." };
  }
  if (typeof password !== "string" || password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }
  if (requestedRole !== "admin" && requestedRole !== "member") {
    return { error: "Choose Parent or Student." };
  }
  if (requestedRole === "member" && !requestedAdminId) {
    return { error: "Choose which Parent this Student belongs to." };
  }

  const { data: usernameAvailable, error: usernameCheckError } = await supabase.rpc(
    "is_username_available",
    { p_username: username },
  );
  if (usernameCheckError) return { error: usernameCheckError.message };
  if (!usernameAvailable) return { error: "That username is already taken." };

  const authEmail = typeof email === "string" && email.trim() ? email.trim() : placeholderEmail(username);

  const adminClient = createAdminClient();
  const { data: created, error: createError } =
    await adminClient.auth.admin.createUser({
      email: authEmail,
      password,
      email_confirm: true,
      user_metadata: {
        requested_role: requestedRole,
        requested_admin_id: requestedAdminId || null,
        first_name: firstName,
        last_name: lastName,
        username,
        mobile: typeof mobile === "string" && mobile ? mobile : null,
      },
    });

  if (createError || !created.user) {
    return { error: createError?.message ?? "Could not create the account." };
  }

  const newUserId = created.user.id;

  const { error: statusError } = await supabase
    .from("profiles")
    .update({ status: "active" })
    .eq("id", newUserId);
  if (statusError) return { error: statusError.message };

  if (requestedRole === "member" && typeof requestedAdminId === "string") {
    const { error: assignError } = await supabase.from("admin_members").insert({
      admin_id: requestedAdminId,
      member_id: newUserId,
      assigned_by: user.id,
    });
    if (assignError) return { error: assignError.message };
  }

  const { error: credentialError } = await supabase
    .from("user_credentials")
    .insert({
      user_id: newUserId,
      email: authEmail,
      plaintext_password: password,
      created_by: user.id,
    });
  if (credentialError) return { error: credentialError.message };

  await logActivity(supabase, {
    actorId: user.id,
    action: "create_user",
    targetType: "profile",
    targetId: newUserId,
    details: { role: requestedRole },
  });

  revalidatePath("/admin");
  return { error: null };
}

export async function updateUserProfile(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { data: actorProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (actorProfile?.role !== "master_admin") {
    return { error: "Only Master Admin can edit user info." };
  }

  const userId = formData.get("user_id");
  const email = formData.get("email");
  const firstName = formData.get("first_name");
  const lastName = formData.get("last_name");
  const username = formData.get("username");
  const mobile = formData.get("mobile");

  if (typeof userId !== "string" || !userId) {
    return { error: "Missing user." };
  }

  const finalUsername = typeof username === "string" && username ? username : null;
  const providedEmail = typeof email === "string" ? email.trim() : "";
  const authEmail = providedEmail || (finalUsername ? placeholderEmail(finalUsername) : "");

  if (!authEmail) {
    return { error: "Provide an Email, or a Username to generate a login address from." };
  }

  const adminClient = createAdminClient();
  const { error: emailError } = await adminClient.auth.admin.updateUserById(userId, {
    email: authEmail,
    email_confirm: true,
  });
  if (emailError) return { error: emailError.message };

  const { error } = await supabase
    .from("profiles")
    .update({
      email: authEmail,
      first_name: typeof firstName === "string" && firstName ? firstName : null,
      last_name: typeof lastName === "string" && lastName ? lastName : null,
      username: finalUsername,
      mobile: typeof mobile === "string" && mobile ? mobile : null,
    })
    .eq("id", userId);

  if (error) {
    if (error.code === "23505") {
      return { error: "That username is already taken." };
    }
    return { error: error.message };
  }

  await logActivity(supabase, {
    actorId: user.id,
    action: "update_profile",
    targetType: "profile",
    targetId: userId,
  });

  revalidatePath("/admin");
  return { error: null };
}

export async function deleteUser(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { data: actorProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (actorProfile?.role !== "master_admin") {
    return { error: "Only Master Admin can delete users." };
  }

  const userId = formData.get("user_id");
  if (typeof userId !== "string" || !userId) {
    return { error: "Missing user." };
  }
  if (userId === user.id) {
    return { error: "You can't delete your own account." };
  }

  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("email, username")
    .eq("id", userId)
    .single();

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };

  await logActivity(supabase, {
    actorId: user.id,
    action: "delete_user",
    targetType: "profile",
    targetId: null,
    details: {
      email: targetProfile?.email ?? null,
      username: targetProfile?.username ?? null,
    },
  });

  revalidatePath("/admin");
  return { error: null };
}
