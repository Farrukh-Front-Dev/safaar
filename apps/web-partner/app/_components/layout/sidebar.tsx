"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, Hotel } from "lucide-react";
import { cn } from "../../_lib/utils/cn";
import { useUiStore } from "../../_stores/ui-store";
import { NAV_GROUPS } from "./sidebar-nav";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggle = useUiStore((s) => s.toggleSidebar);

  return (
    <aside
      className={cn(
        "sticky top-0 z-30 flex h-screen shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-[width] duration-200",
        collapsed ? "w-16" : "w-64",
      )}
      aria-label="Asosiy navigatsiya"
    >
      <div className="flex h-16 items-center justify-between border-b border-[var(--border)] px-3">
        <Link
          href="/"
          className="flex items-center gap-2 overflow-hidden"
          aria-label="UzBron bosh sahifa"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-700 text-white shadow-sm">
            <Hotel className="h-4 w-4" aria-hidden />
          </span>
          {!collapsed && (
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-bold tracking-tight">UzBron</span>
              <span className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)]">
                Hamkor
              </span>
            </span>
          )}
        </Link>
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Panel'ni ochish" : "Panel'ni yopish"}
          className="rounded-md p-1.5 text-zinc-500 hover:bg-[var(--surface-muted)]"
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              collapsed && "rotate-180",
            )}
            aria-hidden
          />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="flex flex-col gap-4">
          {NAV_GROUPS.map((group, gi) => (
            <li key={gi} className="flex flex-col gap-1">
              {group.title && !collapsed && (
                <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
                  {group.title}
                </p>
              )}
              <ul className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          active
                            ? "bg-brand-50 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200"
                            : "text-zinc-600 hover:bg-[var(--surface-muted)] hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white",
                        )}
                        title={collapsed ? item.label : undefined}
                      >
                        {active && (
                          <span
                            className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r bg-brand-700 dark:bg-brand-400"
                            aria-hidden
                          />
                        )}
                        <Icon className="h-4 w-4 shrink-0" aria-hidden />
                        {!collapsed && (
                          <>
                            <span className="flex-1 truncate">
                              {item.label}
                            </span>
                            {item.badge && (
                              <span className="rounded-full bg-accent-100 px-1.5 py-0.5 text-[10px] font-semibold text-accent-700">
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </nav>

      {!collapsed && (
        <div className="border-t border-[var(--border)] p-4 text-xs leading-tight text-[var(--muted-foreground)]">
          <p className="font-semibold text-[var(--foreground)]">
            UzBron Hamkor v0.1
          </p>
          <p>partner.uzbron.uz</p>
        </div>
      )}
    </aside>
  );
}
