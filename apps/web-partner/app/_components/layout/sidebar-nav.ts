import {
  BarChart3,
  BedDouble,
  CalendarDays,
  CalendarRange,
  ConciergeBell,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export interface NavGroup {
  title?: string;
  items: NavItem[];
}

/** Mehmonxona staff paneli — guruhlangan navigatsiya. */
export const NAV_GROUPS: NavGroup[] = [
  {
    items: [{ label: "Front Desk", href: "/", icon: ConciergeBell }],
  },
  {
    title: "Operatsion",
    items: [
      { label: "Bronlar", href: "/reservations", icon: CalendarRange },
      { label: "Kalendar", href: "/calendar", icon: CalendarDays },
      { label: "Xonalar", href: "/rooms", icon: BedDouble },
    ],
  },
  {
    title: "Mijoz",
    items: [{ label: "Mijozlar", href: "/guests", icon: Users }],
  },
  {
    title: "Boshqaruv",
    items: [
      { label: "Hisobotlar", href: "/reports", icon: BarChart3 },
      { label: "Sozlamalar", href: "/settings/hotel", icon: Settings },
    ],
  },
];
