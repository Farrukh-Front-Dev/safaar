"use client";

import { useState, useEffect } from "react";
import { MockApi } from "@/lib/api/mock-api";
import type { CmsBanner } from "@/types/admin";
import DataTable from "@/components/ui/DataTable";
import type { Column } from "@/components/ui/DataTable";
import Button from "@/components/ui/Button";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function CmsBannersPage() {
  const [data, setData] = useState<CmsBanner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    MockApi.getCmsBanners().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  const columns: Column<CmsBanner>[] = [
    { key: "order", label: "Tartib", render: (row) => <span className="font-medium text-lg">{row.order}</span> },
    { key: "imageUrl", label: "Rasm", render: (row) => <div className="w-24 h-12 bg-[var(--bg-tertiary)] rounded flex items-center justify-center text-[10px] text-[var(--text-muted)] truncate px-1">{row.imageUrl}</div> },
    { key: "title", label: "Sarlavha", render: (row) => <span className="font-medium">{row.title}</span> },
    { key: "link", label: "Havola (Link)", render: (row) => <span className="text-sm text-[var(--primary)] underline cursor-pointer">{row.link}</span> },
    {
      key: "isActive",
      label: "Holat",
      render: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${row.isActive ? "bg-[var(--success)]/10 text-[var(--success)]" : "bg-[var(--text-muted)]/10 text-[var(--text-secondary)]"}`}>
          {row.isActive ? "Faol" : "Nofaol"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: () => (
        <div className="flex justify-end gap-2">
          <button onClick={() => toast.info("Tahrirlash funksiyasi tez orada qo'shiladi")} className="w-8 h-8 rounded flex items-center justify-center text-[var(--primary)] hover:bg-[var(--primary)]/10">
            <Edit2 size={14} />
          </button>
          <button onClick={() => toast.info("O'chirish funksiyasi tez orada qo'shiladi")} className="w-8 h-8 rounded flex items-center justify-center text-[var(--danger)] hover:bg-[var(--danger)]/10">
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
        
        <Button size="sm" icon={<Plus size={14} />}>Yangi Banner</Button>
      </div>
      <DataTable columns={columns} data={data} keyField="id" emptyMessage="Bannerlar topilmadi" />
    </div>
  );
}
