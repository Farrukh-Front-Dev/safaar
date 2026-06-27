"use client";

import { Crown, Phone, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "../../_components/ui/badge";
import { EmptyState } from "../../_components/ui/empty-state";
import { Input } from "../../_components/ui/input";
import { Skeleton } from "../../_components/ui/skeleton";
import { PageHeader } from "../../_components/layout/page-header";
import { useGuests } from "../../_hooks/use-guests";
import { formatDate, formatMoney, formatPhone } from "../../_lib/utils/format";

export function GuestsView() {
  const { data, isLoading } = useGuests();
  const [query, setQuery] = useState("");
  const [vipOnly, setVipOnly] = useState(false);

  const filtered = useMemo(() => {
    let list = data ?? [];
    if (vipOnly) list = list.filter((g) => g.isVip);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((g) =>
        [g.fullName, g.phone, g.email ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }
    return list;
  }, [data, query, vipOnly]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Mijoz"
        title="Mijozlar"
        description="Mehmonlar profili, tashriflar tarixi va VIP belgilash."
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Ism yoki telefon..."
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Mijozlar ichidan qidirish"
          />
        </div>
        <label className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm cursor-pointer hover:bg-[var(--surface-muted)]">
          <input
            type="checkbox"
            checked={vipOnly}
            onChange={(e) => setVipOnly(e.target.checked)}
            className="h-4 w-4 accent-brand-700"
          />
          <Crown className="h-4 w-4 text-amber-500" aria-hidden />
          Faqat VIP
        </label>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="h-10 w-10" aria-hidden />}
          title="Mijoz topilmadi"
          description="Filterni o'zgartirib ko'ring."
        />
      ) : (
        <div className="overflow-x-auto rounded-card border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)]/50 text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              <tr>
                <th className="px-4 py-3">Mijoz</th>
                <th className="px-4 py-3">Aloqa</th>
                <th className="px-4 py-3">Tashriflar</th>
                <th className="px-4 py-3">Sarflagan</th>
                <th className="px-4 py-3">Oxirgi tashrif</th>
                <th className="px-4 py-3">Belgilar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((g) => (
                <tr
                  key={g.id}
                  className="border-b border-[var(--border)] transition-colors last:border-0 hover:bg-[var(--surface-muted)]"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                        {g.fullName
                          .split(" ")
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join("")}
                      </span>
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1 font-medium">
                          {g.fullName}
                          {g.isVip && (
                            <Crown
                              className="h-3.5 w-3.5 text-amber-500"
                              aria-label="VIP"
                            />
                          )}
                        </span>
                        {g.email && (
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {g.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`tel:+${g.phone}`}
                      className="inline-flex items-center gap-1 text-brand-700 hover:underline dark:text-brand-300"
                    >
                      <Phone className="h-3 w-3" aria-hidden />
                      {formatPhone(g.phone)}
                    </a>
                  </td>
                  <td className="px-4 py-3 font-medium">{g.totalStays}</td>
                  <td className="px-4 py-3 font-medium">
                    {formatMoney(g.totalSpent)}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">
                    {g.lastStay ? formatDate(g.lastStay) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {g.tags.map((t) => (
                        <Badge key={t} tone="brand">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
