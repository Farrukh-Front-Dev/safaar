# UzBron Backend Performance Remediation

Date: 2026-07-04
Branch: `performance/backend-optimization`

## Implemented Changes

1. Added common pagination helper:
   `apps/backend/src/common/pagination.ts`.
   It normalizes `page`, `limit`, `sort_by`, `order`, clamps limits, and supports
   public/admin/partner scopes.

2. Added slow request logging:
   `apps/backend/src/common/performance.interceptor.ts`.
   It attaches/returns `x-request-id` and logs structured JSON without request
   bodies, tokens, cookies, or secrets.

3. Added slow query logging in:
   `apps/backend/src/infrastructure/postgres.service.ts`.
   Queries slower than `SLOW_QUERY_MS` are logged with duration, row count, and a
   shortened SQL summary.

4. Added cache abstraction:
   `apps/backend/src/infrastructure/cache.service.ts`.
   Redis is used when available; local/dev can safely fall back to in-memory TTL
   cache.

5. Added background job abstraction:
   `apps/backend/src/infrastructure/job-queue.service.ts`.
   Export/data-export jobs are idempotent by key and are queued through BullMQ
   when Redis is configured, with in-memory visibility for local/dev.

6. Added pagination and default limits to admin/user/partner list endpoints while
   preserving existing array response shapes where the frontend already expected
   arrays.

7. Optimized hotel list:
   - precomputes rooms by hotel,
   - precomputes city lookups,
   - supports filter/sort/limit,
   - caches public list responses briefly.

8. Optimized bus trip list:
   - precomputes available seats by trip,
   - supports date/price/from/to filters,
   - supports sort/limit,
   - caches public list responses briefly.

9. Cached hot endpoints:
   - catalog: 3600s,
   - CMS collections: 300s,
   - public settings: 900s,
   - admin dashboard overview: 30s,
   - admin settings: 300s.

10. Added cache invalidation hooks for admin mutations that affect dashboard,
    CMS, settings, partners, hotels, bookings, promos, admin users and finance
    views.

11. Added non-destructive performance index migration:
    `apps/backend/prisma/migrations/20260704120000_add_performance_indexes/migration.sql`.

12. Added local performance smoke tests:
    `apps/backend/test/performance/performance.e2e-spec.ts`.
    Run with:
    `npm run perf:backend -w @agoda/backend`.

## New Environment Variables

- `SLOW_REQUEST_MS=1000`
- `SLOW_QUERY_MS=300`
- `CACHE_ENABLED=true`
- `CACHE_DEFAULT_TTL_SECONDS=300`
- Existing DB timeout settings remain:
  `DB_CONNECTION_TIMEOUT_MS`, `DB_QUERY_TIMEOUT_MS`, `DB_QUERY_ATTEMPTS`,
  `DB_POOL_MAX`, `DB_IDLE_TIMEOUT_MS`.

## Cache Invalidation Strategy

- Catalog cache is long-lived and should be invalidated when catalog tables are
  changed by admin/import tooling.
- CMS public cache is invalidated on admin CMS create/update/action and promo
  changes.
- Admin dashboard/settings cache is invalidated after status, booking, partner,
  hotel, CMS, promo and admin-user mutations.
- Short TTLs intentionally limit stale-data windows even if a mutation misses an
  invalidation path.

## Queue Strategy

- Export/report/data-export tasks are now represented as queue jobs.
- Idempotency keys prevent duplicate export jobs for repeated button clicks.
- Production should run Redis and BullMQ workers separately for:
  exports, reports, notifications, email, SMS and image processing.
- Local/dev can keep the in-memory fallback for fast frontend integration.

## Database Notes

- Migration only adds indexes. It does not drop tables, columns, rows, or
  constraints.
- For very large tables, consider creating indexes concurrently in a separate
  DBA-managed migration window.
- Production should keep in-memory data fallback disabled and configure real
  `DATABASE_URL`, `REDIS_URL`, DB timeouts and pool sizing.

## Verification Commands

```bash
npm run prisma:validate -w @agoda/backend
npm run build:backend -w @agoda/backend
npm run test:backend -w @agoda/backend
npm run test:e2e -w @agoda/backend
npm run perf:backend -w @agoda/backend
npm run lint:check -w @agoda/backend
```
