import type { ReactNode } from "react";
import { Building2 } from "lucide-react";
import { SettingsTabLink } from "./_components/settings-tab-link";

const TABS = [
  {
    href: "/settings/hotel",
    label: "Mehmonxona",
    icon: Building2,
    desc: "Asosiy ma'lumotlar",
  },
];

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-widest text-brand-700 dark:text-brand-300">
          Sozlamalar
        </span>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Mehmonxonangizni sozlang
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Asosiy ma'lumotlar va mehmonxona sozlamalari.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav
          aria-label="Sozlamalar bo'limlari"
          className="flex flex-row gap-1 overflow-x-auto lg:flex-col lg:overflow-visible"
        >
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <SettingsTabLink key={t.href} href={t.href}>
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="flex flex-col leading-tight">
                  <span className="font-medium">{t.label}</span>
                  <span className="hidden text-[10px] text-[var(--muted-foreground)] lg:inline">
                    {t.desc}
                  </span>
                </span>
              </SettingsTabLink>
            );
          })}
        </nav>

        <div>{children}</div>
      </div>
    </div>
  );
}
