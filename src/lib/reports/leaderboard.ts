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

  const memberIdsWithScores = Array.from(totals.keys());

  const [{ data: profiles }, { data: assignments }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, username, first_name, last_name")
      .in("id", memberIdsWithScores),
    supabase
      .from("admin_members")
      .select("admin_id, member_id")
      .in("member_id", memberIdsWithScores),
  ]);

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  const parentIds = Array.from(new Set((assignments ?? []).map((a) => a.admin_id)));
  const { data: parentProfiles } =
    parentIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, email, username, first_name, last_name")
          .in("id", parentIds)
      : { data: [] };
  const parentById = new Map((parentProfiles ?? []).map((p) => [p.id, p]));

  const firstParentIdByMember = new Map(
    (assignments ?? []).map((a) => [a.member_id, a.admin_id]),
  );

  return memberIdsWithScores
    .map((memberId) => {
      const profile = profileById.get(memberId);
      const parentId = firstParentIdByMember.get(memberId);
      const parent = parentId ? parentById.get(parentId) : undefined;

      return {
        memberId,
        name: profile ? displayName(profile) : "Unknown",
        parentName: parent ? displayName(parent) : null,
        score: totals.get(memberId)!,
      };
    })
    .sort((a, b) => b.score - a.score);
}
