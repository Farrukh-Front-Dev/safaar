"use client";

import { useState, useEffect } from "react";
import { MockApi } from "@/lib/api/mock-api";
import type { PromoCode } from "@/types/admin";
import DataTable from "@/components/ui/DataTable";
import type { Column } from "@/components/ui/DataTable";
import Button from "@/components/ui/Button";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { formatDate, formatPrice } from "@/lib/utils";

export default function PromosPage() {
  const [data, setData] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    MockApi.getPromos().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  const columns: Column<PromoCode>[] = [
    { key: "code", label: "Promo-kod", render: (row) => <span className="font-bold text-lg tracking-widest bg-[var(--bg-tertiary)] px-2 py-1 rounded">{row.code}</span> },
    { key: "discountValue", label: "Chegirma", render: (row) => <span className="font-medium text-[var(--accent)]">{row.discountType === "percent" ? `${row.discountValue}%` : formatPrice(row.discountValue)}</span> },
    { key: "usageLimit", label: "Foydalanish (ishlatildi / limit)", render: (row) => <span className="text-sm text-[var(--text-secondary)]">{row.usedCount} / {row.usageLimit}</span> },
    { key: "validUntil", label: "Amal qilish muddati", render: (row) => <span className="text-sm">{formatDate(row.validUntil)}</span> },
    {
      key: "isActive",
      label: "Holat",
      render: (row) => {
        const isExpired = new Date(row.validUntil).getTime() < Date.now();
        if (isExpired) {
          return <span className="px-2 py-1 rounded text-xs font-medium bg-[var(--danger)]/10 text-[var(--danger)]">Muddati o'tgan</span>;
        }
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${row.isActive ? "bg-[var(--success)]/10 text-[var(--success)]" : "bg-[var(--text-muted)]/10 text-[var(--text-secondary)]"}`}>
            {row.isActive ? "Faol" : "Nofaol"}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "",
      render: () => (
        <div className="flex justify-end gap-2">
          <button className="w-8 h-8 rounded flex items-center justify-center text-[var(--primary)] hover:bg-[var(--primary)]/10">
            <Edit2 size={14} />
          </button>
          <button className="w-8 h-8 rounded flex items-center justify-center text-[var(--danger)] hover:bg-[var(--danger)]/10">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <div className="flex justify-center p-12"><span className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-[1200px] mx-auto flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Promo-kodlar</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Mijozlar uchun chegirma kodlarini boshqarish</p>
        </div>
        <Button size="sm" icon={<Plus size={14} />}>Yangi promo-kod</Button>
      </div>
      <DataTable columns={columns} data={data} keyField="id" emptyMessage="Promo-kodlar topilmadi" />
    </div>
  );
}
