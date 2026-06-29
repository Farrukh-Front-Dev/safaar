"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type PillNavItem = {
  label: string;
  href: string;
  ariaLabel?: string;
};

/**
 * Animatsiyali "pill" navigatsiya.
 *
 * Har bir element ustiga kelganda pastdan `primary` rangli doira ko'tarilib
 * pill'ni to'ldiradi, matn oqqa o'tadi (Aceternity uslubidagi hover-fill).
 * Effekt **sof CSS** (`group-hover`) — gsap/JS kerak emas, shuning uchun har
 * sahifada yengil va tez. Faol element doimiy `primary` fon bilan ajralib turadi.
 * `usePathname` faqat faol elementni aniqlash uchun ishlatiladi.
 *
 * A11y: `aria-current`, klaviatura fokusi (`focus-visible:ring`),
 * `motion-reduce` bilan animatsiya o'chiriladi.
 */
export function PillNav({
  items,
  className = "",
}: {
  items: PillNavItem[];
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Asosiy menyu" className={className}>
      <ul className="flex items-center gap-1">
        {items.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-label={item.ariaLabel ?? item.label}
                aria-current={isActive ? "page" : undefined}
                className={`group relative inline-flex h-9 items-center justify-center overflow-hidden rounded-full px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                  isActive ? "text-white" : "text-slate-700"
                }`}
              >
                {/* Faol holatdagi doimiy fon */}
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-primary-600"
                  />
                )}
                {/* Hover'da pastdan ko'tariladigan to'ldiruvchi doira */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute bottom-0 left-1/2 aspect-square w-[150%] -translate-x-1/2 translate-y-1/2 scale-0 rounded-full bg-primary-600 transition-transform duration-500 ease-out group-hover:scale-100 motion-reduce:transition-none"
                />
                <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default PillNav;
