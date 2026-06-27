"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { ServiceDistribution } from "@/types/admin";

interface DonutChartProps {
  data: ServiceDistribution[];
}

export default function DonutChart({ data }: DonutChartProps) {
  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={180} height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              boxShadow: "var(--shadow-md)",
              fontSize: "13px",
              padding: "8px 12px",
            }}
            formatter={(value) => [`${value}%`]}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-col gap-3">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-3">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-[var(--text-primary)]">{item.name}</span>
              <span className="text-lg font-bold text-[var(--text-primary)]">{item.value}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
