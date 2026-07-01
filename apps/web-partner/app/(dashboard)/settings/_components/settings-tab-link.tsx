"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "../../../_lib/utils/cn";

export function SettingsTabLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
        active
          ? "bg-brand-50 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200"
          : "text-zinc-600 hover:bg-[var(--surface-muted)] dark:text-zinc-300",
      )}
    >
      {children}
    </Link>
  );
}
