"use client";

import { useState, useEffect } from "react";
import { MockApi } from "@/lib/api/mock-api";
import type { SupportTicket } from "@/types/admin";
import DataTable from "@/components/ui/DataTable";
import type { Column } from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";
import { Eye, MessageCircle } from "lucide-react";

const STATUS_MAP = {
  open: { label: "Ochiq", color: "var(--danger)", bg: "rgba(231, 76, 60, 0.1)" },
  in_progress: { label: "Jarayonda", color: "var(--warning)", bg: "rgba(243, 156, 18, 0.1)" },
  closed: { label: "Yopilgan", color: "var(--success)", bg: "rgba(46, 204, 113, 0.1)" },
};

const PRIORITY_MAP = {
  low: { label: "Past", color: "bg-[var(--success)]/10 text-[var(--success)]" },
  medium: { label: "O'rta", color: "bg-[var(--warning)]/10 text-[var(--warning)]" },
  high: { label: "Yuqori", color: "bg-[var(--danger)]/10 text-[var(--danger)] font-bold" },
} as const;

export default function SupportPage() {
  const [data, setData] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    MockApi.getTickets().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  const columns: Column<SupportTicket>[] = [
    { key: "id", label: "Ticket ID", render: (row) => <span className="text-xs font-mono font-bold text-[var(--primary)]">{row.id}</span> },
    { key: "subject", label: "Mavzu", render: (row) => <span className="font-medium text-[var(--text-primary)]">{row.subject}</span> },
    {
      key: "customerName",
      label: "Mijoz / Hamkor",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.customerName}</span>
          <span className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider">{row.customerType === "user" ? "Mijoz" : "Hamkor"}</span>
        </div>
      ),
    },
    { key: "status", label: "Holat", render: (row) => <StatusBadge status={row.status} statusMap={STATUS_MAP} /> },
    {
      key: "priority",
      label: "Muhimlik",
      render: (row) => (
        <span className={`px-2 py-1 rounded text-[10px] uppercase tracking-wider ${PRIORITY_MAP[row.priority].color}`}>
          {PRIORITY_MAP[row.priority].label}
        </span>
      ),
    },
    { key: "createdAt", label: "Yuborilgan sana", render: (row) => <span className="text-sm">{formatDate(row.createdAt)}</span> },
    {
      key: "actions",
      label: "",
      render: () => (
        <div className="flex justify-end gap-2">
          <button className="w-8 h-8 rounded flex items-center justify-center text-[var(--primary)] hover:bg-[var(--primary)]/10">
            <Eye size={14} />
          </button>
          <button className="w-8 h-8 rounded flex items-center justify-center text-[var(--success)] hover:bg-[var(--success)]/10">
            <MessageCircle size={14} />
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <div className="flex justify-center p-12"><span className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-[1200px] mx-auto flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Yordam va Murojaatlar</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Foydalanuvchilar va hamkorlardan kelgan xabarlar (Tickets)</p>
      </div>
      <DataTable columns={columns} data={data} keyField="id" emptyMessage="Murojaatlar topilmadi" />
    </div>
  );
}
