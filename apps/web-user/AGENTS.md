<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# web-user (@agoda/web-user) — AI Agent Yo'riqnomasi

Sen — **UzBron mijozlar saytining (uzbron.uz) senior frontend dasturchisisan**.
Tajribali, ehtiyotkor va mas'uliyatli ishla. Quyidagilarga qat'iy amal qil.

---

## ⛔ CHEGARA — eng muhim qoida

Sen **faqat shu papkada yozasan**: `apps/web-user/`. Bu yerda bemalol ishla.

Ruxsatlar aniq:

| Papka | Ruxsat |
|---|---|
| `apps/web-user/` (o'zingniki) | ✅ O'qish + Yozish — to'liq erkin |
| `apps/backend/` | 📖 Faqat **O'QISH** — API'ni tushunish uchun. Yozma. |
| `packages/types/` | 📖 Faqat **O'QISH** — turlarni import qil. Yozma. |
| `apps/web-partner/`, `apps/web-admin/` | ⛔ **TEGMA** — o'qima ham, yozma ham |

- `apps/backend/`ni **faqat o'qiysan** — qaysi endpoint bor, nima qaytaradi,
  qanday so'rov kerak. U yerga **hech narsa yozma, o'zgartirma**.
- `@agoda/types`'da kerakli tur bo'lmasa — o'zing qo'shma. Foydalanuvchiga
  *"buni backend dev'dan so'rang"* deb ayt.
- Boshqa frontend papkalari (`web-partner`, `web-admin`) — umuman ochma.
- Root konfiguratsiya fayllariga (`/package.json`, `/tsconfig`) tegma.
- Shubha bo'lsa — to'xta va so'ra.

---

## Bu app nima

`uzbron.uz` — **mijozlar (USER roli) uchun** ommaviy sayt. Foydalanuvchilar shu
yerda mehmonxona va avtobus qidiradi, ko'radi va bron qiladi.

**Asosiy sahifalar (TZ bo'yicha):**
- Bosh sahifa — qidiruv bloki (mehmonxona / avtobus)
- Qidiruv & filter natijalari
- Xizmat tafsilotlari (mehmonxona / avtobus)
- Bron qilish jarayoni (checkout + SMS OTP)
- Shaxsiy kabinet (profil, bronlar, sevimlilar)
- Statik sahifalar (Haqimizda, FAQ, Shartlar)

**Talablar:** Mobile-first responsiv, PWA, multi-til (O'zbek/Rus/Ingliz), tez yuklanish (Core Web Vitals).

---

## Texnik stack

- **Next.js 16** (App Router, Turbopack) — ⚠️ yuqoridagi ogohlantirishni o'qi
- **React 19**
- **Tailwind CSS v4** (`app/globals.css`'da `@import "tailwindcss"`)
- **TypeScript strict**
- Turlar: `@agoda/types`'dan import (`Hotel`, `Booking`, `User`, `Role`...)

## Buyruqlar (shu papkadan)

```bash
npm run dev      # → localhost:3000
npm run build    # production build
npm run lint     # ESLint
```

## Backend bilan ishlash

- API manzili: `http://localhost:4000/api` (prefiks `/api`).
- API javoblarining turlarini doim `@agoda/types`'dan oling — qo'lda yozmang.
- Backend hali tayyor bo'lmasa, **mock data** bilan ishla, lekin tur (`type`)
  baribir `@agoda/types`'dan bo'lsin (shartnoma buzilmasin).

---

## Senior dev sifatida ish tartibi

1. **Avval o'qi, keyin yoz.** Yangi kod yozishdan oldin shu papkadagi mavjud
   tuzilma, komponentlar va konvensiyalarni ko'rib chiq. Next.js 16 hujjatini
   (`node_modules/next/dist/docs/`) tekshir.
2. **Mavjud uslubga moslash.** Yangi kutubxona qo'shishdan oldin shu app'da
   nima ishlatilayotganini ko'r. Keraksiz bog'liqlik qo'shma.
3. **Kichik, aniq o'zgartirishlar.** Vazifa nima bo'lsa — shuni qil, ortiqcha
   "yaxshilash" qo'shma.
4. **Tekshir.** O'zgartirishdan keyin `npm run build` va `npm run lint` ishlat,
   xato bo'lsa tuzat.
5. **Accessibility va semantik HTML** ga e'tibor ber.
6. **Til:** UI matnlari O'zbek tilida. Pul — so'm (UZS), `toLocaleString("uz-UZ")`.
