import {
  BarChart3,
  CalendarDays,
  CalendarRange,
  ConciergeBell,
  Megaphone,
  Settings,
  Users,
  BedDouble,
  LifeBuoy,
  Bus,
  Route,
  Ticket,
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

/**
 * Dinamik navigatsiya paneli — hamkor turiga qarab o'zgaradi.
 */
export function getNavGroups(partnerType: string): NavGroup[] {
  const type = partnerType?.toLowerCase() || "hotel";

  // 1. Avtobuslar / Transport hamkorlar uchun navigatsiya
  if (type === "bus") {
    return [
      {
        items: [{ label: "Reyting va Asosiy", href: "/", icon: ConciergeBell }],
      },
      {
        title: "Sotuv",
        items: [{ label: "Kompaniya e'loni", href: "/listing", icon: Megaphone }],
      },
      {
        title: "Operatsion",
        items: [
          { label: "Avtobuslar", href: "/rooms", icon: Bus }, // /rooms sahifasini Avtobuslar deb nomlaymiz
          { label: "Yo'nalishlar", href: "/calendar", icon: Route }, // kalendarni Yo'nalishlar jadvali sifatida ishlatamiz
          { label: "Chiptalar (Bronlar)", href: "/reservations", icon: Ticket },
        ],
      },
      {
        title: "Yo'lovchi",
        items: [{ label: "Yo'lovchilar", href: "/guests", icon: Users }],
      },
      {
        title: "Boshqaruv",
        items: [
          { label: "Hisobotlar", href: "/reports", icon: BarChart3 },
          { label: "Sozlamalar", href: "/settings/hotel", icon: Settings },
          { label: "Yordam", href: "/support", icon: LifeBuoy },
        ],
      },
    ];
  }

  // 2. Dacha hamkorlar uchun navigatsiya (xonalar shart emas, dacha o'zi bitta xona)
  if (type === "dacha") {
    return [
      {
        items: [{ label: "Boshqaruv paneli", href: "/", icon: ConciergeBell }],
      },
      {
        title: "Sotuv",
        items: [{ label: "Dacha e'loni", href: "/listing", icon: Megaphone }],
      },
      {
        title: "Operatsion",
        items: [
          { label: "Dacha kalendari", href: "/calendar", icon: CalendarDays },
          { label: "Bronlar", href: "/reservations", icon: CalendarRange },
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
          { label: "Yordam", href: "/support", icon: LifeBuoy },
        ],
      },
    ];
  }

  // 3. Hostel uchun navigatsiya
  if (type === "hostel") {
    return [
      {
        items: [{ label: "Front Desk", href: "/", icon: ConciergeBell }],
      },
      {
        title: "Sotuv",
        items: [{ label: "Hostel e'loni", href: "/listing", icon: Megaphone }],
      },
      {
        title: "Operatsion",
        items: [
          { label: "Yotoqlar (Joylar)", href: "/rooms", icon: BedDouble },
          { label: "Band qilishlar", href: "/reservations", icon: CalendarRange },
          { label: "Kalendar", href: "/calendar", icon: CalendarDays },
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
          { label: "Yordam", href: "/support", icon: LifeBuoy },
        ],
      },
    ];
  }

  // 4. Standart / Mehmonxona (Hotel, Motel, Guesthouse)
  return [
    {
      items: [{ label: "Front Desk", href: "/", icon: ConciergeBell }],
    },
    {
      title: "Sotuv",
      items: [{ label: "Mehmonxona e'loni", href: "/listing", icon: Megaphone }],
    },
    {
      title: "Operatsion",
      items: [
        { label: "Xonalar", href: "/rooms", icon: BedDouble },
        { label: "Bronlar", href: "/reservations", icon: CalendarRange },
        { label: "Kalendar", href: "/calendar", icon: CalendarDays },
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
        { label: "Yordam", href: "/support", icon: LifeBuoy },
      ],
    },
  ];
}
