import type { SupabaseClient } from "@supabase/supabase-js";

export type LeaderboardEntry = {
  memberId: string;
  email: string;
  score: number;
};

export async function getLeaderboard(
  supabase: SupabaseClient,
  sinceIso: string,
  memberIds?: string[],
): Promise<LeaderboardEntry[]> {
  if (memberIds && memberIds.length === 0) return [];

  let prayerQuery = supabase
    .from("prayer_entries")
    .select("member_id, score")
    .gte("prayer_day", sinceIso);
  let worshipQuery = supabase
    .from("additional_worship_entries")
    .select("member_id, score")
    .gte("prayer_day", sinceIso);
  let trackerQuery = supabase
    .from("daily_trackers")
    .select("member_id, score")
    .gte("prayer_day", sinceIso);

  if (memberIds) {
    prayerQuery = prayerQuery.in("member_id", memberIds);
    worshipQuery = worshipQuery.in("member_id", memberIds);
    trackerQuery = trackerQuery.in("member_id", memberIds);
  }

  const [prayerEntries, worshipEntries, trackers] = await Promise.all([
    prayerQuery,
    worshipQuery,
    trackerQuery,
  ]);

  const totals = new Map<string, number>();
  for (const rows of [
    prayerEntries.data,
    worshipEntries.data,
    trackers.data,
  ]) {
    for (const row of rows ?? []) {
      totals.set(row.member_id, (totals.get(row.member_id) ?? 0) + (row.score ?? 0));
    }
  }

  if (totals.size === 0) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email")
    .in("id", Array.from(totals.keys()));

  const emailById = new Map((profiles ?? []).map((p) => [p.id, p.email]));

  return Array.from(totals.entries())
    .map(([memberId, score]) => ({
      memberId,
      email: emailById.get(memberId) ?? "Unknown",
      score,
    }))
    .sort((a, b) => b.score - a.score);
}
