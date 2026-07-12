import type { ReactNode } from "react";
import { cn } from "../../_lib/utils/cn";

interface PageHeaderProps {
  title: ReactNode;
  description?: string;
  actions?: ReactNode;
  eyebrow?: string;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-3 rounded-card border border-[var(--border)] bg-[var(--panel-gradient)] px-4 py-4 shadow-card sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        {eyebrow && (
          <span className="inline-flex w-fit rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-brand-700 ring-1 ring-brand-100 dark:bg-brand-900 dark:text-brand-100 dark:ring-brand-800">
            {eyebrow}
          </span>
        )}
        <h1 className="text-2xl font-semibold md:text-[28px]">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </header>
  );
}
