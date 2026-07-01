"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface OccupancyPoint {
  date: string;
  occupancy: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload: OccupancyPoint }>;
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
      <p className="mt-1">
        To'liqlik: <strong>{p.occupancy}%</strong>
      </p>
    </div>
  );
}

function colorForOccupancy(percent: number): string {
  if (percent >= 80) return "#10b981"; // accent green
  if (percent >= 50) return "#f59e0b"; // amber
  return "#ef4444"; // red
}

export function OccupancyChart({ data }: { data: OccupancyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
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
          tickFormatter={(v) => `${v}%`}
          domain={[0, 100]}
          stroke="var(--muted-foreground)"
          fontSize={11}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "rgba(0,0,0,0.04)" }}
        />
        <Bar dataKey="occupancy" radius={[3, 3, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={colorForOccupancy(d.occupancy)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
