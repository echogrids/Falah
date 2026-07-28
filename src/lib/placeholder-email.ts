// Supabase Auth requires an email to create/authenticate an account. When
// someone signs up (or is created by Master Admin) without a real email,
// we synthesize one from their username purely as an internal login
// identifier — it's never used to send mail, so accounts created this way
// always go through the admin API with email_confirm: true.
const PLACEHOLDER_EMAIL_DOMAIN = "members.falahapp.com";

export function placeholderEmail(username: string): string {
  const local = username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "") || "user";
  return `${local}@${PLACEHOLDER_EMAIL_DOMAIN}`;
}

export function isPlaceholderEmail(email: string): boolean {
  return email.endsWith(`@${PLACEHOLDER_EMAIL_DOMAIN}`);
}
