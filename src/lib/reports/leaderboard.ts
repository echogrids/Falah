import type { SupabaseClient } from "@supabase/supabase-js";
import { displayName } from "@/lib/profile-label";

export type LeaderboardEntry = {
  memberId: string;
  name: string;
  parentName: string | null;
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

  // admin_members doesn't depend on the score totals below, so fetch it
  // in the same round instead of waiting — collapses what would otherwise
  // be a 3-stage sequential waterfall (scores -> profiles -> parent
  // profiles) down to 2 round trips.
  let assignmentsQuery = supabase.from("admin_members").select("admin_id, member_id");
  if (memberIds) {
    assignmentsQuery = assignmentsQuery.in("member_id", memberIds);
  }

  const [prayerEntries, worshipEntries, trackers, { data: assignments }] = await Promise.all([
    prayerQuery,
    worshipQuery,
    trackerQuery,
    assignmentsQuery,
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

  const memberIdsWithScores = Array.from(totals.keys());

  const firstParentIdByMember = new Map(
    (assignments ?? [])
      .filter((a) => totals.has(a.member_id))
      .map((a) => [a.member_id, a.admin_id]),
  );
  const parentIds = Array.from(new Set(firstParentIdByMember.values()));

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, username, first_name, last_name")
    .in("id", Array.from(new Set([...memberIdsWithScores, ...parentIds])));

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return memberIdsWithScores
    .map((memberId) => {
      const profile = profileById.get(memberId);
      const parentId = firstParentIdByMember.get(memberId);
      const parent = parentId ? profileById.get(parentId) : undefined;

      return {
        memberId,
        name: profile ? displayName(profile) : "Unknown",
        parentName: parent ? displayName(parent) : null,
        score: totals.get(memberId)!,
      };
    })
    .sort((a, b) => b.score - a.score);
}
