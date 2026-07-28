import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Moon,
  RotateCcw,
  HeartHandshake,
  Landmark,
  BarChart3,
  Users,
  Settings,
} from "lucide-react";
import type { ModuleAccess } from "@/lib/module-access";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  module: keyof ModuleAccess | null;
  // Shown directly in the mobile bottom tab bar. Everything else collapses
  // into the "More" tab so the bar never carries more than 5 slots.
  primary: boolean;
};

export const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, module: null, primary: true },
  { href: "/ibadah", label: "Munājāh", icon: Moon, module: "ibadah", primary: true },
  { href: "/qala", label: "Qala", icon: RotateCcw, module: "qala", primary: true },
  {
    href: "/sponsorship",
    label: "Zād",
    icon: HeartHandshake,
    module: "sponsorship",
    primary: true,
  },
  {
    href: "/charity",
    label: "Sadaqah",
    icon: Landmark,
    module: "charity",
    primary: false,
  },
  { href: "/reports", label: "Reports", icon: BarChart3, module: "reports", primary: false },
  { href: "/admin", label: "Users", icon: Users, module: null, primary: false },
  { href: "/settings", label: "Settings", icon: Settings, module: null, primary: false },
];
