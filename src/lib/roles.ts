export type Role = "master_admin" | "admin" | "member";

export const ROLE_LABELS: Record<Role, string> = {
  master_admin: "Master Admin",
  admin: "Parent",
  member: "Student",
};

export function roleLabel(role: string): string {
  return ROLE_LABELS[role as Role] ?? role;
}
