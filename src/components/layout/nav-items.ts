import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Moon,
  RotateCcw,
  HeartHandshake,
  Users,
  Settings,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ibadah", label: "Ibadah", icon: Moon },
  { href: "/qala", label: "Qala", icon: RotateCcw },
  { href: "/sponsorship", label: "Sponsorship", icon: HeartHandshake },
  { href: "/admin", label: "Users", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];
