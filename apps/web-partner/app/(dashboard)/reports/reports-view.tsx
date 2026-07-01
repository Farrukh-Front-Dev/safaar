"use client";

import {
  Activity,
  BedDouble,
  DollarSign,
  Download,
  PieChart as PieIcon,
  TrendingUp,
} from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
} from "../../_components/ui/card";
import { StatCard } from "../../_components/ui/stat-card";
import { Button } from "../../_components/ui/button";
import { PageHeader } from "../../_components/layout/page-header";
import { formatMoney } from "../../_lib/utils/format";
import {
  buildOccupancySeries,
  buildRevenueSeries,
  mockRoomTypeDistribution,
  mockSourceDistribution,
} from "../../_lib/mocks/reports-mock";
import { OccupancyChart } from "./_charts/occupancy-chart";
import { RevenueChart } from "./_charts/revenue-chart";
import { SourceChart } from "./_charts/source-chart";
import { cn } from "../../_lib/utils/cn";

export function ReportsView() {
  const revenue = useMemo(() => buildRevenueSeries(), []);
  const occupancy = useMemo(() => buildOccupancySeries(), []);

  const monthRevenue = revenue.reduce((s, d) => s + d.revenue, 0);
  const monthBookings = revenue.reduce((s, d) => s + d.bookings, 0);
  const avgOccupancy = Math.round(
    occupancy.reduce((s, d) => s + d.occupancy, 0) / occupancy.length,
  );
  const adr = monthBookings > 0 ? Math.round(monthRevenue / monthBookings) : 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Boshqaruv"
        title="Hisobotlar"
        description="30 kunlik biznes ko'rsatkichlari va trendlar."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info("PDF eksport keyingi sprint'da")}
          >
            <Download className="h-4 w-4" aria-hidden />
            PDF eksport
          </Button>
        }
      />

      {/* KPI'lar */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Oylik daromad"
          value={formatMoney(monthRevenue)}
          hint="oxirgi 30 kun"
          icon={<DollarSign className="h-5 w-5" aria-hidden />}
          trend={{ value: 12, positive: true }}
        />
        <StatCard
          label="O'rtacha to'liqlik"
          value={`${avgOccupancy}%`}
          hint="oy davomida"
          icon={<Activity className="h-5 w-5" aria-hidden />}
          trend={{ value: 5, positive: true }}
        />
        <StatCard
          label="ADR"
          value={formatMoney(adr)}
          hint="o'rtacha kunlik narx"
          icon={<TrendingUp className="h-5 w-5" aria-hidden />}
        />
        <StatCard
          label="Bronlar"
          value={monthBookings.toString()}
          hint="oxirgi 30 kun"
          icon={<BedDouble className="h-5 w-5" aria-hidden />}
          trend={{ value: 8, positive: true }}
        />
      </section>

      {/* Daromad chizig'i */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Daromad dinamikasi</CardTitle>
            <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
              Har kunlik daromad — dam olish kunlari yuqoriroq
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <RevenueChart data={revenue} />
        </CardBody>
      </Card>

      {/* Occupancy + Source yonma-yon */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>To'liqlik trend</CardTitle>
            <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
              Kunlik to'liqlik foizi — yashil 80%+, sariq 50-80%, qizil 50%'dan
              past
            </p>
          </CardHeader>
          <CardBody>
            <OccupancyChart data={occupancy} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieIcon className="h-4 w-4" aria-hidden />
              Bron manbalari
            </CardTitle>
            <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
              Bronlar qayerdan kelmoqda
            </p>
          </CardHeader>
          <CardBody>
            <SourceChart data={mockSourceDistribution} />
          </CardBody>
        </Card>
      </div>

      {/* Xona turlari bo'yicha */}
      <Card>
        <CardHeader>
          <CardTitle>Xona turlari bo'yicha</CardTitle>
          <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
            Qaysi xona turi ko'proq daromad keltirmoqda
          </p>
        </CardHeader>
        <CardBody className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)]/40 text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              <tr>
                <th className="px-5 py-3">Xona turi</th>
                <th className="px-5 py-3 text-right">Bronlar</th>
                <th className="px-5 py-3 text-right">Daromad</th>
                <th className="px-5 py-3">Nisbat</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const total = mockRoomTypeDistribution.reduce(
                  (s, r) => s + r.revenue,
                  0,
                );
                return mockRoomTypeDistribution.map((r) => {
                  const pct = total ? Math.round((r.revenue / total) * 100) : 0;
                  return (
                    <tr
                      key={r.name}
                      className="border-b border-[var(--border)] last:border-0"
                    >
                      <td className="px-5 py-3 font-medium">{r.name}</td>
                      <td className="px-5 py-3 text-right">{r.bookings}</td>
                      <td className="px-5 py-3 text-right font-medium">
                        {formatMoney(r.revenue)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                            <div
                              className={cn("h-full bg-brand-500")}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-10 text-right text-xs text-[var(--muted-foreground)]">
                            {pct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}
