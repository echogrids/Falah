import {
  Check,
  Clock,
  RotateCcw,
  X,
  User,
  Users,
  Landmark,
  Home,
  School,
  Briefcase,
  Car,
  MapPin,
  type LucideIcon,
} from "lucide-react";

export type ChipTone = {
  icon: LucideIcon;
  idleClassName: string;
  selectedClassName: string;
  badgeClassName: string;
};

// Kept aligned with the status colors already used elsewhere in the app
// (prayer beads, Qala tracker) rather than introducing new hues — on_time/
// late/qala/missed map to primary/accent/gold/destructive respectively.
export const STATUS_VISUALS: Record<string, ChipTone> = {
  on_time: {
    icon: Check,
    idleClassName:
      "border-primary/25 bg-primary/8 text-primary hover:bg-primary/15",
    selectedClassName: "border-primary bg-primary text-primary-foreground shadow-md",
    badgeClassName: "bg-primary/15 text-primary",
  },
  late: {
    icon: Clock,
    idleClassName: "border-accent/25 bg-accent/8 text-accent hover:bg-accent/15",
    selectedClassName: "border-accent bg-accent text-accent-foreground shadow-md",
    badgeClassName: "bg-accent/15 text-accent",
  },
  qala: {
    icon: RotateCcw,
    idleClassName:
      "border-gold/30 bg-gold/12 text-gold-foreground hover:bg-gold/20",
    selectedClassName: "border-gold bg-gold text-gold-foreground shadow-md",
    badgeClassName: "bg-gold/20 text-gold-foreground",
  },
  missed: {
    icon: X,
    idleClassName:
      "border-destructive/25 bg-destructive/8 text-destructive hover:bg-destructive/15",
    selectedClassName: "border-destructive bg-destructive text-white shadow-md",
    badgeClassName: "bg-destructive/15 text-destructive",
  },
};

export const PENDING_BADGE_CLASSNAME = "bg-muted text-muted-foreground";

export const CONGREGATION_ICONS: Record<string, LucideIcon> = {
  alone: User,
  jamaah: Users,
};

export const LOCATION_ICONS: Record<string, LucideIcon> = {
  masjid: Landmark,
  home: Home,
  school: School,
  work: Briefcase,
  travel: Car,
  other: MapPin,
};
