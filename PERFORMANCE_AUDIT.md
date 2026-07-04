# UzBron Backend Performance Audit

Date: 2026-07-04
Branch: `performance/backend-optimization`

## Scope

Audit faqat backend API, Prisma/PostgreSQL schema, cache, background queue va
local performance smoke testlarni qamrab oladi. Frontend papkalari tekshirilmadi
va o'zgartirilmadi.

## Baseline Findings

1. Admin list endpointlari (`/admin/users`, `/admin/bookings`,
   `/admin/payments`, `/admin/support/tickets`, `/admin/audit-logs`) default
   pagination/limit ishlatmas edi. Data ko'payganda bitta so'rov juda katta
   payload va sekin DB queryga aylanadi.

2. Admin dashboard overview har chaqirilganda aggregation query bajarardi:
   users, partners, bookings, payments count/sum hisoblari cache qilinmagan.

3. Public catalog va CMS endpointlari ko'p chaqiriladigan statik/semi-statik
   data qaytaradi, ammo cache yo'q edi.

4. Hotel list ichida har hotel uchun room/city ma'lumotlari alohida qidirilar
   edi. Bu in-memory rejimda ham N+1ga o'xshash scan pattern hosil qiladi.

5. Bus trip list har trip uchun `tripSeats` arrayini qayta filter qilardi.
   Trip soni oshsa `trips * seats` murakkablik yuzaga keladi.

6. Slow request va slow DB query logging yo'q edi. Timeout muammosida qaysi
   endpoint yoki query sekinligini ko'rish qiyin edi.

7. PostgreSQL schema ayrim asosiy filter/order patternlari uchun composite
   indexlarni to'liq qoplamas edi: booking status/date, partner/date,
   trip status/departure, hotel status/rating, support/audit/export listlar.

8. Export/report ishlari request thread ichida "queued" deb qaytarilsa ham,
   aniq background queue abstraction yo'q edi.

## Risk Areas

- Admin paneldagi umumiy listlar katta production datada eng tez sekinlashadi.
- Dashboard aggregation har refreshda DBga bosim beradi.
- Search/list endpointlarida limit bo'lmasa, frontend timeout va browser memory
  muammolari paydo bo'ladi.
- Redis ishlamasa productionda cache/queue fallback strategiyasi aniq bo'lishi
  kerak; local/dev uchun in-memory fallback yetarli, productionda Redis majburiy
  deb yuritiladi.

## Recommended Thresholds

- Slow HTTP request: `SLOW_REQUEST_MS=1000`.
- Slow DB query: `SLOW_QUERY_MS=300`.
- Public list max limit: 50.
- Admin/partner list max limit: 100.
- Dashboard cache TTL: 30 seconds.
- Catalog cache TTL: 3600 seconds.
- CMS public cache TTL: 300 seconds.
- Public settings cache TTL: 900 seconds.

