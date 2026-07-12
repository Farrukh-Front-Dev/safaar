"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/cn";

interface Props {
  href?: string;
  className?: string;
}

export function BackButton({ href, className }: Props) {
  const router = useRouter();

  function handleClick() {
    if (href) {
      router.push(href);
    } else if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Orqaga"
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-btn transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:shadow-btn-hover active:scale-[0.97] active:shadow-btn-active",
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
    </button>
  );
}
