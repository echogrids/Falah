import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PrayerBeads } from "@/components/layout/prayer-beads";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = todayIso();
  const { data: prayerEntries } = await supabase
    .from("prayer_entries")
    .select("prayer, status")
    .eq("member_id", user?.id)
    .eq("prayer_day", today);

  const statuses: Record<string, string> = {};
  for (const entry of prayerEntries ?? []) {
    statuses[entry.prayer] = entry.status;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Assalamu alaikum
        </h1>
        <p className="mt-1 text-muted-foreground">Here&apos;s today, so far.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s prayers</CardTitle>
          <CardDescription>
            <Link href="/ibadah" className="underline underline-offset-4">
              Log today&apos;s Ibadah
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PrayerBeads statuses={statuses} />
        </CardContent>
      </Card>
    </div>
  );
}
