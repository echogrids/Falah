import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDailyTotals } from "@/lib/reports/daily-totals";
import { getLeaderboard } from "@/lib/reports/leaderboard";
import { getBadges } from "@/lib/reports/badges";
import { getManageableStudents } from "@/lib/proxy-entry";
import { profileLabel } from "@/lib/profile-label";
import { MANDATORY_PRAYERS } from "@/lib/ibadah/constants";
import { DailyScoreChart } from "@/components/reports/daily-score-chart";
import { LeaderboardTable } from "@/components/reports/leaderboard-table";
import { BadgesList } from "@/components/reports/badges-list";
import { StatCard } from "@/components/dashboard/stat-card";
import { StudentProgressCard } from "@/components/dashboard/student-progress-card";
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
  // Middleware already validated this request's JWT against Supabase's
  // Auth server; read the session locally instead of re-validating.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const role = profile?.role ?? "member";
  const isAdmin = role === "admin" || role === "master_admin";

  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - (WINDOW_DAYS - 1));
  const startIso = start.toISOString().slice(0, 10);
  const endIso = end.toISOString().slice(0, 10);
  const today = endIso;

  const [dailyTotals, { data: prayerEntries }, leaderboard, badges] =
    await Promise.all([
      getDailyTotals(supabase, user.id, WINDOW_DAYS),
      supabase
        .from("prayer_entries")
        .select("status")
        .eq("member_id", user.id)
        .gte("prayer_day", startIso)
        .lte("prayer_day", endIso),
      getLeaderboard(supabase, startIso),
      getBadges(supabase, user.id),
    ]);

  const totalScore = dailyTotals.reduce((sum, day) => sum + day.score, 0);
  const loggedCount = prayerEntries?.length ?? 0;
  const onTimeCount =
    prayerEntries?.filter((entry) => entry.status === "on_time").length ?? 0;
  const onTimeRate =
    loggedCount > 0 ? Math.round((onTimeCount / loggedCount) * 100) : 0;

  let studentCards: Array<{
    id: string;
    label: string;
    todayCompleted: number;
    weeklyScore: number;
  }> = [];

  if (isAdmin) {
    const students = await getManageableStudents(supabase, user.id, role);
    const studentIds = students.map((student) => student.id);

    const [todayRows, weeklyPerStudent] = await Promise.all([
      studentIds.length > 0
        ? supabase
            .from("prayer_entries")
            .select("member_id, prayer")
            .in("member_id", studentIds)
            .eq("prayer_day", today)
        : Promise.resolve({ data: [] as { member_id: string; prayer: string }[] }),
      Promise.all(studentIds.map((id) => getDailyTotals(supabase, id, WINDOW_DAYS))),
    ]);

    const todayCountByStudent = new Map<string, number>();
    for (const row of todayRows.data ?? []) {
      todayCountByStudent.set(
        row.member_id,
        (todayCountByStudent.get(row.member_id) ?? 0) + 1,
      );
    }

    studentCards = students.map((student, index) => ({
      id: student.id,
      label: profileLabel(student),
      todayCompleted: todayCountByStudent.get(student.id) ?? 0,
      weeklyScore: weeklyPerStudent[index].reduce((sum, day) => sum + day.score, 0),
    }));
  }

  const studentsCompleteToday = studentCards.filter(
    (student) => student.todayCompleted >= MANDATORY_PRAYERS.length,
  ).length;

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
          <CardTitle>Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <BadgesList badges={badges} />
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

      {isAdmin ? (
        <>
          <div>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              Family
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              How your Students are doing this week.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard
              label="Students"
              value={studentCards.length}
              accentClassName="bg-accent"
            />
            <StatCard
              label="Complete today"
              value={`${studentsCompleteToday}/${studentCards.length}`}
              sub="all 5 Salah logged"
              accentClassName="bg-primary"
            />
            <StatCard
              label="Avg weekly score"
              value={
                studentCards.length > 0
                  ? Math.round(
                      studentCards.reduce((sum, s) => sum + s.weeklyScore, 0) /
                        studentCards.length,
                    )
                  : 0
              }
              accentClassName="bg-gold"
            />
          </div>

          {studentCards.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Students</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {studentCards.map((student) => (
                  <StudentProgressCard
                    key={student.id}
                    memberId={student.id}
                    label={student.label}
                    todayCompleted={student.todayCompleted}
                    todayTotal={MANDATORY_PRAYERS.length}
                    weeklyScore={student.weeklyScore}
                  />
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Students</CardTitle>
                <CardDescription>
                  <Link href="/admin" className="underline underline-offset-4">
                    Add Students in Users
                  </Link>
                </CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          )}
        </>
      ) : null}
    </div>
  );
}
