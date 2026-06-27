import type { ReactNode } from "react";
import { cn } from "../../_lib/utils/cn";
import { Card, CardBody } from "./card";

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  trend?: { value: number; positive?: boolean };
  icon?: ReactNode;
  className?: string;
}

/** Dashboard'dagi KPI kartochkasi. */
export function StatCard({
  label,
  value,
  hint,
  trend,
  icon,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardBody className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-[var(--muted-foreground)]">{label}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {hint ? (
            <p className="text-xs text-[var(--muted-foreground)]">{hint}</p>
          ) : null}
          {trend ? (
            <p
              className={cn(
                "text-xs font-medium",
                trend.positive ? "text-accent-600" : "text-red-600",
              )}
            >
              {trend.positive ? "▲" : "▼"} {Math.abs(trend.value)}%
            </p>
          ) : null}
        </div>
        {icon ? (
          <div className="rounded-lg bg-brand-50 p-2 text-brand-700">
            {icon}
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}
