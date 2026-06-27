"use client";

import { useState, useEffect } from "react";
import { MockApi } from "@/lib/api/mock-api";
import type { CmsArticle } from "@/types/admin";
import DataTable from "@/components/ui/DataTable";
import type { Column } from "@/components/ui/DataTable";
import Button from "@/components/ui/Button";
import { Plus, Edit2, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function CmsOffersPage() {
  const [data, setData] = useState<CmsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    MockApi.getCmsNews().then((res) => {
      setData(res.filter((r) => r.type === "offer"));
      setLoading(false);
    });
  }, []);

  const columns: Column<CmsArticle>[] = [
    { key: "id", label: "ID", render: (row) => <span className="text-xs font-mono">{row.id}</span> },
    { key: "title", label: "Sarlavha", render: (row) => <span className="font-medium">{row.title}</span> },
    { key: "slug", label: "Slug (URL)", render: (row) => <span className="text-sm text-[var(--text-muted)]">{row.slug}</span> },
    {
      key: "status",
      label: "Holat",
      render: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${row.status === "published" ? "bg-[var(--success)]/10 text-[var(--success)]" : "bg-[var(--warning)]/10 text-[var(--warning)]"}`}>
          {row.status === "published" ? "Chop etilgan" : "Qoralama"}
        </span>
      ),
    },
    { key: "publishedAt", label: "Sana", render: (row) => <span className="text-sm">{row.publishedAt ? formatDate(row.publishedAt) : "—"}</span> },
    {
      key: "actions",
      label: "",
      render: () => (
        <div className="flex justify-end gap-2">
          <button className="w-8 h-8 rounded flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]">
            <Eye size={14} />
          </button>
          <button className="w-8 h-8 rounded flex items-center justify-center text-[var(--primary)] hover:bg-[var(--primary)]/10">
            <Edit2 size={14} />
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
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Maxsus Takliflar</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Aksiya va chegirmalar haqida ma'lumotlar</p>
        </div>
        <Button size="sm" icon={<Plus size={14} />}>Taklif qo'shish</Button>
      </div>
      <DataTable columns={columns} data={data} keyField="id" emptyMessage="Takliflar topilmadi" />
    </div>
  );
}
