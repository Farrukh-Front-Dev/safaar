"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useMounted } from "../../_hooks/use-mounted";
import { cn } from "../../_lib/utils/cn";

const options = [
  { value: "light", icon: Sun, label: "Yorug'" },
  { value: "system", icon: Monitor, label: "Tizim" },
  { value: "dark", icon: Moon, label: "Qorong'i" },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted) {
    return (
      <div
        aria-hidden
        className="h-9 w-[7.5rem] rounded-full bg-[var(--surface-muted)]"
      />
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Tema tanlash"
      className="inline-flex items-center rounded-md border border-[var(--border)] bg-[var(--surface-muted)] p-1"
    >
      {options.map(({ value, icon: Icon, label }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-[var(--surface-hover)]",
              active &&
                "bg-[var(--surface)] text-brand-700 shadow-sm dark:text-brand-300",
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
