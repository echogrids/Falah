import { createClient } from "@/lib/supabase/server";
import { PrayerBeads } from "@/components/layout/prayer-beads";
import { FalahMark } from "@/components/layout/falah-mark";
import { DateHeader } from "@/components/dashboard/date-header";
import { ModuleActionCard } from "@/components/home/module-action-card";
import { DEFAULT_MODULE_ACCESS, type ModuleAccess } from "@/lib/module-access";
import { displayName } from "@/lib/profile-label";
import { Moon, RotateCcw, HeartHandshake, Landmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const greetingName = profile?.first_name || (profile ? displayName(profile) : "");

  const today = isoDate(new Date());
  const [{ data: prayerEntries }, { data: charityOffers }] = await Promise.all([
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

  return (
    <div className="flex flex-col gap-6">
      <div className="relative overflow-hidden rounded-t-[2.5rem] rounded-b-2xl bg-primary px-6 py-8 text-primary-foreground shadow-[var(--shadow-lift)] sm:px-8">
        <div
          aria-hidden="true"
          className="bg-geo-pattern pointer-events-none absolute inset-0 text-primary-foreground opacity-[0.08]"
        />
        <div className="relative flex flex-col gap-1.5">
          <span className="flex items-center gap-2">
            <FalahMark className="size-3.5 shrink-0 text-primary-foreground/70" />
            <DateHeader />
          </span>
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Assalamu alaikum{greetingName ? `, ${greetingName}` : ""}
          </h1>
          <p className="text-primary-foreground/80">
            What would you like to log today?
          </p>
        </div>
      </div>

      {visibleTiles.length > 0 ? (
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
      ) : null}

      {moduleAccess.ibadah ? (
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s prayers</CardTitle>
          </CardHeader>
          <CardContent>
            <PrayerBeads statuses={statuses} />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
