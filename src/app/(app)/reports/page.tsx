import { createClient } from "@/lib/supabase/server";
import { getDailyTotals } from "@/lib/reports/daily-totals";
import { getLeaderboard } from "@/lib/reports/leaderboard";
import { DailyScoreChart } from "@/components/reports/daily-score-chart";
import { LeaderboardTable } from "@/components/reports/leaderboard-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const WINDOW_DAYS = 7;

export default async function ReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - (WINDOW_DAYS - 1));
  const startIso = start.toISOString().slice(0, 10);
  const endIso = end.toISOString().slice(0, 10);

  const [dailyTotals, { data: prayerEntries }, leaderboard] = await Promise.all([
    getDailyTotals(supabase, user.id, WINDOW_DAYS),
    supabase
      .from("prayer_entries")
      .select("status")
      .eq("member_id", user.id)
      .gte("prayer_day", startIso)
      .lte("prayer_day", endIso),
    getLeaderboard(supabase, startIso),
  ]);

  const totalScore = dailyTotals.reduce((sum, day) => sum + day.score, 0);
  const loggedCount = prayerEntries?.length ?? 0;
  const onTimeCount =
    prayerEntries?.filter((entry) => entry.status === "on_time").length ?? 0;
  const onTimeRate =
    loggedCount > 0 ? Math.round((onTimeCount / loggedCount) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Reports
        </h1>
        <p className="mt-1 text-muted-foreground">
          Last {WINDOW_DAYS} days, for reporting and motivation only.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription>Total score</CardDescription>
            <CardTitle className="text-2xl">{totalScore}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>On-time Salah rate</CardDescription>
            <CardTitle className="text-2xl">{onTimeRate}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily score</CardTitle>
        </CardHeader>
        <CardContent>
          <DailyScoreChart data={dailyTotals} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>
            Last {WINDOW_DAYS} days, among who you can see.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LeaderboardTable entries={leaderboard} />
        </CardContent>
      </Card>
    </div>
  );
}
