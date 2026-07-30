import { createClient } from "@/lib/supabase/server";
import { GreetingCard } from "@/components/home/greeting-card";
import { TodaysProgress } from "@/components/home/todays-progress";
import { TodaysReminder } from "@/components/home/todays-reminder";
import { FeaturedBadgeCard } from "@/components/home/featured-badge-card";
import { RecentActivity } from "@/components/home/recent-activity";
import { ModuleActionCard } from "@/components/home/module-action-card";
import { getBadges } from "@/lib/reports/badges";
import { DEFAULT_MODULE_ACCESS, type ModuleAccess } from "@/lib/module-access";
import { Moon, RotateCcw, HeartHandshake, Landmark } from "lucide-react";
import { formatMoney } from "@/lib/format-currency";

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

const ACTION_TILES = [
  {
    module: "ibadah" as const,
    href: "/ibadah",
    label: "Munājāh",
    description: "Log today's prayers",
    icon: Moon,
    badgeClassName: "bg-primary/15",
    iconClassName: "text-primary",
  },
  {
    module: "qala" as const,
    href: "/qala",
    label: "Qala",
    description: "Log completed Qala",
    icon: RotateCcw,
    badgeClassName: "bg-gold/20",
    iconClassName: "text-gold-foreground",
  },
  {
    module: "sponsorship" as const,
    href: "/sponsorship",
    label: "Zād",
    description: "Log a transaction",
    icon: HeartHandshake,
    badgeClassName: "bg-accent/15",
    iconClassName: "text-accent",
  },
  {
    module: "charity" as const,
    href: "/charity",
    label: "Sadaqah",
    description: "Log a donation",
    icon: Landmark,
    badgeClassName: "bg-terracotta/20",
    iconClassName: "text-terracotta-foreground",
  },
];

export default async function HomePage() {
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
    .select("module_access, first_name, last_name, username, email")
    .eq("id", user.id)
    .single();

  const moduleAccess =
    (profile?.module_access as ModuleAccess | undefined) ?? DEFAULT_MODULE_ACCESS;

  const today = isoDate(new Date());
  const [{ data: prayerEntries }, { data: charityOffers }, badges] = await Promise.all([
    supabase
      .from("prayer_entries")
      .select("prayer, status")
      .eq("member_id", user.id)
      .eq("prayer_day", today),
    moduleAccess.charity
      ? supabase
          .from("charity_offers")
          .select("amount, currency, paid_total, status")
          .eq("member_id", user.id)
      : Promise.resolve({ data: null }),
    getBadges(supabase, user.id),
  ]);

  const statuses: Record<string, string> = {};
  for (const entry of prayerEntries ?? []) {
    statuses[entry.prayer] = entry.status;
  }

  // Sum offered-but-unpaid across offers, per currency (never combined
  // across currencies), so the home tile mirrors the Sadaqah page's own
  // pending calculation.
  const sadaqahPendingByCurrency = new Map<string, number>();
  for (const offer of charityOffers ?? []) {
    if (offer.status === "fulfilled" || offer.status === "cancelled") continue;
    const pending = offer.amount - offer.paid_total;
    sadaqahPendingByCurrency.set(
      offer.currency,
      (sadaqahPendingByCurrency.get(offer.currency) ?? 0) + pending,
    );
  }
  const sadaqahBadge =
    Array.from(sadaqahPendingByCurrency.entries())
      .filter(([, pending]) => pending > 0)
      .map(([currency, pending]) => formatMoney(pending, currency))
      .join(" · ") || undefined;

  const statusBadgeByModule: Partial<Record<(typeof ACTION_TILES)[number]["module"], string>> = {
    charity: sadaqahBadge,
  };

  const visibleTiles = ACTION_TILES.filter((tile) => moduleAccess[tile.module]);

  const featuredBadge =
    badges.find((badge) => badge.earned) ??
    badges.reduce((best, badge) => (badge.value > best.value ? badge : best), badges[0]) ??
    null;

  return (
    <div className="flex flex-col gap-7">
      <GreetingCard firstName={profile?.first_name ?? undefined} />

      <TodaysProgress statuses={statuses} />

      {visibleTiles.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="px-1 font-heading text-lg font-semibold text-foreground">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {visibleTiles.map((tile) => (
              <ModuleActionCard
                key={tile.href}
                href={tile.href}
                label={tile.label}
                description={tile.description}
                icon={tile.icon}
                badgeClassName={tile.badgeClassName}
                iconClassName={tile.iconClassName}
                statusBadge={statusBadgeByModule[tile.module]}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="px-1 font-heading text-lg font-semibold text-foreground">
          Today&apos;s Reminder
        </h2>
        <TodaysReminder />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="px-1 font-heading text-lg font-semibold text-foreground">Badges</h2>
        <FeaturedBadgeCard badge={featuredBadge} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="px-1 font-heading text-lg font-semibold text-foreground">
          Recent Activity
        </h2>
        <RecentActivity />
      </section>
    </div>
  );
}
