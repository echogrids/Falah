// The username is what an admin actually typed and recognizes; email may be
// an internal placeholder for accounts created without one (see
// lib/placeholder-email.ts), so prefer showing the username wherever we're
// just labeling a person in a list.
export function profileLabel(profile: { username?: string | null; email: string }): string {
  return profile.username || profile.email;
}

// Prefer a real First/Last name where we have one (e.g. leaderboards),
// falling back the same way profileLabel does.
export function displayName(profile: {
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  email: string;
}): string {
  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ");
  return fullName || profileLabel(profile);
}
