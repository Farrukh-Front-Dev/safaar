# Backend Uchun Kerakli Endpointlar (Frontend So'rovi)

> **Mualif:** web-user frontend dev  
> **Sana:** 2026-07-07  
> **Maqsad:** Bosh sahifa va boshqa sahifalar uchun frontendda hozirda **hardcoded/demo** data ishlatilmoqda. Quyidagi endpointlar tayyor bo'lganda real dataga almashtiriladi.

---

## 1. `GET /deals` yoki `GET /cms/deals` — Chegirmadagi Takliflar

**Kerak bo'lgan joy:** Bosh sahifa "Chegirmadagi takliflar" bo'limi

**Hozirgi holat:** Frontend'da 4 ta hardcoded demo deal bor. Backend'da `GET /cms/offers` mavjud lekin **bo'sh massiv** qaytaradi. `POST /promos/validate` faqat promo-kod tekshiradi, deals ro'yxatini bermaydi.

**Kutilgan javob:**
```json
{
  "success": true,
  "data": [
    {
      "id": "deal-uuid",
      "hotel_id": "hotel-uuid",
      "slug": "samarkand-plaza",
      "name": { "uz": "Samarkand Plaza", "ru": "...", "en": "..." },
      "city_name": { "uz": "Samarqand", "ru": "...", "en": "..." },
      "image_url": "https://...",
      "old_price": 45000000,
      "new_price": 31500000,
      "discount_percent": 30,
      "ends_at": "2026-07-10T23:59:59Z",
      "status": "active"
    }
  ]
}
```

**Eslatma:** Narxlar tiyinda (× 100). `ends_at` — ISO datetime, frontend o'zi "3 kun qoldi" hisoblaydi.

---

## 2. `GET /catalog/popular-cities` — Mashhur Shaharlar (statistika bilan)

**Kerak bo'lgan joy:** Bosh sahifa "Mashhur yo'nalishlar" bo'limi

**Hozirgi holat:** 8 ta shahar qo'lda yozilgan (nomi, rasm, "200+ mehmonxona" — barchasi soxta). `GET /catalog/cities` faqat id + name qaytaradi, mehmonxona soni va rasm yo'q.

**Kutilgan javob:**
```json
{
  "success": true,
  "data": [
    {
      "id": "city-uuid",
      "name": { "uz": "Toshkent", "ru": "Ташкент", "en": "Tashkent" },
      "slug": "tashkent",
      "image_url": "https://...",
      "hotel_count": 215,
      "sort_order": 1
    }
  ]
}
```

**Eslatma:** `hotel_count` — haqiqiy e'lon qilingan mehmonxonalar soni. `sort_order` — admin paneldan boshqariladigan tartib.

---

## 3. `GET /catalog/partners-showcase` — Hamkorlar Logolari

**Kerak bo'lgan joy:** Bosh sahifa "Ishonchli hamkorlar" bo'limi

**Hozirgi holat:** Frontend'da 6 ta statik demo hamkor logosi bor. Backend'da hamkorlar boshqaruvi mavjud (`admin/partners`), lekin **frontga ko'rsatish uchun ochiq endpoint yo'q**.

**Kutilgan javob:**
```json
{
  "success": true,
  "data": [
    {
      "id": "partner-uuid",
      "company_name": "Hyatt Regency Tashkent",
      "logo_url": "https://...",
      "type": "hotel",
      "sort_order": 1
    }
  ]
}
```

**Eslatma:** Faqat `status: approved` bo'lgan va `showcase: true` belgilangan hamkorlarni qaytarsin. Auth talab qilinmasin (ochiq endpoint).

---

## 4. `GET /stats/public` — Platforma Statistikasi

**Kerak bo'lgan joy:** Bosh sahifa "TrustBar" (raqamlar: mehmonxonalar soni, shaharlar, reyting, ...)

**Hozirgi holat:** "12,000+", "50+", "4.8★" — barchasi i18n JSON faylida statik yozilgan.

**Kutilgan javob:**
```json
{
  "success": true,
  "data": {
    "total_hotels": 523,
    "total_cities": 15,
    "average_rating": 4.7,
    "total_bookings": 12450,
    "total_partners": 320
  }
}
```

**Eslatma:** Keshlanishi mumkin (1 soat). Auth talab qilinmasin. Frontend o'zi "500+" formatga aylantiradi.

---

## 5. `GET /hotels/featured` — Tanlangan Mehmonxonalar

**Kerak bo'lgan joy:** Bosh sahifa "Mashhur takliflar" (horizontal scroll kartalar)

**Hozirgi holat:** `GET /hotels?limit=6` chaqiriladi. Agar 4 tadan kam kelsa, **6 ta hardcoded demo mehmonxona** bilan to'ldiriladi.

**Kerakli o'zgartirish:** Yoki `GET /hotels?featured=true&limit=6` parametri qo'shilsin, yoki alohida `GET /hotels/featured` endpoint bo'lsin. Admin panelda mehmonxonani "featured" deb belgilash imkoniyati kerak.

**Kutilgan javob:** Hozirgi `GET /hotels` javobi bilan bir xil format, lekin faqat featured=true bo'lganlari.

---

## 6. `GET /cms/offers` ni to'ldirish (yoki `GET /deals` bilan almashtirish)

**Hozirgi holat:** `GET /cms/offers` mavjud lekin **bo'sh massiv** `[]` qaytaradi. Admin panelda offer yaratish logikasi yo'q.

**Kerakli:** Admin paneldan maxsus taklif (deal/offer) yaratish va u frontda ko'rinishi.

---

## Ustuvorlik Tartibi (Frontend Nuqtai Nazaridan)

| # | Endpoint | Ustuvorlik | Sabab |
|---|----------|-----------|-------|
| 1 | `GET /hotels/featured` | 🔴 Yuqori | Bosh sahifada birinchi ko'rinadigan narsa |
| 2 | `GET /catalog/popular-cities` | 🔴 Yuqori | Bosh sahifa asosiy navigatsiya |
| 3 | `GET /deals` | 🟡 O'rta | Muhim lekin demo bilan ham ishlaydi |
| 4 | `GET /stats/public` | 🟡 O'rta | TrustBar — ishonch uchun, lekin statik ham bo'ladi |
| 5 | `GET /catalog/partners-showcase` | 🟢 Past | Chiroyli ko'rinish, lekin hali oz hamkor bor |
| 6 | `GET /cms/offers` to'ldirish | 🟢 Past | Admin panel funksiyasi kerak avval |

---

## Umumiy Eslatmalar

- Barcha javoblar `ApiSuccess<T>` formatida bo'lsin (`{ success: true, data: ..., meta: { request_id } }`).
- Ko'p tilli maydonlar `{ uz: "...", ru: "...", en: "..." }` formatda.
- Narxlar **tiyin**da (1 so'm = 100 tiyin).
- Yuqoridagi endpointlar **ochiq** (auth talab qilinmasin) — bosh sahifada login bo'lmagan foydalanuvchi ham ko'radi.
- ISR (Incremental Static Regeneration) uchun `Cache-Control` headerlari qo'shilsa yaxshi bo'lardi.

---

*Savollar bo'lsa — frontend dev bilan gaplashing. Bu fayl yangilanib turadi.*
