import type { SupabaseClient } from "@supabase/supabase-js";

export type StudentOption = { id: string; email: string };

export async function getManageableStudents(
  supabase: SupabaseClient,
  currentUserId: string,
  role: string,
): Promise<StudentOption[]> {
  if (role === "master_admin") {
    const { data } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("role", "member")
      .order("email");
    return data ?? [];
  }

  if (role === "admin") {
    const { data } = await supabase
      .from("admin_members")
      .select("member_id, profiles!member_id(id, email)")
      .eq("admin_id", currentUserId);

    return (data ?? [])
      .map((row) => row.profiles as unknown as StudentOption | null)
      .filter((profile): profile is StudentOption => profile !== null)
      .sort((a, b) => a.email.localeCompare(b.email));
  }

  return [];
}

export function resolveTargetMemberId(
  requested: string | undefined,
  currentUserId: string,
  students: StudentOption[],
): string {
  if (requested && students.some((student) => student.id === requested)) {
    return requested;
  }
  return currentUserId;
}
