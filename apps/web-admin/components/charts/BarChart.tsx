"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { RevenueData } from "@/types/admin";

interface RevenueBarChartProps {
  data: RevenueData[];
}

function formatMillions(value: number): string {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(0) + "M";
  if (value >= 1_000) return (value / 1_000).toFixed(0) + "K";
  return String(value);
}

export default function RevenueBarChart({ data }: RevenueBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: "var(--text-muted)" }}
          axisLine={{ stroke: "var(--border)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "var(--text-muted)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatMillions}
          width={50}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            boxShadow: "var(--shadow-md)",
            fontSize: "13px",
            padding: "10px 14px",
          }}
          formatter={(value) => [
            new Intl.NumberFormat("uz-UZ").format(Number(value)) + " so'm",
          ]}
          labelStyle={{ fontWeight: 600, marginBottom: "4px", color: "var(--text-primary)" }}
        />
        <Legend
          iconType="rect"
          iconSize={10}
          wrapperStyle={{ fontSize: "13px", paddingTop: "12px" }}
        />
        <Bar
          dataKey="commission"
          fill="#1E3A5F"
          radius={[6, 6, 0, 0]}
          name="Komissiya"
          barSize={24}
        />
        <Bar
          dataKey="partnerPayment"
          fill="#2ECC71"
          radius={[6, 6, 0, 0]}
          name="Hamkorlar to'lovi"
          barSize={24}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
