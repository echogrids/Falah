import Link from "next/link";
import { Award, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import type { Badge } from "@/lib/reports/badges";

export function FeaturedBadgeCard({ badge }: { badge: Badge | null }) {
  if (!badge) return null;

  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-1">
        <span
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-2xl",
            badge.earned ? "bg-gold/20 text-gold-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          <Award className="size-6" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="font-heading text-sm font-semibold text-foreground">
            {badge.label}
          </span>
          <span className="text-xs text-muted-foreground">
            {badge.earned ? "Earned" : `${badge.value} so far`}
          </span>
        </div>
        <Link
          href="/badges"
          className="flex shrink-0 items-center gap-1 text-xs font-semibold text-primary"
        >
          View All
          <ArrowRight className="size-3.5" />
        </Link>
      </CardContent>
    </Card>
  );
}
