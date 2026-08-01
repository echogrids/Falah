// Supabase Auth requires an email to create/authenticate an account. When
// someone signs up (or is created by Master Admin) without a real email, we
// synthesize a random, opaque one purely as an internal login identifier —
// it's never derived from the username (so it can never leak it or collide
// across similar usernames) and never used to send mail, so accounts
// created this way always go through the admin API with email_confirm: true.
const PLACEHOLDER_EMAIL_DOMAIN = "members.falahapp.com";

export function placeholderEmail(): string {
  return `${crypto.randomUUID()}@${PLACEHOLDER_EMAIL_DOMAIN}`;
}
