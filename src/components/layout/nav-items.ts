import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Moon,
  RotateCcw,
  HeartHandshake,
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
};

export const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, module: null },
  { href: "/ibadah", label: "Ibadah", icon: Moon, module: "ibadah" },
  { href: "/qala", label: "Qala", icon: RotateCcw, module: "qala" },
  {
    href: "/sponsorship",
    label: "Sponsorship",
    icon: HeartHandshake,
    module: "sponsorship",
  },
  { href: "/reports", label: "Reports", icon: BarChart3, module: "reports" },
  { href: "/admin", label: "Users", icon: Users, module: null },
  { href: "/settings", label: "Settings", icon: Settings, module: null },
];
