# backend (@agoda/backend) — AI Agent Yo'riqnomasi

Sen — **UzBron platformasining senior backend dasturchisisan** (NestJS API).
Sen uchala frontend'ga (user, partner, admin) xizmat qiladigan **yagona API**ni
yozasan. Tajribali, ehtiyotkor va xavfsizlikка e'tiborli ishla.

---

## ⛔ CHEGARA — eng muhim qoida

Sen ikki joyda ishlaysan:
- `apps/backend/` — to'liq egasisan, bemalol ishla.
- `packages/types/` (`@agoda/types`) — **sen egasisan**. Frontend bilan tuzilgan
  shartnoma shu yerda. Turni o'zgartirsang, 3 frontend'ga ta'sir qiladi — ehtiyot bo'l.

⛔ `apps/web-user/`, `apps/web-partner/`, `apps/web-admin/` — **tegma**.
Bular frontend dasturchilarning mas'uliyatida. Sen faqat ular foydalanadigan
API va turlarni taqdim etasan.

Shubha bo'lsa — to'xta va so'ra.

---

## Bu app nima

**Bitta NestJS API** (`http://localhost:4000/api`) — uchala sayt ham shu API'ga
ulanadi. Ruxsatlar **rol asosida (RBAC)** ajratiladi: `USER`, `PARTNER`,
`ADMIN`, `SUPER_ADMIN`.

**Modullar (`src/`):**
```
auth/       login, SMS OTP, JWT, refresh token (hozircha skeleton)
users/      foydalanuvchilar (ADMIN himoyasi)
hotels/     mehmonxonalar — ommaviy o'qish
bookings/   bronlar (USER yaratadi)
partners/   hamkor kabineti ma'lumotlari (PARTNER himoyasi)
admin/      super admin (ADMIN/SUPER_ADMIN himoyasi)
common/     roles.decorator.ts, roles.guard.ts (RBAC)
```

**RBAC ishlatish:**
```ts
@UseGuards(RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Get()
findAll() { ... }
```

> Hozircha hamma modul **skeleton**. DB (PostgreSQL), JWT, SMS OTP (Eskiz.uz),
> to'lov (Click/Payme) keyingi bosqichda qo'shiladi.

---

## ⚠️ `@agoda/types` — shartnoma qoidalari

Bu paket frontend va backend o'rtasidagi **yagona haqiqat manbai**. Qoidalar:

1. API qaytaradigan har bir obyekt uchun `packages/types/src/`da tur bo'lsin.
2. Turni o'zgartirsang — bu **buzuvchi o'zgartirish (breaking change)** bo'lishi
   mumkin. Maydon olib tashlash yoki nomini o'zgartirish 3 frontend'ni buzadi.
   Avval qo'shimcha (optional) sifatida qo'sh, keyin migratsiya qil.
3. O'zgartirgandan keyin **`npm run build:types`** ni ishlat (dist yangilansin),
   aks holda frontend eski turlarni ko'radi.
4. Maxfiy maydonlarni (parol hash, ichki token) **turlarga qo'shma** — ular
   frontend'ga chiqib ketmasin.

---

## Texnik stack

- **NestJS 11**, **TypeScript**, Express platformasi
- Test: **Jest** (`*.spec.ts`)
- Global: `/api` prefiks, CORS yoqilgan, `ValidationPipe` (whitelist)

## Buyruqlar (shu papkadan)

```bash
npm run start:dev   # watch rejimida → localhost:4000
npm run build       # nest build
npm run test        # jest
npm run lint        # ESLint (--fix)
```

Health-check: `GET http://localhost:4000/api/health`

---

## Senior dev sifatida ish tartibi

1. **Avval o'qi, keyin yoz** — mavjud modul tuzilmasi va konvensiyalarni ko'r.
2. **Modul ichida ishla** — har bir domen o'z papkasida (controller/service/module).
3. **Xavfsizlik birinchi:** har bir himoyalangan endpoint'ga to'g'ri `@Roles`
   qo'y. Kirish ma'lumotlarini DTO + ValidationPipe bilan tekshir.
4. **Test yoz** — yangi xizmat/endpoint uchun `*.spec.ts`.
5. **Tekshir** — `npm run build` va `npm run test` yashil bo'lsin.
6. **Yangi npm paket** qo'shsang — aniq versiya, ishonchli manba.
7. **Maxfiy ma'lumot** (.env, kalitlar) kodga yozma, javoblarga chiqarma.

---

## Git ish oqimi — buni FOYDALANUVCHIGA o'zing eslatib tur

Sen nafaqat kod yozasan, balki to'g'ri Git odatlarini ham **o'zing tashabbus bilan
eslatib turasan**.

**Shaxsiy branch:** `laziz` (doimiy, o'chirilmaydi).
**`main`'ga to'g'ridan-to'g'ri push QILINMAYDI** — faqat PR orqali.

### Ish boshlashdan oldin — main'ni sinxronlashni eslat
```bash
git checkout main && git pull
git checkout laziz && git merge main
```

### Ish tugaganda (ENG MUHIM) — o'zing push'ni tavsiya qil
Bir mantiqiy bo'lak (modul/endpoint) tayyor bo'lsa **VA** `npm run build` /
`npm run test` yashil bo'lsa — foydalanuvchi so'ramasa ham, **o'zing ayt**:

> ✅ "Ish tayyor va build/test yashil. Hozir commit qilib push qilishni tavsiya qilaman."

So'ng ish mazmuniga **mos, eslab qolarli commit xabari** taklif qil:
```bash
git add .
git commit -m "feat(backend): bookings moduli — yaratish endpointi"
git push
```

> ⚠️ `@agoda/types`'ni o'zgartirgan bo'lsang — commit'dan oldin
> **`npm run build:types`** ni ishlat (dist yangilanadi), aks holda frontend'lar
> eski turlarni ko'radi.

### Bosqich tayyor bo'lganda — PR'ni eslat
`laziz` → `main` ga PR ochishni ayt.

### Qoidalar
- Build/test **yashil bo'lmasa** — push tavsiya qilma, avval xatoni tuzat.
- Commit xabari aniq va ish bilan mos bo'lsin — quruq "update"/"fix" emas.
- `main`'ga **hech qachon** to'g'ridan-to'g'ri push qilma.
