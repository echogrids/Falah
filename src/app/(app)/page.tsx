import { PrayerBeads } from "@/components/layout/prayer-beads";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
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
            Entries and scoring open once Module 1 is built.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PrayerBeads />
        </CardContent>
      </Card>
    </div>
  );
}
