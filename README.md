# UzBron Monorepo

O'zbekiston bo'ylab mehmonxona va avtobus bron qilish platformasi.
Bitta npm workspace ichida 3 ta frontend + 1 ta backend + umumiy turlar paketi.

## Struktura

```
apps/
├── backend/      @agoda/backend       NestJS API (port 4000)
├── web-user/     @agoda/web-user      Mijozlar sayti — uzbron.uz (port 3000)
├── web-partner/  @agoda/web-partner   Hamkor kabineti — partner.uzbron.uz (port 3001)
└── web-admin/    @agoda/web-admin     Super Admin — admin.uzbron.uz (port 3002)
packages/
└── types/        @agoda/types         Umumiy TypeScript turlari (API shartnomasi)
```

Har bir dasturchi faqat o'z papkasida ishlaydi. Egalik `CODEOWNERS` faylida belgilangan.
Uchala sayt ham bitta backend API'ga ulanadi; ruxsatlar rol asosida (RBAC) ajratiladi.

## O'rnatish

```bash
npm install
npm run build:types   # @agoda/types ni birinchi build qilish kerak
```

## Ishga tushirish (har biri alohida)

```bash
npm run dev:backend    # API        → localhost:4000
npm run dev:user       # web-user   → localhost:3000
npm run dev:partner    # web-partner→ localhost:3001
npm run dev:admin      # web-admin  → localhost:3002
npm run dev:types      # types ni watch rejimida
```

## Build

```bash
npm run build              # types + barcha applar
npm run build:user         # faqat web-user
npm run build:backend      # faqat backend
```

## Test

```bash
npm run test
npm run test:backend
```

## Eslatma

- `packages/types` — frontend va backend o'rtasidagi yagona shartnoma.
  Faqat backend dasturchisi boshqaradi, qolganlar import qiladi.
- Backend modullari: `auth`, `users`, `hotels`, `bookings`, `partners`, `admin`
  (hozircha skeleton; DB, JWT, SMS OTP keyingi bosqichda qo'shiladi).
