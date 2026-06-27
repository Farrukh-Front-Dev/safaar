import { BarChart3, Download } from "lucide-react";
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
        description="Daromad, to'liqlik va boshqa biznes ko'rsatkichlari."
        actions={
          <Button variant="outline" size="sm">
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
        <StatCard label="ADR" value={formatMoney(485_000)} hint="o'rtacha narx" />
        <StatCard
          label="RevPAR"
          value={formatMoney(359_000)}
          hint="bo'sh xona/sutka"
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
    </div>
  );
}
