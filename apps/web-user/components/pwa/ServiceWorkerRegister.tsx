"use client";

import { useEffect } from "react";

/**
 * Service worker'ni faqat production'da ro'yxatdan o'tkazadi (dev'da emas —
 * Turbopack HMR bilan to'qnashmasligi uchun). UI render qilmaydi.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return null;
}
