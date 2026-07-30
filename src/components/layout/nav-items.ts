import type { LucideIcon } from "lucide-react";
import {
  Home,
  Moon,
  RotateCcw,
  HeartHandshake,
  Landmark,
  Target,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
} from "lucide-react";
import type { ModuleAccess } from "@/lib/module-access";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  module: keyof ModuleAccess | null;
  // Only shown to admin/master_admin, regardless of module_access.
  adminOnly?: boolean;
};

export const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: Home, module: null },
  { href: "/ibadah", label: "Munājāh", icon: Moon, module: "ibadah" },
  { href: "/qala", label: "Qala", icon: RotateCcw, module: "qala" },
  { href: "/sponsorship", label: "Zād", icon: HeartHandshake, module: "sponsorship" },
  { href: "/charity", label: "Sadaqah", icon: Landmark, module: "charity" },
  { href: "/niyyah", label: "Niyyah", icon: Target, module: "niyyah" },
  { href: "/reports", label: "Reports", icon: BarChart3, module: "reports" },
  { href: "/admin", label: "Family", icon: Users, module: null, adminOnly: true },
  { href: "/settings", label: "Settings", icon: Settings, module: null },
  { href: "/help", label: "Help", icon: HelpCircle, module: null },
];
