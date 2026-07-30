import { Moon, RotateCcw, HeartHandshake, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

// Placeholder content — not wired to activity_log or any live feed yet.
const PLACEHOLDER_ACTIVITY: {
  id: string;
  icon: LucideIcon;
  iconClassName: string;
  label: string;
  time: string;
}[] = [
  {
    id: "1",
    icon: Moon,
    iconClassName: "bg-primary/15 text-primary",
    label: "Fajr completed",
    time: "Today, 5:42 AM",
  },
  {
    id: "2",
    icon: RotateCcw,
    iconClassName: "bg-gold/20 text-gold-foreground",
    label: "2 Qala prayers completed",
    time: "Today, 7:10 AM",
  },
  {
    id: "3",
    icon: HeartHandshake,
    iconClassName: "bg-accent/15 text-accent",
    label: "Meal sponsored",
    time: "Yesterday",
  },
];

export function RecentActivity() {
  return (
    <Card>
      <CardContent className="flex flex-col pt-1">
        {PLACEHOLDER_ACTIVITY.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              "flex items-center gap-3 py-2.5",
              index !== PLACEHOLDER_ACTIVITY.length - 1 && "border-b border-border",
            )}
          >
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full",
                item.iconClassName,
              )}
            >
              <item.icon className="size-4" />
            </span>
            <span className="flex-1 text-sm font-medium text-foreground">{item.label}</span>
            <span className="shrink-0 text-xs text-muted-foreground">{item.time}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
