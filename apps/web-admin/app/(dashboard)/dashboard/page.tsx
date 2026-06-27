"use client";

import { StatCard } from "@/components/ui/Card";
import Card from "@/components/ui/Card";
import BookingLineChart from "@/components/charts/LineChart";
import RevenueBarChart from "@/components/charts/BarChart";
import DonutChart from "@/components/charts/DonutChart";
import {
  dashboardStats,
  bookingTrends,
  revenueData,
  serviceDistribution,
  recentActivities,
  quickActions,
} from "@/lib/mock-data";
import { timeAgo } from "@/lib/utils";
import {
  Users, Building2, CalendarCheck, Wallet, TrendingUp, XCircle,
  UserPlus, CalendarPlus, Building, AlertTriangle, ArrowRight,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

const STAT_ICONS: Record<string, ReactNode> = {
  Users: <Users size={20} />,
  Building2: <Building2 size={20} />,
  CalendarCheck: <CalendarCheck size={20} />,
  Wallet: <Wallet size={20} />,
  TrendingUp: <TrendingUp size={20} />,
  XCircle: <XCircle size={20} />,
};

const ACTIVITY_ICONS: Record<string, ReactNode> = {
  UserPlus: <UserPlus size={16} />,
  CalendarPlus: <CalendarPlus size={16} />,
  Building: <Building size={16} />,
  Wallet: <Wallet size={16} />,
  XCircle: <XCircle size={16} />,
  AlertTriangle: <AlertTriangle size={16} />,
};

const ACTIVITY_COLORS: Record<string, string> = {
  user_registered: "#3498DB",
  booking_created: "#2ECC71",
  partner_request: "#9B59B6",
  payment_request: "#F39C12",
  booking_cancelled: "#E74C3C",
  complaint: "#E74C3C",
};

export default function DashboardPage() {
  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
          Bosh panel
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Platformaning umumiy ko&apos;rsatkichlari va statistikasi
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 stagger-children">
        {dashboardStats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            icon={STAT_ICONS[stat.icon] ?? <Users size={20} />}
            color={stat.color}
          />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings trend */}
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">Bronlar dinamikasi</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">So&apos;nggi 30 kun</p>
            </div>
          </div>
          <BookingLineChart data={bookingTrends} />
        </Card>

        {/* Revenue */}
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">Daromad dinamikasi</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Oylik</p>
            </div>
          </div>
          <RevenueBarChart data={revenueData} />
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut chart */}
        <Card padding="lg">
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">
            Xizmat turlari taqsimoti
          </h3>
          <DonutChart data={serviceDistribution} />
        </Card>

        {/* Recent activity */}
        <Card padding="lg" className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              So&apos;nggi harakatlar
            </h3>
            <span className="flex items-center gap-1.5 text-xs text-[var(--accent)] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
              Real-time
            </span>
          </div>
          <div className="flex flex-col gap-1 max-h-[340px] overflow-y-auto pr-1">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    backgroundColor: (ACTIVITY_COLORS[activity.type] ?? "#94A3B8") + "14",
                    color: ACTIVITY_COLORS[activity.type] ?? "#94A3B8",
                  }}
                >
                  {ACTIVITY_ICONS[activity.icon] ?? <CalendarPlus size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--text-primary)] leading-snug">{activity.message}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{timeAgo(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick actions */}
        <Card padding="lg">
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">
            Tezkor harakatlar
          </h3>
          <div className="flex flex-col gap-2">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] hover:border-[var(--primary)]/20 hover:bg-[var(--primary-50)] transition-all group"
              >
                <span
                  className="text-xl font-bold min-w-[48px] h-12 flex items-center justify-center rounded-xl"
                  style={{ color: action.color, backgroundColor: action.color + "12" }}
                >
                  {action.count}
                </span>
                <span className="flex-1 text-sm font-medium text-[var(--text-primary)]">
                  {action.label}
                </span>
                <ArrowRight
                  size={16}
                  className="text-[var(--text-muted)] group-hover:text-[var(--primary)] group-hover:translate-x-0.5 transition-all"
                />
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
