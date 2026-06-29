"use client";

import { MessageSquare, Send, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "../../_components/ui/button";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
} from "../../_components/ui/card";
import { EmptyState } from "../../_components/ui/empty-state";
import { StarRating } from "../../_components/ui/star-rating";
import { PageHeader } from "../../_components/layout/page-header";
import { useReviews } from "../../_hooks/use-reviews";
import { useDataStore } from "../../_stores/data-store";
import { cn } from "../../_lib/utils/cn";
import { formatDate } from "../../_lib/utils/format";

export function ReviewsView() {
  const { data } = useReviews();
  const replyToReview = useDataStore((s) => s.replyToReview);
  const [filter, setFilter] = useState<"all" | "unanswered" | "low">("all");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const stats = useMemo(() => {
    const list = data;
    const avg =
      list.length === 0
        ? 0
        : list.reduce((s, r) => s + r.rating, 0) / list.length;
    const hist = [0, 0, 0, 0, 0];
    for (const r of list) hist[r.rating - 1]++;
    const unanswered = list.filter((r) => !r.reply).length;
    return { avg, hist, total: list.length, unanswered };
  }, [data]);

  const filtered = useMemo(() => {
    if (filter === "unanswered") return data.filter((r) => !r.reply);
    if (filter === "low") return data.filter((r) => r.rating <= 2);
    return data;
  }, [data, filter]);

  const handleSubmitReply = (reviewId: string) => {
    const text = replyText.trim();
    if (text.length < 3) {
      toast.error("Javob kamida 3 belgi bo'lishi kerak");
      return;
    }
    replyToReview(reviewId, text);
    toast.success("Javobingiz saqlandi");
    setReplyingTo(null);
    setReplyText("");
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Mijoz"
        title="Sharhlar"
        description="Mijozlar fikrlari va reytinglar."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardBody className="flex flex-col items-center gap-2 py-8">
            <p className="text-5xl font-bold tracking-tight">
              {stats.avg.toFixed(1)}
            </p>
            <StarRating value={stats.avg} size={20} />
            <p className="text-sm text-[var(--muted-foreground)]">
              {stats.total} ta sharh asosida
            </p>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Reyting taqsimoti</CardTitle>
          </CardHeader>
          <CardBody className="flex flex-col gap-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.hist[star - 1] ?? 0;
              const pct = stats.total ? (count / stats.total) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-6 font-medium">{star}★</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-full bg-amber-400 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-[var(--muted-foreground)]">
                    {count}
                  </span>
                </div>
              );
            })}
          </CardBody>
        </Card>
      </div>

      <div
        role="tablist"
        className="flex flex-wrap gap-1 rounded-card border border-[var(--border)] bg-[var(--surface)] p-1"
      >
        {[
          { key: "all" as const, label: "Hammasi" },
          {
            key: "unanswered" as const,
            label: "Javobsiz",
            count: stats.unanswered,
          },
          { key: "low" as const, label: "1–2 yulduz" },
        ].map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f.key)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-700 text-white shadow-sm"
                  : "text-zinc-600 hover:bg-[var(--surface-muted)] dark:text-zinc-300",
              )}
            >
              {f.label}
              {"count" in f && f.count !== undefined && f.count > 0 && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                    active
                      ? "bg-white/20 text-white"
                      : "bg-amber-100 text-amber-800",
                  )}
                >
                  {f.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="h-10 w-10" aria-hidden />}
          title="Sharh topilmadi"
          description="Ushbu filterda sharh yo'q."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((r) => (
            <Card key={r.id}>
              <CardBody className="flex flex-col gap-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <p className="font-medium">{r.guestName}</p>
                    <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                      <StarRating value={r.rating} size={14} />
                      <span>·</span>
                      <span>{formatDate(r.createdAt)}</span>
                    </div>
                  </div>
                </div>
                {r.title && <p className="font-semibold">{r.title}</p>}
                <p className="text-sm text-[var(--muted-foreground)]">
                  {r.text}
                </p>
                {r.reply ? (
                  <div className="ml-4 rounded-lg border-l-2 border-brand-500 bg-brand-50/50 px-3 py-2 dark:bg-brand-900/20">
                    <p className="text-xs font-semibold text-brand-800 dark:text-brand-200">
                      Sizning javobingiz
                    </p>
                    <p className="mt-1 text-sm">{r.reply}</p>
                  </div>
                ) : replyingTo === r.id ? (
                  <div className="flex flex-col gap-2 rounded-lg bg-[var(--surface-muted)] p-3">
                    <textarea
                      autoFocus
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      maxLength={250}
                      rows={3}
                      placeholder="Mijoz uchun javobingizni yozing..."
                      className="w-full resize-none rounded-md border border-[var(--border)] bg-[var(--surface)] p-2 text-sm focus:border-brand-600 focus:outline-none"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {replyText.length}/250
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText("");
                          }}
                        >
                          <X className="h-3.5 w-3.5" aria-hidden />
                          Bekor qilish
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSubmitReply(r.id)}
                        >
                          <Send className="h-3.5 w-3.5" aria-hidden />
                          Yuborish
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="self-start"
                    onClick={() => {
                      setReplyingTo(r.id);
                      setReplyText("");
                    }}
                  >
                    <Send className="h-3.5 w-3.5" aria-hidden />
                    Javob yozish
                  </Button>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
