import { FalahMark } from "@/components/layout/falah-mark";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">About</h1>
        <p className="mt-1 text-muted-foreground">A little about Falah.</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-3 pt-2 pb-6 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <FalahMark className="size-7" />
          </span>
          <div>
            <p className="font-heading text-lg font-semibold text-foreground">Falah</p>
            <p className="text-sm text-muted-foreground">Family Ibadah Tracker</p>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            Falah helps families log prayers, worship, and acts of charity together —
            a quiet space to build consistent habits, not a place to compete.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
