# UzBron Monorepo — AI Agent Yo'riqnomasi

Bu fayl monorepo **root**ida. Agar AI agent shu darajadan ishlayotgan bo'lsa,
quyidagi tuzilma va chegaralarga **qat'iy** rioya qilsin.

> ⚠️ Eng to'g'ri ish uslubi: AI'ni root'dan emas, **o'z app papkasidan** ishga
> tushiring (`cd apps/web-user && claude`). Shunda agent faqat o'z app'ini ko'radi.

---

## Loyiha haqida

**UzBron** — O'zbekiston bo'ylab mehmonxona va avtobus bron qilish platformasi
(Agoda'ga o'xshash). Bitta npm workspace monorepo: 3 ta mustaqil frontend +
1 ta backend API + umumiy turlar paketi.

```
apps/
├── backend/      @agoda/backend      NestJS API        → :4000
├── web-user/     @agoda/web-user     uzbron.uz         → :3000   (mijozlar)
├── web-partner/  @agoda/web-partner  partner.uzbron.uz → :3001   (hamkorlar)
└── web-admin/    @agoda/web-admin    admin.uzbron.uz   → :3002   (super admin)
packages/
└── types/        @agoda/types        API shartnomasi (umumiy TS turlari)
```

Uchala sayt ham **bitta backend API**'ga ulanadi; ruxsatlar rol asosida (RBAC):
`USER`, `PARTNER`, `ADMIN`, `SUPER_ADMIN`.

---

## ⛔ ENG MUHIM CHEGARA QOIDASI

Har bir papkaning **bitta egasi** bor (`CODEOWNERS` fayliga qarang). AI agent
**faqat o'ziga topshirilgan papkada** ishlaydi:

| Papka | Egasi | Boshqalar uchun |
|---|---|---|
| `apps/web-user/` | web-user dev | ⛔ tegmang (o'qima ham) |
| `apps/web-partner/` | web-partner dev | ⛔ tegmang (o'qima ham) |
| `apps/web-admin/` | web-admin dev | ⛔ tegmang (o'qima ham) |
| `apps/backend/` | backend dev | 📖 faqat O'QING (API'ni tushunish uchun), o'zgartirmang |
| `packages/types/` | backend dev | 📖 faqat O'QING (import), o'zgartirmang |

**Soddа qoida (har bir frontend dev uchun):**
- O'z app papkangda — ✅ bemalol o'qi va yoz.
- `apps/backend/` va `packages/types/` — 📖 faqat **o'qi** (API va turlarni
  tushunish uchun), hech narsa **o'zgartirma**.
- Boshqa frontend papkalari — ⛔ umuman **ochma**.

**Qoidalar:**
1. O'z app papkangizda to'liq ishlaysiz. **Boshqa frontend papkalarига**
   (`web-user`/`web-partner`/`web-admin`) tegish — o'qish ham, yozish ham —
   **taqiqlanadi**.
2. `apps/backend/` va `packages/types/` — faqat **o'qish** (API'ni tushunish va
   turlarni import qilish uchun). Ularni faqat backend dev o'zgartiradi. Agar
   yangi tur/endpoint kerak bo'lsa — o'zingiz qo'shmang, "buni backend dev'dan
   so'rang" deb ayting.
3. Root konfiguratsiya (`package.json`, `tsconfig`, `CODEOWNERS`) — faqat
   foydalanuvchi aniq so'rasa tegiladi.
4. Shubha bo'lsa — to'xtang va foydalanuvchidan so'rang.

---

## Umumiy buyruqlar (root'dan)

```bash
npm install            # barcha workspace'larni o'rnatish
npm run build:types    # @agoda/types ni birinchi build qilish (MAJBURIY birinchi)
npm run dev:user       # web-user    → :3000
npm run dev:partner    # web-partner → :3001
npm run dev:admin      # web-admin   → :3002
npm run dev:backend    # backend     → :4000
npm run build          # types + barcha applar
npm run test           # barcha testlar
```

## Konvensiyalar (butun monorepo)

- TypeScript **strict** rejimida. `any` dan qoching.
- Format: Prettier (`.prettierrc`). Lint: har app'da ESLint.
- O'zgartirishdan keyin **build va testni ishga tushiring**, yashil bo'lsin.
- Commit'lar aniq va kichik bo'lsin; har bir dev o'z branch'ida ishlaydi,
  `main`'ga to'g'ridan-to'g'ri push qilinmaydi — faqat PR orqali.
- Til: UI matnlari O'zbek tilida (kerak bo'lsa Rus/Ingliz). Pul birligi — so'm (UZS).

Tafsilotlar uchun har bir app'ning o'z `AGENTS.md` fayliga qarang.
