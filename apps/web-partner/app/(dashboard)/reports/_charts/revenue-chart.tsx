"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney } from "../../../_lib/utils/format";

interface RevenuePoint {
  date: string;
  revenue: number;
  bookings: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: RevenuePoint;
  }>;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-xs shadow-lg">
      <p className="font-semibold">
        {new Date(p.date).toLocaleDateString("uz-UZ", {
          day: "2-digit",
          month: "short",
          weekday: "short",
        })}
      </p>
      <p className="mt-1 text-brand-700 dark:text-brand-300">
        Daromad: <strong>{formatMoney(p.revenue)}</strong>
      </p>
      <p className="text-[var(--muted-foreground)]">
        {p.bookings} ta bron
      </p>
    </div>
  );
}

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="rev-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tickFormatter={(d) =>
            new Date(d).toLocaleDateString("uz-UZ", {
              day: "2-digit",
              month: "short",
            })
          }
          stroke="var(--muted-foreground)"
          fontSize={11}
          tickMargin={8}
          axisLine={false}
          tickLine={false}
          interval="preserveEnd"
          minTickGap={30}
        />
        <YAxis
          tickFormatter={(v) => `${Math.round(v / 1_000_000)}M`}
          stroke="var(--muted-foreground)"
          fontSize={11}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#2563eb"
          strokeWidth={2}
          fill="url(#rev-gradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
