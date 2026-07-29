import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PrayerBeads } from "@/components/layout/prayer-beads";
import { FalahMark } from "@/components/layout/falah-mark";
import { DailyScoreChart } from "@/components/reports/daily-score-chart";
import { BadgesList } from "@/components/reports/badges-list";
import { LeaderboardTable } from "@/components/reports/leaderboard-table";
import { ActivityFeed, type ActivityRow } from "@/components/dashboard/activity-feed";
import { StatCard } from "@/components/dashboard/stat-card";
import { StudentProgressCard } from "@/components/dashboard/student-progress-card";
import { getDailyTotals } from "@/lib/reports/daily-totals";
import { getBadges } from "@/lib/reports/badges";
import { getLeaderboard } from "@/lib/reports/leaderboard";
import { getManageableStudents } from "@/lib/proxy-entry";
import { DEFAULT_MODULE_ACCESS, type ModuleAccess } from "@/lib/module-access";
import { MANDATORY_PRAYERS } from "@/lib/ibadah/constants";
import { formatRs } from "@/lib/format-currency";
import { profileLabel } from "@/lib/profile-label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const WINDOW_DAYS = 7;

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function DashboardPage() {
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
    .select("role, module_access")
    .eq("id", user.id)
    .single();

  const moduleAccess =
    (profile?.module_access as ModuleAccess | undefined) ?? DEFAULT_MODULE_ACCESS;
  const role = profile?.role ?? "member";
  const isAdmin = role === "admin" || role === "master_admin";

  const today = isoDate(new Date());
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - (WINDOW_DAYS - 1));
  const startIso = isoDate(start);
  const endIso = isoDate(end);

  const [
    { data: prayerEntries },
    dailyTotals,
    badges,
    { data: weekPrayerEntries },
  ] = await Promise.all([
    supabase
      .from("prayer_entries")
      .select("prayer, status")
      .eq("member_id", user.id)
      .eq("prayer_day", today),
    getDailyTotals(supabase, user.id, WINDOW_DAYS),
    getBadges(supabase, user.id),
    supabase
      .from("prayer_entries")
      .select("status")
      .eq("member_id", user.id)
      .gte("prayer_day", startIso)
      .lte("prayer_day", endIso),
  ]);

  const statuses: Record<string, string> = {};
  for (const entry of prayerEntries ?? []) {
    statuses[entry.prayer] = entry.status;
  }

  const todayScore = dailyTotals[dailyTotals.length - 1]?.score ?? 0;
  const weeklyScore = dailyTotals.reduce((sum, day) => sum + day.score, 0);
  const loggedCount = weekPrayerEntries?.length ?? 0;
  const onTimeCount =
    weekPrayerEntries?.filter((entry) => entry.status === "on_time").length ?? 0;
  const onTimeRate = loggedCount > 0 ? Math.round((onTimeCount / loggedCount) * 100) : 0;
  const bestStreak = Math.max(0, ...badges.map((badge) => badge.value));

  const [qalaBalancesResult, sponsorshipResult] = await Promise.all([
    moduleAccess.qala
      ? supabase.from("qala_balances").select("current_balance").eq("member_id", user.id)
      : Promise.resolve({ data: null }),
    moduleAccess.sponsorship
      ? supabase
          .from("sponsorships")
          .select(
            "intended_total, donated_total, pending_total, intended_meals, donated_meals, pending_meals",
          )
          .eq("member_id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const qalaOutstanding = moduleAccess.qala
    ? (qalaBalancesResult.data ?? []).reduce((sum, balance) => sum + balance.current_balance, 0)
    : null;

  const sponsorshipTotals = moduleAccess.sponsorship
    ? sponsorshipResult.data ?? {
        intended_total: 0,
        donated_total: 0,
        pending_total: 0,
        intended_meals: 0,
        donated_meals: 0,
        pending_meals: 0,
      }
    : null;

  let studentCards: Array<{
    id: string;
    email: string;
    todayCompleted: number;
    weeklyScore: number;
  }> = [];
  let familyLeaderboard: Awaited<ReturnType<typeof getLeaderboard>> = [];
  let activityRows: ActivityRow[] = [];
  let activityEmail = new Map<string, string>();

  if (isAdmin) {
    const students = await getManageableStudents(supabase, user.id, role);
    const studentIds = students.map((student) => student.id);
    const scopeIds = role === "master_admin" ? undefined : [...studentIds, user.id];

    const [todayRows, weeklyPerStudent, leaderboard, { data: activityData }] =
      await Promise.all([
        studentIds.length > 0
          ? supabase
              .from("prayer_entries")
              .select("member_id, prayer")
              .in("member_id", studentIds)
              .eq("prayer_day", today)
          : Promise.resolve({ data: [] as { member_id: string; prayer: string }[] }),
        Promise.all(studentIds.map((id) => getDailyTotals(supabase, id, WINDOW_DAYS))),
        getLeaderboard(supabase, startIso, scopeIds),
        supabase
          .from("activity_log")
          .select("id, actor_id, action, target_type, target_id, created_at")
          .order("created_at", { ascending: false })
          .limit(8),
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
      email: student.email,
      todayCompleted: todayCountByStudent.get(student.id) ?? 0,
      weeklyScore: weeklyPerStudent[index].reduce((sum, day) => sum + day.score, 0),
    }));

    familyLeaderboard = leaderboard;
    activityRows = activityData ?? [];

    const activityUserIds = Array.from(
      new Set(
        activityRows
          .flatMap((row) => [row.actor_id, row.target_id])
          .filter((id): id is string => Boolean(id)),
      ),
    );
    if (activityUserIds.length > 0) {
      const { data: activityProfiles } = await supabase
        .from("profiles")
        .select("id, email, username")
        .in("id", activityUserIds);
      activityEmail = new Map((activityProfiles ?? []).map((p) => [p.id, profileLabel(p)]));
    }
  }

  const studentsCompleteToday = studentCards.filter(
    (student) => student.todayCompleted >= MANDATORY_PRAYERS.length,
  ).length;

  const displayDate = end.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="relative overflow-hidden rounded-t-[2.5rem] rounded-b-2xl bg-primary px-6 py-8 text-primary-foreground shadow-[var(--shadow-lift)] sm:px-8">
        <div
          aria-hidden="true"
          className="bg-geo-pattern pointer-events-none absolute inset-0 text-primary-foreground opacity-[0.08]"
        />
        <div className="relative flex flex-col gap-1.5">
          <span className="flex items-center gap-2 text-sm font-medium text-primary-foreground/70">
            <FalahMark className="size-3.5" />
            {displayDate}
          </span>
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Assalamu alaikum
          </h1>
          <p className="text-primary-foreground/80">
            {isAdmin
              ? "Here's today, so far — for you and your family."
              : "Here's today, so far."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Today's score" value={todayScore} accentClassName="bg-primary" />
        <StatCard
          label={`${WINDOW_DAYS}-day score`}
          value={weeklyScore}
          accentClassName="bg-accent"
        />
        <StatCard
          label="On-time rate"
          value={`${onTimeRate}%`}
          sub="last 7 days"
          accentClassName="bg-gold"
        />
        <StatCard
          label="Best streak"
          value={bestStreak}
          sub="days"
          accentClassName="bg-chart-4"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s prayers</CardTitle>
          <CardDescription>
            <Link href="/ibadah" className="underline underline-offset-4">
              Log today&apos;s Munājāh
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PrayerBeads statuses={statuses} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>This week</CardTitle>
          <CardDescription>
            <Link href="/reports" className="underline underline-offset-4">
              Full reports
            </Link>
          </CardDescription>
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

      {moduleAccess.qala || moduleAccess.sponsorship ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {moduleAccess.qala ? (
            <Card>
              <CardHeader>
                <CardTitle>Qala Tracker</CardTitle>
                <CardDescription>
                  <Link href="/qala" className="underline underline-offset-4">
                    Manage balances
                  </Link>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-foreground">
                  {qalaOutstanding ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  prayers still outstanding
                </p>
              </CardContent>
            </Card>
          ) : null}
          {moduleAccess.sponsorship ? (
            <Card>
              <CardHeader>
                <CardTitle>Zād</CardTitle>
                <CardDescription>
                  <Link href="/sponsorship" className="underline underline-offset-4">
                    Log a transaction
                  </Link>
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="font-sans text-base font-semibold tabular-nums text-foreground">
                    {formatRs(sponsorshipTotals?.intended_total ?? 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Intended · {sponsorshipTotals?.intended_meals ?? 0} meals
                  </p>
                </div>
                <div>
                  <p className="font-sans text-base font-semibold tabular-nums text-foreground">
                    {formatRs(sponsorshipTotals?.donated_total ?? 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Donated · {sponsorshipTotals?.donated_meals ?? 0} meals
                  </p>
                </div>
                <div>
                  <p className="font-sans text-base font-semibold tabular-nums text-foreground">
                    {formatRs(sponsorshipTotals?.pending_total ?? 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Pending · {sponsorshipTotals?.pending_meals ?? 0} meals
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : null}

      {isAdmin ? (
        <>
          <div>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              Family overview
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
                    email={student.email}
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

          <Card>
            <CardHeader>
              <CardTitle>Leaderboard</CardTitle>
              <CardDescription>Last {WINDOW_DAYS} days.</CardDescription>
            </CardHeader>
            <CardContent>
              <LeaderboardTable entries={familyLeaderboard} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>
                <Link href="/admin" className="underline underline-offset-4">
                  Full activity log
                </Link>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityFeed rows={activityRows} emailById={activityEmail} />
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
