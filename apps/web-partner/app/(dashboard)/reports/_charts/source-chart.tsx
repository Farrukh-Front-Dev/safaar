"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface SourcePoint {
  name: string;
  value: number;
  color: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload: SourcePoint }>;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-xs shadow-lg">
      <p className="font-semibold">{p.name}</p>
      <p className="mt-1">
        <strong>{p.value}</strong> ta bron
      </p>
    </div>
  );
}

export function SourceChart({ data }: { data: SourcePoint[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="grid gap-4 md:grid-cols-[220px_1fr]">
      <div className="mx-auto w-full max-w-[220px]">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex flex-col gap-2 self-center">
        {data.map((d) => {
          const pct = total ? Math.round((d.value / total) * 100) : 0;
          return (
            <li key={d.name} className="flex items-center gap-3">
              <span
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: d.color }}
                aria-hidden
              />
              <span className="flex-1 text-sm font-medium">{d.name}</span>
              <span className="text-sm text-[var(--muted-foreground)]">
                <strong className="text-[var(--foreground)]">{d.value}</strong>{" "}
                · {pct}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
