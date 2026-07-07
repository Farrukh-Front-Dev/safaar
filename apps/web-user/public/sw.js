/* Safaar service worker — KONSERVATIV, offline-friendly.
 * Maqsad: online ishni BUZMASLIK. Faqat sahifa navigatsiyasi (navigate)
 * tarmoqsiz qolganda offline fallback ko'rsatamiz. Qolgan hamma narsa
 * (API, _next/data, RSC, POST va h.k.) tarmoqqa to'g'ridan-to'g'ri o'tadi.
 *
 * Bu oddiy JS (TS emas) — to'g'ridan-to'g'ri brauzerda ishlaydi.
 */

const CACHE_NAME = "safaar-v1";

// Tilga mos offline sahifalar oldindan keshlanadi.
const OFFLINE_URLS = ["/uz/offline", "/ru/offline", "/en/offline"];
const DEFAULT_OFFLINE = "/uz/offline";

// Static asset'lar uchun cache-first (RSC/_next/data EMAS).
const STATIC_ASSET_RE = /\.(?:css|js|woff2?|png|jpe?g|svg|webp|ico|webmanifest)$/i;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(OFFLINE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Mos offline sahifani tanlash (URL path birinchi segmenti bo'yicha).
function offlineFallbackFor(url) {
  try {
    const segment = new URL(url).pathname.split("/").filter(Boolean)[0];
    const candidate = "/" + segment + "/offline";
    if (OFFLINE_URLS.includes(candidate)) return candidate;
  } catch {
    /* noop */
  }
  return DEFAULT_OFFLINE;
}

self.addEventListener("fetch", (event) => {
  const request = event.request;

  // GET bo'lmagan so'rovlarga aralashmaymiz.
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Faqat shu origin. API va _next/data ga ARALASHMAYMIZ.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/_next/data"))
    return;
  // RSC so'rovlari (?_rsc=...) — keshlamaymiz.
  if (url.searchParams.has("_rsc")) return;

  // 1) Sahifa navigatsiyasi: network-first, offline'da fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches
          .match(offlineFallbackFor(request.url))
          .then((cached) => cached || caches.match(DEFAULT_OFFLINE)),
      ),
    );
    return;
  }

  // 2) Static asset'lar: cache-first (faqat _next/static yoki asset kengaytmasi).
  const isStatic =
    url.pathname.startsWith("/_next/static") ||
    STATIC_ASSET_RE.test(url.pathname);

  if (isStatic) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          // Faqat to'liq, muvaffaqiyatli javoblarni keshlaymiz.
          if (response && response.status === 200 && response.type === "basic") {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        });
      }),
    );
    return;
  }

  // 3) Qolganlari: default (return) — brauzer o'zi tarmoqdan oladi.
});
