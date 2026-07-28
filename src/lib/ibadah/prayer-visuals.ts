import { Sunrise, Sun, CloudSun, Sunset, MoonStar, type LucideIcon } from "lucide-react";

export const PRAYER_VISUALS: Record<string, { icon: LucideIcon; className: string }> = {
  fajr: { icon: Sunrise, className: "bg-chart-1/15 text-chart-1" },
  dhuhr: { icon: Sun, className: "bg-chart-3/15 text-chart-3" },
  asr: { icon: CloudSun, className: "bg-chart-4/15 text-chart-4" },
  maghrib: { icon: Sunset, className: "bg-chart-2/15 text-chart-2" },
  isha: { icon: MoonStar, className: "bg-chart-5/15 text-chart-5" },
};
