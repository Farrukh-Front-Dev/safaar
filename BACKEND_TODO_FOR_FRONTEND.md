# Backend Uchun Kerakli Endpointlar (Frontend So'rovi)

> **Mualif:** web-user frontend dev
> **Yangilangan:** 2026-07-09
> **Maqsad:** Frontend sahifalardagi hardcoded/demo datalarni real backend dataga almashtirish.

---

## Bosh sahifa holati (2026-07-09)

| Bo'lim | Backendga ulanganmi? | Izoh |
|--------|---------------------|------|
| Hero (sarlavha) | ✅ Ha | i18n dict'dan keladi |
| SearchBar (shahar) | ✅ Ha | `GET /v1/catalog/cities` |
| Featured Hotels (tanlangan) | ⚠️ Qisman | `GET /v1/hotels?limit=6` ishlatiladi, lekin 4 tadan kam bo'lsa **6 ta hardcoded demo** bilan to'ldiriladi |
| Chegirmadagi takliflar | ❌ Yo'q | **4 ta hardcoded demo** — backendda `GET /v1/cms/offers` bor lekin bo'sh `[]` qaytaradi, DB yo'q |
| Mashhur shaharlar | ❌ Yo'q | **8 ta hardcoded demo** — `GET /v1/catalog/cities` faqat `id + name` qaytaradi, `hotel_count`, `image_url`, `slug` yo'q |
| TrustBar (statistika) | ❌ Yo'q | **Statik i18n text** — backendda `GET /v1/stats/public` yo'q |

---

## Hotels sahifasi holati (2026-07-09)

### `/hotels` — Mehmonxonalar ro'yxati

| Komponent | Backendga ulanganmi? | Izoh |
|-----------|---------------------|------|
| SearchBar (shahar tanlash) | ✅ Ha | `GET /v1/catalog/cities` |
| Mehmonxonalar ro'yxati | ✅ Ha | `GET /v1/hotels` |
| Filtr (yulduz, narx) | ⚠️ Frontend | Backend filter qo'llamaydi, frontend client-side filterlaydi |
| Saralash (narx, reyting) | ⚠️ Frontend | Backend sort qo'llamaydi, frontend client-side saralaydi |
| Pagination | ⚠️ Frontend | Backend barcha mehmonxonalarni qaytaradi, frontend 9 tadan bo'lib ko'rsatadi |

**Muammo:** Backend `GET /v1/hotels` barcha mehmonxonalarni to'liq qaytaradi. Filter, sort, pagination frontendda client-side bajariladi. Bu katta ma'lumot bilan ishlashda muammo bo'lishi mumkin.

**Kerakli:** Backend tomonidan server-side filter/sort/pagination qo'llash.

### `/hotels/[slug]` — Mehmonxona tafsiloti

| Komponent | Backendga ulanganmi? | Izoh |
|-----------|---------------------|------|
| Mehmonxona ma'lumotlari | ✅ Ha | `GET /v1/hotels/:slug` |
| Galereya (rasmlar) | ✅ Ha | Hotel images array'dan |
| Xonalar ro'yxati | ✅ Ha | `GET /v1/hotels/:id/rooms` |
| Sharhlar | ✅ Ha | `GET /v1/hotels/:id/reviews` |
| Sevimlilar | ✅ Ha | `findFavoriteId` — auth talab qiladi |
| Qulayliklar (amenities) | ✅ Ha | `GET /v1/catalog/amenities` |

**Hotels detail sahifasi to'liq backendga ulangan ✅**

---

## Kerakli o'zgartirishlar (backend dev uchun)

### 1. `GET /v1/catalog/cities` — qo'shimcha maydonlar

**Hozirgi holat:** Faqat `id`, `name` qaytaradi.

**Kerakli qo'shimchalar:**
- `slug` — URL uchun (masalan `toshkent`)
- `image_url` — shahar rasmi
- `hotel_count` — haqiqiy mehmonxona soni (subquery/JOIN bilan hisoblash)

**Kutilgan javob:**
```json
{
  "success": true,
  "data": [
    {
      "id": "city-uuid",
      "name": { "uz": "Toshkent", "ru": "Ташкент", "en": "Tashkent" },
      "slug": "toshkent",
      "image_url": "https://...",
      "hotel_count": 215
    }
  ]
}
```

**Backend fayllari:**
- `apps/backend/src/catalog/catalog.controller.ts`
- `apps/backend/src/catalog/catalog.service.ts`
- `apps/backend/prisma/schema.prisma` — `cities` jadvalida `slug`, `image_url` ustunlari + `hotels` jadvalidan `hotel_count` hisoblash

---

### 2. `GET /v1/hotels/featured` — Tanlangan mehmonxonalar

**Hozirgi holat:** Maxsus endpoint yo'q. `GET /v1/hotels?limit=6` ishlatiladi, lekin "featured" degan tushuncha yo'q.

**Kerakli:**
- `hotels` jadvalida `is_featured` boolean ustuni (admin tomonidan boshqariladi)
- `GET /v1/hotels/featured?limit=6` endpoint — faqat `is_featured=true` bo'lganlarni qaytaradi

**Kutilgan javob:** Hozirgi `GET /v1/hotels` javobi bilan bir xil format.

**Backend fayllari:**
- `apps/backend/src/hotels/hotels.controller.ts` — `@Get('featured')` qo'shish
- `apps/backend/src/hotels/hotels.service.ts` — `findFeatured()` metodi
- `apps/backend/prisma/schema.prisma` — `hotels` jadvalida `is_featured Boolean @default(false)`

---

### 3. `GET /v1/cms/deals` — Chegirmadagi takliflar (yoki `GET /v1/promos/public`)

**Hozirgi holat:** `GET /v1/cms/offers` mavjud lekin bo'sh `[]` qaytaradi. DB jadvalida offers/deals yo'q.

**Kerakli:**
- `promos` jadvalida yoki yangi `deals` jadvalida takliflar saqlansin
- `GET /v1/promos/public` yoki `GET /v1/cms/deals` endpoint — faqat faol takliflarni qaytarsin

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

**Eslatma:** Narxlar tiyinda. `ends_at` — ISO datetime, frontend o'zi "3 kun qoldi" hisoblaydi.

---

### 4. `GET /v1/stats/public` — Platforma statistikasi

**Hozirgi holat:** Yo'q. TrustBar'dagi raqamlar statik i18n text.

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

**Eslatma:** Keshlanishi mumkin (1 soat). Auth talab qilinmasin.

---

### 5. `GET /v1/hotels` — Server-side filter/sort/pagination

**Hozirgi holat:** Backend barcha mehmonxonalarni to'liq qaytaradi. Filter, sort, pagination frontendda client-side bajariladi.

**Kerakli qo'shimchalar:**
- `stars` query param — yulduz bo'yicha filter (masalan `?stars=4`)
- `min_price`, `max_price` query param — narx bo'yicha filter
- `sort` query param — saralash (masalan `?sort=price_asc`, `?sort=rating`)
- `page`, `limit` query param — pagination
- Javobda `meta.total` — jami natijalar soni (pagination uchun)

**Kutilgan javob:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 150,
    "page": 1,
    "limit": 9
  }
}
```

**Backend fayllari:**
- `apps/backend/src/hotels/hotels.controller.ts` — query parametrlarni qabul qilish
- `apps/backend/src/hotels/hotels.service.ts` — Prisma `where`, `orderBy`, `skip`, `take` qo'llash

---

## Ustuvorlik Tartibi

| # | Endpoint | Ustuvorlik | Sabab |
|---|----------|-----------|-------|
| 1 | `catalog/cities` ga `slug`, `image_url`, `hotel_count` qo'shish | 🔴 Yuqori | Bosh sahifadagi 8 ta shahar kartasi hozir hardcoded |
| 2 | `GET /hotels/featured` endpoint | 🔴 Yuqori | Tanlangan mehmonxonalar, hardcoded fallback bor |
| 3 | `GET /hotels` ga server-side filter/sort/pagination | 🔴 Yuqori | Katta ma'lumot bilan ishlashda muammo |
| 4 | `GET /promos/public` yoki `GET /cms/deals` | 🟡 O'rta | Chegirmali takliflar, demo bilan ham ishlaydi |
| 5 | `GET /stats/public` | 🟡 O'rta | TrustBar — statik ham bo'ladi |

---

## Umumiy Eslatmalar

- Barcha javoblar `ApiSuccess<T>` formatida bo'lsin (`{ success: true, data: ..., meta: { request_id } }`).
- Ko'p tilli maydonlar `{ uz: "...", ru: "...", en: "..." }` formatda.
- Narxlar **tiyin**da (1 so'm = 100 tiyin).
- Yuqoridagi endpointlar **ochiq** (auth talab qilinmasin).

---

*Savollar bo'lsa — frontend dev bilan gaplashing. Bu fayl yangilanib turadi.*
