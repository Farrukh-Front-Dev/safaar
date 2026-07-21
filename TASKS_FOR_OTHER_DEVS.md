# 📋 Topshiriqlar Ro'yxati (Boshqa Dasturchilar Uchun)

Ushbu fayl `web-user` dasturchisi tomonidan PromoBar funksiyasini dinamik va `web-admin` orqali boshqariladigan qilish uchun tayyorlandi.

---

## 1. ⚙️ Backend Dasturchi (`@safaar/backend` & `@safaar/types`)

### A. TypeScript Turlari (`packages/types/src/cms.ts`)
`PromoBarConfig` turini qo'shing va re-export qiling:

```ts
export interface PromoBarConfig {
  id?: string;
  isActive: boolean;
  text: {
    uz: string;
    ru: string;
    en: string;
  };
  badge?: {
    uz?: string;
    ru?: string;
    en?: string;
  };
  link?: string;
  linkText?: {
    uz?: string;
    ru?: string;
    en?: string;
  };
  endsAt?: string | null; // ISO Date string (e.g. "2026-08-01T00:00:00Z")
  isDismissible?: boolean;
}
```

### B. Database / Entity
- `SystemSetting` yoki `PromoBar` jadvallarida promo bar ma'lumotlarini saqlash tuzilmasini yarating.

### C. API Endpoint'lar (`apps/backend`)
1. **Public Endpoint (Ochiq API):**
   - **`GET /v1/cms/promo-bar`**
   - Javob formati: `PromoBarConfig` obyekti.
   - Kesh/revalidate: 60 sekund.
   - Agar promo bar o'chirilgan bo'lsa: `{ isActive: false }` qaytarilsin.

2. **Admin Endpoint (Himoyalangan API):**
   - **`GET /v1/admin/cms/promo-bar`** — Hozirgi sozlamalarni olish (`ADMIN` / `SUPER_ADMIN` rollari uchun).
   - **`PUT /v1/admin/cms/promo-bar`** — Sozlamalarni yangilash / yoqish / o'chirish.

---

## 2. 🖥️ Web-Admin Dasturchi (`@safaar/web-admin`)

### A. CMS / Marketing sozlamalari sahifasi
`web-admin` loyihasida (masalan: `/dashboard/marketing/promo-bar` yoki CMS bo'limida) quyidagi boshqaruv formalarini yarating:

1. **Yoqish / O'chirish Tugmasi (Toggle Switch):**
   - `isActive` (`boolean`) — Promo bar sahifada ko'rinsinmi yoki yo'qmi.

2. **Ko'p tilli matn kiritish (Multilingual Text Inputs):**
   - `text.uz` (O'zbekcha matn — *Majburiy*)
   - `text.ru` (Ruscha matn)
   - `text.en` (Inglizcha matn)

3. **Nishon / Badge (Ixtiyoriy):**
   - `badge.uz` (Masalan: `"🔥 AKSIYA"`, `"YAZGI CHEGIRMA"`)
   - `badge.ru`, `badge.en`

4. **Havola / Link (Ixtiyoriy):**
   - `link` (Aksiya sahifasining URL manzili, masalan: `"/search?discount=true"`).
   - `linkText` (Masalan: `"Batafsil"`, `"Ko'rish"`).

5. **Tugash Sanasi / Expiration Picker (Ixtiyoriy):**
   - `endsAt` — Aksiya tugaydigan sana va vaqt. Ushbu vaqt o'tgach, `web-user` banner joyini avtomatik yashiradi.

6. **Yopish tugmasi (Is Dismissible):**
   - `isDismissible` (`boolean`) — Foydalanuvchi `X` tugmasini bosib bannerni yopishiga ruxsat berish.

7. **Saqlash tugmasi:**
   - Formani `PUT /v1/admin/cms/promo-bar` endpoint'iga yuborish.

---

## 3. 🌐 Web-User (`apps/web-user`) — Bajarilgan ishlar

- `web-user` da `PromoBar` komponenti to'liq tayyor qilindi.
- `GET /v1/cms/promo-bar` API'ga parallel so'rov yuborish va revalidation o'rnatildi (`lib/promo.ts`).
- Server offline yoki API hali tayyor bo'lmagan holatlar uchun xavfsiz fallback yaratildi.
- Foydalanuvchi `X` tugmasi orqali yopsa, joriy seansda (`sessionStorage`) yopiq holatda saqlanadi.
- Expiration (`endsAt`) sanasi o'tsa avtomatik yashiriladi.
