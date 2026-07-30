import { Sunrise, Sun, SunMedium, Sunset, Moon, type LucideIcon } from "lucide-react";

export const PRAYER_VISUALS: Record<string, { icon: LucideIcon; className: string }> = {
  fajr: { icon: Sunrise, className: "bg-chart-1/20 text-chart-1 ring-1 ring-chart-1/30" },
  dhuhr: { icon: Sun, className: "bg-chart-3/20 text-chart-3 ring-1 ring-chart-3/30" },
  asr: { icon: SunMedium, className: "bg-chart-4/20 text-chart-4 ring-1 ring-chart-4/30" },
  maghrib: { icon: Sunset, className: "bg-chart-2/20 text-chart-2 ring-1 ring-chart-2/30" },
  isha: { icon: Moon, className: "bg-chart-5/20 text-chart-5 ring-1 ring-chart-5/30" },
};
