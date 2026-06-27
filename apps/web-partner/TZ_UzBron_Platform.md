# TEXNIK TOPSHIRIQ (TZ)
## UzBron — Mehmonxona Staff Paneli (`web-partner`)
### `partner.uzbron.uz`

> Bu hujjat **faqat** `apps/web-partner/` papkasidagi frontend ilova uchun.
> Umumiy platforma TZ'si: repo root'idagi `TZ_UzBron_Platform.md`.
> Backend (`apps/backend/`) va `packages/types/` — **faqat o'qish uchun**.

---

## 1. APP NIMA UCHUN

`partner.uzbron.uz` — **bitta mehmonxonaning staff'i** (egasi, menejer,
administrator/resepsiyon, housekeeping) **kundalik ishi uchun PMS paneli**.
Bu **marketplace admin emas**. Bir kishi bir mehmonxonani boshqaradi.

**Tom o'xshashlar:** Opera PMS, Cloudbeds, Mews, Hotelogix.

**Asosiy foydalanuvchi senariylari:**

1. **Resepsiyon (front desk)** — bugun keladigan mehmonlarni check-in
   qilish, ketadiganlarni check-out qilish, telefon orqali walk-in bron
   qabul qilish.
2. **Reservation manager** — UzBron'dan kelgan bronlarni tasdiqlash yoki
   rad etish, mijoz bilan bog'lanish, bekor qilish.
3. **Housekeeping (uy bekasi xodimi)** — xonalar holatini yangilash
   (toza/iflos/band/ta'mirda).
4. **Menejer/egasi** — bugungi to'liqlik (occupancy), oylik daromad,
   xodimlar boshqaruvi, sharhlarga javob.

| | |
|---|---|
| **App nomi** | `@agoda/web-partner` |
| **Domen** | `partner.uzbron.uz` (dev: `localhost:3001`) |
| **Auditoriya** | **Bir mehmonxona staff** (rol: `PARTNER`) |
| **Til** | O'zbek (asosiy), Rus, Ingliz |
| **Valyuta** | UZS (so'm) |
| **Qurilma** | Desktop asosiy, tablet (resepsiyon stoli uchun), mobile (housekeeping) |

---

## 2. TEXNIK STACK

| Qism | Texnologiya | Versiya |
|---|---|---|
| Framework | Next.js 16 (App Router, Turbopack) | 16.2.9 |
| UI | React 19, Tailwind CSS v4 | latest |
| Tillar | TypeScript (strict) | ^5 |
| Forma | React Hook Form + Zod | latest |
| Server-state | TanStack Query v5 | latest |
| Client-state | Zustand | latest |
| Toast | Sonner | latest |
| Ikona | lucide-react | latest |
| Tema | next-themes (light/dark/system) | latest |
| Sana | Intl API + date-fns | latest |
| Turlar | `@agoda/types` (workspace) | * |

---

## 3. ROUTING (mehmonxona staff oqimi)

```
app/
├── (auth)/
│   └── login/                # Faqat kirish (registratsiya yo'q — admin kirish beradi)
├── (dashboard)/
│   ├── page.tsx              # /  → Front Desk (bugungi kelishlar/ketishlar)
│   ├── reservations/         # Bronlar (calendarsiz ro'yxat)
│   │   ├── page.tsx
│   │   └── [id]/page.tsx     # Bron tafsiloti + check-in/out
│   ├── calendar/             # Mavjudlik kalendari (xonalar × kunlar)
│   │   └── page.tsx
│   ├── rooms/                # Xonalar holati (housekeeping board)
│   │   ├── page.tsx
│   │   └── [id]/page.tsx     # Bitta xona tafsiloti
│   ├── guests/               # Mijozlar
│   │   ├── page.tsx
│   │   └── [id]/page.tsx     # Mijoz profili + bronlar tarixi
│   ├── reviews/              # Sharhlar va javob
│   │   └── page.tsx
│   ├── reports/              # Hisobotlar (occupancy, daromad)
│   │   └── page.tsx
│   └── settings/
│       ├── hotel/page.tsx    # Mehmonxona profili
│       ├── rooms/page.tsx    # Xona turlari (Standart, Lyuks...) va narxlari
│       ├── staff/page.tsx    # Xodimlar (administrator, housekeeping)
│       ├── bank/page.tsx     # Bank rekvizitlari
│       └── notifications/page.tsx
└── not-found.tsx
```

---

## 4. SAHIFALAR — TAFSILOT

### 4.1 `/login` — Tizimga kirish
- Telefon + 6 xonali SMS OTP
- **Registratsiya yo'q**: hamkor mehmonxonani UzBron admini ro'yxatga oladi
  va staff'ga login uchun raqamni beradi
- Demo rejim: istalgan raqam + istalgan 6 raqamli kod ishlaydi

---

### 4.2 `/` — Front Desk (Bosh panel)

Bu staff har kuni avval ko'radigan sahifa.

**KPI lentasi (4 ta katta kartochka):**
- Bugungi to'liqlik — `48 / 60 xona (80%)` + trend
- Bugun keladi (arrivals) — `12 mehmon`
- Bugun ketadi (departures) — `8 mehmon`
- Yangi bronlar (tasdiq kutilmoqda) — `3` qizil badge bilan

**Asosiy bloklar:**
- **Bugungi kelishlar** ro'yxati — mehmon ismi, xona, kelish vaqti, status badge
  (kutilmoqda / kelgan / kech keldi), "Check-in" tugmasi har bir qatorga
- **Bugungi ketishlar** ro'yxati — mehmon, xona, ketish vaqti,
  "Check-out" tugmasi, hisob (qoldiq summa) ko'rsatkichi
- **Hozir mehmonxonada (in-house)** — band xonalar va mehmonlar
- **Tezkor harakatlar paneli**: "Yangi bron (walk-in)", "Mavjudlikni ko'rish",
  "Xonalar holati"

---

### 4.3 `/reservations` — Bronlar ro'yxati

**Jadval ustunlari:** ID, mijoz, telefon, xona turi, check-in/out, kechalar
soni, summa, manba (UzBron/Walk-in/Telefon), status, harakatlar.

**Statuslar (UI):**
- `PENDING` — kutilmoqda (sariq) → "Tasdiqlash" / "Rad etish"
- `CONFIRMED` — tasdiqlangan (ko'k)
- `IN_HOUSE` — mehmonxonada (yashil) → "Check-out"
- `COMPLETED` — yakunlangan (kulrang)
- `CANCELLED` — bekor (qizil)

> **Eslatma:** `IN_HOUSE` UI status — backend `Booking` turi shu paytda
> `CONFIRMED` + check-in qilingan vaqtni belgilab beradi. Tip kontrakti
> `@agoda/types`'da `BookingStatus.PENDING/CONFIRMED/CANCELLED/COMPLETED`'dan
> tashqari yangi status kerakmi — backend dev'dan so'raladi.

**Filterlar:** status, sana oralig'i, xona turi, manba, qidiruv (ID/telefon/ism).

**Tezkor harakatlar (jadval ichida):** check-in, check-out, mijozga qo'ng'iroq,
bron tafsiloti.

**Eksport:** CSV / PDF (filter natijasi bo'yicha).

#### `/reservations/[id]` — Bron tafsiloti
- **Mehmon paneli:** ism, telefon (klik → `tel:`), email, hujjat (passport
  raqami, ko'chiruv), tug'ilgan sanasi, fuqaroligi
- **Bron tafsilotlari:** kelish/ketish, kechalar, kattalar/bolalar soni,
  xona turi, xona raqami (tayinlangan), maxsus iltimoslar
- **Moliya:** xona narxi × kechalar + qo'shimcha xizmatlar + soliq = jami
- **To'lov holati:** to'langan / qisman / to'lanmagan, to'lov usuli
- **Timeline:** yaratildi → tasdiqlandi → check-in → check-out
- **Harakatlar:** Check-in, Check-out, Bekor qilish, Mehmon o'zgartirish, Print
- **Ichki eslatma** (faqat staff ko'radi)

---

### 4.4 `/calendar` — Mavjudlik kalendari

**Vizual:** xonalar × kunlar grid (tom-chart yoki Gantt-like).
- Y-o'q: har bir xona raqami (101, 102, 201...)
- X-o'q: kelgusi 14–30 kun
- Katakcha rangi: bo'sh / band (bron rangi: ko'k=confirmed, sariq=pending) /
  ta'mir / bloklangan
- Klik: yangi bron yaratish (tanlangan kun + xona)
- Drag (bron'ni cho'zish): bron muddatini o'zgartirish (v2)

**Yuqori panel:** oy/2 hafta tab, oldinga/orqaga navigatsiya, "Bugun" tugmasi,
xona turi bo'yicha filter, blokirovka rejimini yoqish (admin uchun)

---

### 4.5 `/rooms` — Xonalar holati (Housekeeping board)

**Grid ko'rinish:** har bir xona katakchasi, qavatlar bo'yicha guruhlangan.

**Holat ranglari va belgilari:**
- 🟢 Toza & bo'sh (`VACANT_CLEAN`) — kelish uchun tayyor
- 🟡 Iflos & bo'sh (`VACANT_DIRTY`) — tozalash kerak
- 🔵 Band (`OCCUPIED`) — ichida mehmon bor
- 🔴 Ta'mirda (`OUT_OF_SERVICE`)
- ⚫ Bloklangan (`BLOCKED`) — admin bo'sh deb belgilamagan

Har bir katakchada: xona raqami, turi, hozirgi mehmon (band bo'lsa), check-out
sanasi. Klik → status'ni o'zgartirish (housekeeping ish oqimi):
`VACANT_DIRTY` → tozalandi → `VACANT_CLEAN`.

**Filterlar:** qavat, holat, xona turi.

**Statistika lentasi:** har bir holat bo'yicha umumiy son.

> **Eslatma:** Xona holati va housekeeping endpoint'lari hozir backend'da
> yo'q (`HotelsController` faqat `GET` qiladi). Backend dev'dan so'raladi:
> `GET/PATCH /api/partners/rooms`, `PATCH /api/partners/rooms/:id/status`.

---

### 4.6 `/guests` — Mijozlar

- Jadval: ism, telefon, jami bronlar soni, oxirgi tashrif, VIP belgisi
- Filter: faqat VIP, takroriy mijozlar (≥2 bron), yangi (1 bron)
- Klik → mijoz profili

#### `/guests/[id]`
- Aloqa ma'lumotlari
- Bronlar tarixi (sana, xona, summa, status)
- Eslatma: "VIP", "Maktabchi bayramlar uchun keladi", "Allergiyalari bor"
- Jami sarf qilgan summa

---

### 4.7 `/reviews` — Sharhlar

- Sharhlar feed: yulduzlar (1–5), sarlavha, matn, mijoz ismi, sana, manba
- Filter: javob holati (yangi / javoblangan), reyting
- Javob yozish (250 belgi), to'g'ridan-to'g'ri inline
- Reyting taqsimoti (gistogramma) va o'rtacha
- Diqqat: 1–2 yulduzli sharhlar uchun alohida banner

---

### 4.8 `/reports` — Hisobotlar

**KPI'lar (top bar):**
- Occupancy rate (to'liqlik) — kunlik/haftalik/oylik
- ADR (Average Daily Rate) — bir kechalik o'rtacha narx
- RevPAR (Revenue per Available Room)
- Jami daromad (filter davri uchun)

**Grafiklar:**
- Daromad dinamikasi (line chart)
- To'liqlik dinamikasi
- Bron manbasi taqsimoti (pie: UzBron / Walk-in / Telefon / Booking.com)

**Eksport:** PDF (oylik hisobot), Excel (xom ma'lumot)

> Hisobot endpoint'lari hozir backend'da yo'q. Backend dev'dan so'raladi.

---

### 4.9 Sozlamalar — `/settings/*`

#### `/settings/hotel`
- Mehmonxona nomi, INN, manzil, telefon, email, tavsif
- Joylashuv (xarita pini, kelajakda Yandex/Google Maps)
- Logo va asosiy rasm

#### `/settings/rooms` — Xona turlari va narxlar
- Xona turlari ro'yxati: nomi (Standart, Lyuks, Family Suite...), sig'im,
  asosiy narx, qulayliklar (Wi-Fi, TV, mini-bar, balkon...)
- Bayram narxi va dam olish kuni narxi
- Foto galereya
- Real xonalar ro'yxati: 101, 102, 201... har biriga tur tayinlash

#### `/settings/staff`
- Xodimlar ro'yxati (PARTNER rolidagi sub-user'lar)
- Taklif yuborish (telefon orqali — admin tasdiqlaydi)
- Huquqlar: Front Desk / Housekeeping / Manager / Accountant
- Faol sessiyalar

> Sub-user kontsepti backend'da hozir yo'q — backend dev'dan so'raladi.

#### `/settings/bank`
- Bank rekvizitlari (UzBron'dan pul tushadigan hisob)
- Admin tomonidan tasdiqlash kerak

#### `/settings/notifications`
- Kanal × hodisa matrix: SMS, Email, Push × yangi bron, bekor qilish, sharh

---

## 5. NAVIGATSIYA (sidebar)

**Operatsion:**
- Front Desk (`/`)
- Bronlar (`/reservations`)
- Kalendar (`/calendar`)
- Xonalar (`/rooms`)

**Mijoz:**
- Mijozlar (`/guests`)
- Sharhlar (`/reviews`)

**Boshqaruv:**
- Hisobotlar (`/reports`)
- Sozlamalar (`/settings/hotel`)

---

## 6. KOMPONENT KUTUBXONASI

**Atom (UI):** Button, Input, Select, Checkbox, Switch, Badge, Card,
Modal, Drawer, Toast (Sonner), Skeleton, Spinner, Tooltip

**Domain (mehmonxonaga xos):**
- `ReservationStatusBadge` — bron status
- `RoomStatusBadge` — xona housekeeping status (toza/iflos/band/ta'mir)
- `RoomCard` — kalendar va housekeeping uchun
- `GuestCard` — mijoz qisqa kartochkasi
- `OccupancyMeter` — to'liqlik gauge
- `BookingTimeline` — yaratildi → check-in → check-out timeline
- `CheckInDialog`, `CheckOutDialog` — modal'lar

**Layout:** Sidebar, Topbar, PageHeader, EmptyState, AuthGuard, ThemeToggle,
UserMenu

---

## 7. BACKEND BILAN ISHLASH

**Hozir mavjud (`apps/backend/`):**

| Method | Path | Holat |
|---|---|---|
| POST `/auth/otp/request`, POST `/auth/otp/verify` | OTP oqimi | ✅ |
| GET `/hotels`, GET `/hotels/:id` | Public mehmonxonalar | ✅ |
| GET `/partners/dashboard` | Stub KPI | ✅ (lekin JWT middleware'siz 403) |

**Backend dev'dan so'raladigan endpoint'lar:**

- `GET /partners/me` — joriy mehmonxona profili
- `GET/POST/PATCH /partners/rooms` — xonalar (turi va alohida xonalar)
- `PATCH /partners/rooms/:id/status` — housekeeping status
- `GET /partners/reservations` — bronlar (filter + paginate)
- `POST /partners/reservations` — walk-in bron yaratish
- `PATCH /partners/reservations/:id` — tasdiqlash / rad etish / bekor qilish
- `POST /partners/reservations/:id/check-in`
- `POST /partners/reservations/:id/check-out`
- `GET /partners/calendar` — sana oralig'idagi mavjudlik
- `GET /partners/guests`, `GET /partners/guests/:id` — mijozlar
- `GET /partners/reviews`, `POST /partners/reviews/:id/reply`
- `GET /partners/reports` — occupancy, revenue, ADR, RevPAR
- `GET /partners/staff`, `POST /partners/staff` (taklif)

**Demo rejim (hozir):**
- Barcha ma'lumotlar `app/_lib/mocks/data.ts`'da
- Hook'lar mock qaytaradi (`useReservations`, `useRooms`, `useCalendar`...)
- Backend tayyor bo'lsa — faqat hook'larni `request()` chaqirig'iga
  almashtiramiz; komponentlar o'zgarmaydi

---

## 8. UX TAMOYILLARI

1. **Tezlik > go'zallik.** Front desk staff'ga har bir klik tejaladi:
   keyboard shortcut'lar (`⌘K` qidiruv, `c` = check-in, `o` = check-out).
2. **Status birinchi.** Har bir bron/xona qatori uchun status badge eng
   ko'rinarli element bo'lsin.
3. **Kontekst tugmalari.** "Check-in" tugmasi faqat bugun keladiganlarda
   ko'rinadi. Holatga mos harakat.
4. **Telefon — birinchi darajali aloqa.** Har bir mijoz telefoni `tel:` link.
5. **Bo'sh holat — yo'l ko'rsatuvchi.** Har bo'sh sahifa CTA bilan ("Yangi
   bron yaratish").
6. **Toast tasdiqlash.** Har bir muvaffaqiyatli amal — yashil toast
   (3 soniya), xato — qizil toast.
7. **Tushuntirish.** Texnik so'zlar emas — "Tasdiqlash kutilmoqda" emas
   "Yangi bron, javob bering".

---

## 9. RESPONSIVE

- **≥1280px (desktop):** to'liq sidebar + barcha funksiya
- **≥768px (tablet, resepsiyon stoli):** sidebar collapse, asosiy ish oqimi
  (Front Desk, Reservations, Rooms) qulay
- **<768px (mobile, housekeeping uchun):** faqat `/rooms` va `/reservations`
  optimallashtirilgan; sidebar drawer

---

## 10. MVP REJASI

| Sprint | Davomiyligi | Tarkib |
|---|---|---|
| **0 — Skelet** ✅ | 1 hafta | Layout, sidebar, UI kit, theme, providers |
| **1 — Auth + Front Desk** | 1 hafta | `/login` demo, `/` Front Desk (KPI + bugun) |
| **2 — Bronlar** | 1.5 hafta | `/reservations` jadvali, `/reservations/[id]`, check-in/out |
| **3 — Xonalar** | 1 hafta | `/rooms` housekeeping board, status yangilash |
| **4 — Kalendar** | 1 hafta | `/calendar` xonalar × kunlar grid |
| **5 — Mijoz + Sharh** | 1 hafta | `/guests`, `/reviews` |
| **6 — Hisobotlar + Sozlamalar** | 1 hafta | `/reports`, `/settings/*` to'liq |

**Umumiy:** ~6–7 hafta MVP.

---

## 11. CHEGARALAR

- ⛔ `apps/web-partner/` tashqarisidagi hech narsaga teginmaslik
- 📖 `apps/backend/`, `packages/types/` — faqat **o'qish**
- ❌ `/register` sahifasi yo'q (admin login beradi)
- 🎭 Hozircha hammasi demo/mock rejim — backendsiz ishlaydi

---

*Hujjat versiyasi: 3.0 (mehmonxona staff PMS yo'nalishida)*
*Sana: 2026-yil iyun*
