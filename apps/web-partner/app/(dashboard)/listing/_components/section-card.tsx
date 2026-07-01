"use client";

import { AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../../_lib/utils/cn";

interface SectionCardProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  status: "complete" | "incomplete";
  preview: ReactNode;
  onEdit: () => void;
  className?: string;
}

export function SectionCard({
  icon,
  title,
  subtitle,
  status,
  preview,
  onEdit,
  className,
}: SectionCardProps) {
  return (
    <button
      type="button"
      onClick={onEdit}
      className={cn(
        "group relative flex w-full flex-col gap-3 rounded-card border bg-[var(--surface)] p-5 text-left transition-all",
        "hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
        status === "complete"
          ? "border-[var(--border)]"
          : "border-amber-300 dark:border-amber-800",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl",
              status === "complete"
                ? "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
                : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
            )}
          >
            {icon}
          </span>
          <div className="flex flex-col">
            <h3 className="text-base font-semibold tracking-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-[var(--muted-foreground)]">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {status === "complete" ? (
            <CheckCircle2
              className="h-4 w-4 text-accent-600"
              aria-label="To'liq"
            />
          ) : (
            <AlertCircle
              className="h-4 w-4 text-amber-600"
              aria-label="To'ldirilmagan"
            />
          )}
          <ChevronRight
            className="h-4 w-4 text-zinc-400 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </div>
      </div>

      <div className="min-h-[3rem]">{preview}</div>
    </button>
  );
}
