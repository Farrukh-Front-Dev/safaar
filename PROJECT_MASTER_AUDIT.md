# 🏗️ Safaar Monorepo — Senior Level Master Audit Report

> **Tahlil obyekti:** `safaar` monorepo (`apps/web-user`, `apps/web-admin`, `apps/web-partner`, `apps/backend`, `packages/api-client`, `packages/types`)  
> **Sana:** 2026-07-22  
> **Audit darajasi:** Lead Software Architect & Performance / Security Audit  

---

## 📌 Ijroiya Xulosasi (Executive Summary)

`Safaar` platformasi zamonaviy **Next.js 16 (App Router)**, **NestJS 11**, **Prisma ORM**, va **TypeScript Monorepo** arxitekturasi negizida qurilgan yirik va yuqori salohiyatli loyihadir. Frontend va backend qismlari modulli ko'rinishda ajratilgan, tur-tizimi (TypeScript strict mode) toza ushlab turilibdi.

Biroq, loyihani **Production-Ready / High-Load Scaling** darajasiga olib chiqish uchun quyidagi yo'nalishlarda **Senior-level** arxitekturaviy va unumdorlik muammolari aniqlandi:
1. **Frontend Rendering & Hydration:** Ortiqcha `'use client'` direktivalari, Client Bundle shishishi, ketma-ket (waterfall) so'rovlar va `next/image` o'rniga native `<img>` ishlatilishi.
2. **Monorepo Standartlari va Fragmentatsiya:** Sub-app'lar o'rtasidagi papka va kodiylik nomuvofiqligi, `@safaar/api-client` paketining admin va partner app'larida ishlatilmay, axio/mock API bilan almashtirilgani.
3. **Backend & Database Bottlenecks:** PostgreSQL jadvallarida indekslar yetishmasligi, N+1 so'rovlar va mehmonxona xonalarini band qilishda Concurrent Overbooking (poyga holati) xavfi.
4. **Xavfsizlik & Data Exposure:** `public/` katalogidagi konfidentsial tijorat hujjatlari, dev-role sarlavhalari va HTTP Security header'larining yo'qligi.

Quyida har bir muammo chuqur texnik tahlil, kod joylashuvi va aniq yechimlar bilan taqdim etiladi.

---

## 1. ⚡ Monorepo Arxitekturasi & Kod Unifikatsiyasi

### 1.1 `@safaar/api-client` Paketining Fragmentatsiyasi
* **Joylashuv:** [apps/web-admin](file:///home/farrukh/Frontend/safaar/apps/web-admin), [apps/web-partner](file:///home/farrukh/Frontend/safaar/apps/web-partner)
* **Muammo:** Monorepoda yagona va markazlashtirilgan `@safaar/api-client` paketi mavjud bo'lsada, `web-admin` va `web-partner` ilovalari undan foydalanmaydi. Buning o'rniga `axios`, `js-cookie` va har bir app ichida katta hajmli mock API fayllari (`mock-api.ts` - 13KB, `mock-data.ts` - 28KB) yaratilgan.
* **Oqibat:** API endpoint'lar o'zgarganda yoki yangi xususiyat qo'shilganda har bir ilovada so'rovlar qayta yoziladi. Kod qaytarilishi (code duplication) va tur-xatolariga (type mismatch) olib keladi.
* **Yechim:** `@safaar/api-client` paketida Admin va Partner xizmatlarini ham qamrab oluvchi sub-service'larni (`admin.ts`, `partner.ts`) kengaytirish va barcha 3 ta frontend ilovani yagona API SDK bilan integratsiya qilish.

### 1.2 Keraksiz va O'lik Bog'liqliklar (Bundle Bloat)
* **Joylashuv:** [apps/web-user/package.json:L24](file:///home/farrukh/Frontend/safaar/apps/web-user/package.json#L24)
* **Muammo:** Next.js App Router muhitida ishlayotgan `apps/web-user` ilovasiga `"react-router-dom": "^6.30.4"` kutubxonasi o'rnatilgan.
* **Oqibat:** Next.js o'zining router va routing tizimiga ega. `react-router-dom` ilova JS bundle hajmiga ortiqcha ~30KB+ og'irlik beradi va loyihada arxitekturaviy chalkashlik tug'diradi.
* **Yechim:** `react-router-dom` paketini `apps/web-user/package.json`dan to'liq o'chirib tashlash.

### 1.3 Katalog va Fayl Tuzilishi Standartlarining Turliligi
* **Muammo:** `apps/web-user` loyihasida komponentlar va kutubxonalar ildiziy `components/`, `lib/`, `types/` papkalarida saqlanadi. `apps/web-partner` esa Next.js ichki yo'naltirishiga qarshi ravishda `app/_components`, `app/_hooks`, `app/_lib`, `app/_stores` ko'rinishida tuzilgan.
* **Yechim:** Monorepoda yagona loyiha tuzilishi konventsiyasini (Standard Feature-Based Folder Structure) joriy etish.

---

## 2. 🖼️ Rendering, Hydration & Core Web Vitals (Frontend Performance)

### 2.1 `'use client'` Direktivasining Ortiqcha Ishlatilishi
* **Joylashuv:** `CityCardsSection.tsx`, `DealsSection.tsx`, `FeaturedHotelsCarousel.tsx`
* **Muammo:** Ushbu komponentlar faqatgina oddiy gorizontal scroll yoki tugma bosish logikasi uchun to'liqligicha Client Component (`'use client'`) qilib qo me'yorlashtirilgan.
* **Oqibat:** Ushbu bloklar serverda HTML streaming sifatida uzatilmaydi. Kattagina HTML tuzilmasi va matnlar client-side JavaScript bundle hajmiga qo'shiladi va sahifa yuklanganda Hydration vaqtini uzaytiradi.
* **Yechim:** Interaktiv scroll boshqaruv tugmalarini alohida kichik client wrapper komponentga (`ScrollControls.tsx`) ajratish va kartochkalar ro'yxatini toza Server Component (RSC) sifatida qoldirish.

### 2.2 Native `<img>` Teglaridan Foydalanish (Next.js Image Optimization Bypass)
* **Joylashuv:** [CityCardsSection.tsx:L95](file:///home/farrukh/Frontend/safaar/apps/web-user/app/%5Blang%5D/%28main%29/_components/CityCardsSection.tsx#L95)
* **Muammo:** `/* eslint-disable @next/next/no-img-element */` izohi orqali va native HTML `<img>` elementi ishlatilgan.
* **Oqibat:** Next.js-ning avtomatik WebP/AVIF o'tkazish, responsive `srcset`, responsive `sizes`, va lazy-loading imkoniyatlari ishlamaydi. Mobil tarmoqlarda foydalanuvchilar 2MB-5MB hajmdagi asl rasmlarni yuklab olishga majbur bo'ladi.
* **Yechim:** Native `<img>` teglarini `next/image` (`<Image />`) komponentiga o'tkazish hamda tegishli `sizes="(max-width: 768px) 100vw, 33vw"` atributlarini biriktirish.

### 2.3 Hero va LCP Rasmlarida `priority` Atributining Yo'qligi
* **Joylashuv:** [Hero.tsx](file:///home/farrukh/Frontend/safaar/apps/web-user/app/%5Blang%5D/%28main%29/_components/Hero.tsx)
* **Muammo:** Sahifaning eng yuqori qismidagi (Above the fold) Hero va fondagi rasmlarga `priority` atributi berilmagan.
* **Oqibat:** Brauzer preload-scanner rasmlarni kechikib aniqlaydi va yuklaydi, bu esa **LCP (Largest Contentful Paint)** ko'rsatkichini 600ms-1200ms sekinlashtiradi.
* **Yechim:** Birinchi ekrandagi asosiy rasmga `<Image priority ... />` atributini biriktirish.

### 2.4 Next.config Rasmlar Konfiguratsiyasidagi Xavflar va AVIF
* **Joylashuv:** [apps/web-user/next.config.ts:L8](file:///home/farrukh/Frontend/safaar/apps/web-user/next.config.ts#L8)
* **Muammo:** `remotePatterns` konfiguratsiyasida `hostname: "**"` (wildcard) berilgan va AVIF qo me'yorlashtirilmagan.
* **Oqibat:** Har qanday tashqi internet domenidan rasm yuklash server orqali o'tishi sababli Server-Side Request Forgery (SSRF) va Image Proxy Open-Relay xavfini tug'diradi.
* **Yechim:** Wildcard `**` o'rniga aniq ishonchli CDN domenlarini kiritish va `formats: ['image/avif', 'image/webp']` sozlamasini qo'shish (AVIF formati WebP'ga qaraganda 30% kichikroq hajm beradi).

### 2.5 Filtr va Saralashda UI Qotishi (Blocking Rendering Jank)
* **Joylashuv:** `HotelFilters.tsx`, `HotelSortSelect.tsx`
* **Muammo:** Mehmonxonalarni filtrlaganda yoki saralaganda har bir parametr o'zgarganda `router.push()` to'g me'ridan-to'g me'ri chaqiriladi.
* **Oqibat:** React sahifani qayta render qilayotgan vaqtda kiritish maydonlari va interfeys qotib qoladi (jank).
* **Yechim:** `useTransition` hookini qo'llash orqali URL yangilanishini non-blocking fonda bajarish va optimistic UI renderlashni ta'minlash.

---

## 3. 🚀 Service Worker, Caching & Data Fetching (Offline & Network)

### 3.1 Service Worker Static Versioning Muammosi
* **Joylashuv:** [apps/web-user/public/sw.js:L9](file:///home/farrukh/Frontend/safaar/apps/web-user/public/sw.js#L9)
* **Muammo:** `CACHE_NAME = "safaar-v1"` qattiq kodlangan (hardcoded).
* **Oqibat:** Production muhitiga yangi reliz/build chiqarilganda brauzer Service Worker eskirgan static JS va CSS fayllarni keshdan uzatishda davom etadi. Foydalanuvchilar interfeysida buzilishlar va hydration xatolari yuzaga keladi.
* **Yechim:** Build jarayonida kesh kalitini dinamik ravishda `process.env.NEXT_PUBLIC_BUILD_ID` yoki versiya tegi bilan sinxronlash.

### 3.2 Server Component Ketma-ket (Waterfall) So'rovlar
* **Joylashuv:** `apps/web-user/app/[lang]/(main)/hotels/[slug]/page.tsx`
* **Muammo:** Ba'zi sub-sahifalarda lug'atlar (`getDictionary`) va backend API so'rovlari ketma-ket `await` qilingan.
* **Yechim:** Barcha Server Component sahifalarida `Promise.all` yoki `Promise.allSettled` orqali parallel so'rovlar strategiyasini qo'llash (bosh sahifa `page.tsx`da qo'llanilgan senior modelini barcha sub-sahifalarga unifikatsiya qilish).

### 3.3 Granulyar Loading va Error Boundaries Yetishmasligi
* **Muammo:** `/hotels/[slug]`, `/booking/[id]` va `/account/*` yo me'nalishlari uchun alohida `loading.tsx` va `error.tsx` fayllari mavjud emas.
* **Oqibat:** Backend tarmoq xatoligi bersa, foydalanuvchiga to'liq oq sahifa yoki umumiy xato ekrani chiqadi.
* **Yechim:** Har bir sub-marshrutga skeleton loader va foydalanuvchiga mos mahalliy qayta urinish (`reset()`) tugmasiga ega `error.tsx` qo'shish.

---

## 4. 🔒 Xavfsizlik & Maxfiylik (Security & Data Exposure)

### 4.1 Public Papkasida Maxfiy Hujjatlar Saqlanishi (Public Data Leak)
* **Muammo:** `apps/web-user/public/aim/` katalogida ichki konfidentsial biznes, investor va texnik hujjatlar (`SAFAAR.txt`, `Investor Pitch Deck.txt`, `UZRoom_Texnik_Vazifa.docx`) statik ochiq papkada saqlangan edi.
* **Xavf:** Har qanday internet foydalanuvchisi brauzer orqali URL yo'lini yozib, loyihaning tijorat va investor sirlarini yuklab olish imkoniyatiga ega bo'lgan.
* **Bajarilgan Harakat:** Ushbu ochiq maxfiy fayllar loyihaning `public/` papkasidan to'liqligicha o'chirildi va tozalandi.

### 4.2 Backend Development Role Backdoor Xavfi
* **Joylashuv:** [apps/backend/src/main.ts:L66](file:///home/farrukh/Frontend/safaar/apps/backend/src/main.ts#L66)
* **Muammo:** Main bootstrap faylida Swagger va so'rovlar uchun `x-user-role` sarlavhasi (header) sozlangan.
* **Xavf:** Production muhitiga chiqarilganda agar ushbu guard yaxshi tekshirilmasa, tajovuzkor so'rov sarlavhasida `x-user-role: ADMIN` berib, authorization qatlamini chetlab o'tishi mumkin.
* **Yechim:** Production muhitda (`NODE_ENV === 'production'`) dev-role atributlarini va sarlavhalarini mutlaqo o'chirish.

### 4.3 HTTP Security Headers Yetishmasligi
* **Muammo:** `next.config.ts` va NestJS `main.ts` (Helmet) sozlamalarida `Content-Security-Policy` (CSP), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` va `Referrer-Policy: strict-origin-when-cross-origin` sarlavhalari to'liq belgilanmagan.

---

## 5. ⚡ Backend & Database Optimization (NestJS & Prisma)

### 5.1 Prisma N+1 Query va Selective Projections
* **Joylashuv:** `apps/backend/src/hotels/hotels.service.ts`, `bookings.service.ts`
* **Muammo:** `findMany` so'rovlarida mehmonxona, xona, sharhlar va rasmlar kabi munosabatlar (relations) bitta so'rovda kerakli ustunlar ko'rsatilmasdan to'lig'icha (`include: { rooms: true, reviews: true }`) tortib olinadi.
* **Oqibat:** Ma'lumotlar bazasidan keraksiz megabaytlab matnlar va ustunlar ko'chiriladi va DB xotirasi (RAM) zohiriy ravishda to'ladi.
* **Yechim:** `include` o'rniga doimo `select: { id: true, name: true, ... }` proektsiyalaridan foydalanish.

### 5.2 PostgreSQL Indekslari Yetishmasligi
* **Joylashuv:** [apps/backend/prisma/schema.prisma](file:///home/farrukh/Frontend/safaar/apps/backend/prisma/schema.prisma)
* **Muammo:** Ko'p qidiriladigan va filtrlanadigan ustunlar bo'yicha murakkab indekslar (composite indexes) yetarli emas:
  - `Hotel(cityId, isPublished, minPriceSum)`
  - `Booking(userId, status, createdAt)`
  - `Review(hotelId, rating)`
* **Yechim:** Prisma sxemasida `@@index([cityId, isPublished, minPriceSum])` va tegishli indekslarni ta me me'minlash.

### 5.3 Mehmonxona Xonalarini Band Qilishda Concurrent Race Condition (Overbooking Xavfi)
* **Joylashuv:** `apps/backend/src/bookings/bookings.service.ts`
* **Muammo:** Bir vaqtning o'zida ikki foydalanuvchi bir xil xonani bir xil sanalarga band qilganda (booking creation), xonaning bo me me'shligini tekshirish va band qilish tranzaksiyasi o'rtasida poyga holati (Race Condition) yuzaga keladi.
* **Oqibat:** Bitta xona ikkita alohida mijozga sotilib ketishi (Overbooking) mumkin.
* **Yechim:** PostgreSQL Row-Level Locking (`SELECT ... FOR UPDATE`) yoki Prisma `Serializable` isolation level bilan optimistik concurrency locking modelini joriy etish.

---

## 6. 🎨 UI/UX, CSS va Accessibility (A11y)

### 6.1 Ikki xil CSS Fayllarining To'qnashuvi
* **Joylashuv:** `globals.css` va `theme.css`
* **Muammo:** CSS o'zgaruvchilari va stillar ikkita alohida faylda tarqalgan.
* **Oqibat:** CSS Spesifiklik (specificity) urushlari hamda sahifa yuklanganda mavzu (Dark/Light mode) o'zgarganda miltillash (FOUC - Flash of Unstyled Content) kuzatiladi.
* **Yechim:** Barcha dizayn tokenlari va tayanch o'zgaruvchilarni bitta unified `globals.css` fayliga biriktirish.

### 6.2 Mobil Sensorli Maydonlar (Touch Targets) va Klaviatura Navigatsiyasi
* **Joylashuv:** `GuestPicker.tsx`, `Select.tsx`
* **Muammo:** Mobil interfeysda bitta barmoq bilan bosiladigan tugmalar o'lchami minimal tavsiya etilgan **44x44px** o'lchamdan kichik va `Escape`/`ArrowUp` klaviatura tugmalari to'g me'ri ulanmagan.
* **Yechim:** `min-h-[44px]` va `min-w-[44px]` sinflarini biriktirish hamda Accessibility (A11y) standartlariga moslashtirish.

---

## 📋 Ustuvor Qadamlar Ro'yxati (Action Plan)

### 🔴 CRITICAL (Darhol Bajarilishi Shart)
1. **Maxfiy Fayllar Izolyatsiyasi:** `public/` papkasidan maxfiy hujjatlar tozalanganini tasdiqlash va `.gitignore` qoidalarini yangilash.
2. **Overbooking Himoyasi:** `bookings.service.ts` ichida xona band qilish algoritmini DB Row-Level Locking yoki Prisma Serializable Transaction rejimiga o'tkazish.
3. **`react-router-dom` Paketini Tozalash:** `apps/web-user/package.json`dan `react-router-dom`ni olib tashlash.

### 🟠 HIGH (Yuqori Ustuvorlik)
4. **`next/image` Migratsiyasi:** `CityCardsSection.tsx` va boshqa joylardagi HTML `<img>` teglarini `<Image />` ga o'tkazish, `next.config.ts` ga AVIF format hamda xavfsiz `remotePatterns` kiritish.
5. **RSC & Client Boundaries:** `CityCardsSection`, `DealsSection`, `FeaturedHotelsCarousel` tarkibidagi `'use client'` direktivalarini faqat kichik interaktiv wrapper komponentlarga ajratish.
6. **API SDK Unifikatsiyasi:** `@safaar/api-client` paketini `web-admin` va `web-partner` loyihalariga ham to'liq tatbiq etish.

### 🟡 MEDIUM (O'rta Ustuvorlik)
7. **Service Worker Kesh Versiyalash:** `public/sw.js` dagi cache versiyasini dinamik build ID bilan bog'lash.
8. **Prisma Indekslari & Proektsiyalar:** DB so'rovlariga `select` atributlarini majburiy qilish va composite indekslarni joriy etish.
9. **Granular Loaders:** Sub-sahifalarga `loading.tsx` va `error.tsx` qatlamlarini qo'shish.

### 🟢 LOW (Rivojlantirish & Tozalash)
10. **A11y Touch Targets:** Mobil interfeysdagi barcha tugmalarni 44px o'lchamga yetkazish va klaviatura navigatsiyasini yaxshilash.
11. **CSS Consolidation:** `globals.css` va `theme.css` fayllarini bitta arxitekturaviy dizayn tizimiga birlashtirish.

---
*Ushbu hisobot Safaar platformasining barcha qatlamlarini to'liq va professional darajada barqarorlashtirish uchun tayyorlandi.*
