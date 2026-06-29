"use client";

import { BarChart3, Download, Info } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
} from "../../_components/ui/card";
import { StatCard } from "../../_components/ui/stat-card";
import { Button } from "../../_components/ui/button";
import { EmptyState } from "../../_components/ui/empty-state";
import { PageHeader } from "../../_components/layout/page-header";
import { formatMoney } from "../../_lib/utils/format";

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Boshqaruv"
        title="Hisobotlar"
        description="Daromad, to'liqlik va biznes ko'rsatkichlari."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast.info("PDF eksport keyingi sprint'da ulanadi")
            }
          >
            <Download className="h-4 w-4" aria-hidden />
            PDF eksport
          </Button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Oylik daromad"
          value={formatMoney(18_450_000)}
          trend={{ value: 12, positive: true }}
        />
        <StatCard
          label="Occupancy (oy)"
          value="74%"
          trend={{ value: 5, positive: true }}
        />
        <StatCard
          label="ADR"
          value={formatMoney(485_000)}
          hint="o'rtacha kunlik narx"
        />
        <StatCard
          label="RevPAR"
          value={formatMoney(359_000)}
          hint="bo'sh xonaga / sutka"
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" aria-hidden />
            Grafiklar
          </CardTitle>
        </CardHeader>
        <CardBody>
          <EmptyState
            icon={<BarChart3 className="h-10 w-10" aria-hidden />}
            title="Grafiklar tez orada"
            description="Sprint 6'da daromad/occupancy dinamikasi grafiklari (Recharts) qo'shiladi."
          />
        </CardBody>
      </Card>

      <div className="flex items-start gap-2 rounded-card border border-brand-200 bg-brand-50/50 p-4 text-sm text-brand-900 dark:border-brand-900/50 dark:bg-brand-950/30 dark:text-brand-200">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p>
          KPI qiymatlari demo. Real backend ulanganda <strong>oylik
          daromad</strong> va <strong>occupancy</strong> bronlar asosida
          avtomatik hisoblanadi.
        </p>
      </div>
    </div>
  );
}
