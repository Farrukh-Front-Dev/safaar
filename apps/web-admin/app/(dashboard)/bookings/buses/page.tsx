"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/ui/DataTable";
import type { Column } from "@/components/ui/DataTable";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import StatusBadge from "@/components/ui/StatusBadge";
import Pagination from "@/components/ui/Pagination";
import { mockBusBookings } from "@/lib/mock-data";
import { formatDate, formatPrice } from "@/lib/utils";
import { BOOKING_STATUS_MAP, PAYMENT_METHOD_MAP } from "@/lib/constants";
import type { AdminBusBooking } from "@/types/admin";

const ITEMS_PER_PAGE = 12;

export default function BusBookingsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = mockBusBookings;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.id.toLowerCase().includes(q) ||
          b.customerName.toLowerCase().includes(q) ||
          b.customerPhone.includes(q) ||
          b.route.toLowerCase().includes(q)
      );
    }
    if (statusFilter) {
      result = result.filter((b) => String(b.status) === statusFilter);
    }
    return result;
  }, [search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const columns: Column<AdminBusBooking>[] = [
    {
      key: "id",
      label: "Bron ID",
      className: "w-24",
      render: (row) => <span className="font-mono text-xs text-[var(--accent-dark)] font-medium">{row.id}</span>,
    },
    {
      key: "customerName",
      label: "Mijoz",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-[var(--text-primary)]">{row.customerName}</span>
          <span className="text-xs text-[var(--text-muted)]">{row.customerPhone}</span>
        </div>
      ),
    },
    {
      key: "route",
      label: "Marshrut",
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{row.route}</span>
          <span className="text-xs text-[var(--text-muted)]">{row.companyName}</span>
        </div>
      ),
    },
    {
      key: "departureDate",
      label: "Jo'nash",
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-sm">{formatDate(row.departureDate)}</span>
          <span className="text-xs text-[var(--text-muted)]">{row.departureTime}</span>
        </div>
      ),
    },
    {
      key: "seatNumber",
      label: "O'rindiq",
      className: "text-center",
      render: (row) => (
        <span className="inline-flex items-center justify-center w-8 h-6 rounded-md bg-[var(--bg-tertiary)] text-xs font-semibold">
          {row.seatNumber}
        </span>
      ),
    },
    {
      key: "amount",
      label: "Summa",
      render: (row) => <span className="text-sm font-medium">{formatPrice(row.amount)}</span>,
    },
    {
      key: "paymentMethod",
      label: "To'lov",
      render: (row) => (
        <span className="text-xs font-medium px-2 py-1 rounded-md bg-[var(--bg-tertiary)]">
          {PAYMENT_METHOD_MAP[row.paymentMethod] ?? row.paymentMethod}
        </span>
      ),
    },
    {
      key: "status",
      label: "Holat",
      render: (row) => <StatusBadge status={String(row.status)} statusMap={BOOKING_STATUS_MAP} />,
    },
  ];

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
      {/* Header */}
      

      {/* Filters */}
      <div className="flex items-end gap-4 flex-wrap">
        <div className="w-80">
          <Input
            isSearch
            placeholder="Bron ID, mijoz ismi, telefon yoki marshrut..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="w-44">
          <Select
            placeholder="Barcha holatlar"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            options={[
              { value: "PENDING", label: "Kutilmoqda" },
              { value: "CONFIRMED", label: "Tasdiqlangan" },
              { value: "CANCELLED", label: "Bekor qilingan" },
              { value: "COMPLETED", label: "Yakunlangan" },
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={paginated}
        keyField="id"
        onRowClick={(row) => router.push(`/bookings/${row.id}`)}
        emptyMessage="Bron topilmadi"
      />

      {/* Pagination */}
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
