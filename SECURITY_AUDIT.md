# UzBron Security Audit

Audit date: 2026-07-03
Scope: repository at `/home/laziz/agoda`
Role: Senior Application Security Engineer / Backend Architect / NestJS Security Reviewer

No production services were called. Secrets and private values were not printed in this report.

## 1. Executive Summary

Overall security posture: **not production ready**.

Release verdict: **FAIL - RELEASE BLOCKED**.

Confirmed / high-confidence issue count:

- Critical: 3
- High: 6
- Medium: 5
- Low/Info: 2

The largest 5 risks:

1. Any client can become `SUPER_ADMIN` or another role by sending `x-user-role`, `x-user-id`, or forged `mock-access.*` tokens.
2. Authentication is demo-grade: static OTP, hardcoded admin/partner credentials, static 2FA, mock JWT, no real OAuth verification.
3. Booking, refund, support, notification, export and partner endpoints have IDOR/BOLA gaps.
4. Payment webhooks accept unsigned unauthenticated payloads and mark payments as paid.
5. Partner tenant isolation and API key verification are incomplete; unknown API keys fall back to the demo organization.

Release decision:

- Do not release this backend to production.
- It is acceptable only as a local/demo MVP behind trusted developers.
- Production release requires replacing dev auth, enforcing ownership checks, implementing payment signature/idempotency, and moving state changes to transactional database code.

## 2. Scope

Reviewed:

- Root docs: `AGENTS.md`, `README.md`, `CONTRIBUTING.md`.
- Backend docs: `apps/backend/AGENTS.md`, `apps/backend/README.md`.
- NestJS modules/controllers/services/DTOs under `apps/backend/src`.
- Prisma schema and migration files under `apps/backend/prisma`.
- Frontend auth/API client security-relevant files in `web-user`, `web-partner`, `web-admin`.
- Dockerfile, Docker Compose and GitHub Actions workflows.
- Environment variable structure with values masked.
- Existing tests and scripts.

Not fully reviewed:

- Real Click/Payme/Uzcard/Humo integrations because implementation is mock.
- Real Redis/BullMQ processors because only constants exist.
- Real Socket.io gateway because only event constants exist.
- Real S3/Yandex integration because upload code is mock.
- Dependency CVE registry because internet/audit registry access was not used.
- Git history secret scanning beyond current working tree.

Audit limitations:

- Worktree was dirty before audit. Existing local modifications include backend and web-admin files. I did not revert user changes.
- `npm run lint` was not executed because the backend lint script uses `eslint --fix`, which can modify source during an audit.
- First E2E run failed in sandbox with `listen EPERM`; the same command passed after local port permission was granted.
- Security PoC tests intentionally reproduce current insecure behavior; they are evidence tests, not proof that the system is secure.

## 3. Architecture and Threat Model

Architecture summary:

- Monorepo with 3 Next.js frontends and 1 NestJS backend.
- Backend default prefix: `/v1`; legacy `/api` requests are rewritten to `/v1`.
- Backend currently mixes Postgres reads in `AdminService` with in-memory stores in most domain services.
- Prisma schema models the intended production database, but most services still use `InMemoryDbService`.
- `RolesGuard` is the central guard, but it currently builds actors from client-controlled headers or mock token strings.

Actors:

- Anonymous internet user.
- Authenticated `USER`.
- `PARTNER` user.
- `ADMIN`.
- `SUPER_ADMIN`.
- Payment provider webhook sender.
- Partner API client.
- Queue worker / background processor.
- Internal operator/developer.

Assets:

- User phone/email/profile.
- Bookings, vouchers, messages.
- Partner hotels, rooms, bus trips, ledger and withdrawals.
- Payments, refunds and provider references.
- Admin users, roles and settings.
- Private documents and uploads.
- API keys and webhook secrets.

Trust boundaries:

- Internet -> API.
- User -> Partner resources.
- Partner A -> Partner B resources.
- Admin roles -> finance/content/support/moderation permissions.
- API -> PostgreSQL.
- API -> Redis/BullMQ.
- API -> S3/Object Storage.
- Payment provider -> webhook endpoints.
- WebSocket client -> rooms.
- Queue worker -> database.
- Frontend cookie/localStorage -> backend authorization.

## 4. Security Controls Already Implemented Well

- Global `ValidationPipe` is enabled with `whitelist`, `forbidNonWhitelisted`, and `transform`: `apps/backend/src/main.ts:39-45`.
- Helmet is enabled: `apps/backend/src/main.ts:17-18`.
- JSON and urlencoded request bodies have 1 MB limits: `apps/backend/src/main.ts:19-20`.
- Global throttling exists, although it is coarse: `apps/backend/src/app.module.ts:35-40`.
- Environment validation requires core secrets in production: `apps/backend/src/config/env.validation.ts:25-35`.
- Error filter avoids raw stack traces for unknown errors: `apps/backend/src/common/http-error.filter.ts:47-52`.
- Prisma schema uses UUID IDs, Decimal money fields, and some useful unique constraints: `apps/backend/prisma/schema.prisma:117-179`, `apps/backend/prisma/schema.prisma:438-451`, `apps/backend/prisma/schema.prisma:625-657`.
- User web app stores its session cookie as `HttpOnly`, `Secure` in production, and `SameSite=Lax`: `apps/web-user/lib/auth/session.ts:39-47`.
- `.gitignore` ignores dotenv files: `.gitignore:49-54`.

## 5. Findings Table

### UZB-SEC-001

| Field | Value |
| --- | --- |
| ID | UZB-SEC-001 |
| Title | Client-controlled headers and mock bearer tokens allow role spoofing |
| Severity | CRITICAL |
| Confidence | CONFIRMED |
| OWASP category | A01 Broken Access Control, A07 Identification and Authentication Failures |
| CWE | CWE-287, CWE-306, CWE-863 |
| Affected component | Backend auth/RBAC |
| File | `apps/backend/src/common/actor.ts`, `apps/backend/src/common/roles.guard.ts`, `apps/web-admin/lib/api/client.ts` |
| Line | `actor.ts:29-48`, `actor.ts:63-76`, `roles.guard.ts:38-49`, `client.ts:19-21` |
| Description | `RolesGuard` trusts `x-user-role`, `x-user-id`, and forgeable `mock-access.*` bearer strings from the client. A caller can choose `SUPER_ADMIN`, `PARTNER`, or `USER` without cryptographic verification. |
| Evidence | `buildActorFromHeaders` accepts `x-user-role`; `buildActorFromAuthorization` parses `mock-access.<id>.<role>.<session>`; web-admin sends `x-user-role: SUPER_ADMIN`. PoC tests at `apps/backend/test/security/security-findings.e2e-spec.ts:10-33`. |
| Safe reproduction | `npm run test:e2e -w @agoda/backend` runs tests showing forged headers/token become `SUPER_ADMIN`. |
| Impact | Admin takeover, tenant bypass, arbitrary access to protected endpoints. |
| Recommendation | Replace header/mock auth with JWT guard validating signature, algorithm, issuer, audience, expiration, token type and session status. Remove dev headers outside explicit local-only test mode. |
| Regression test | Expect requests with spoofed `x-user-role` or forged `mock-access.*` to return 401/403. |
| Release blocker | Yes |

### UZB-SEC-002

| Field | Value |
| --- | --- |
| ID | UZB-SEC-002 |
| Title | Demo authentication flows remain active |
| Severity | CRITICAL |
| Confidence | CONFIRMED |
| OWASP category | A07 Identification and Authentication Failures |
| CWE | CWE-798, CWE-330, CWE-287 |
| Affected component | AuthService |
| File | `apps/backend/src/auth/auth.service.ts`, `apps/backend/src/auth/dto/auth.dto.ts` |
| Line | `auth.service.ts:29-41`, `auth.service.ts:114-149`, `auth.service.ts:183-201`, `auth.service.ts:204-218`, `auth.service.ts:265-315`, `auth.service.ts:344-349` |
| Description | User OTP is static outside production, production OTP uses `Math.random`, admin password is hardcoded to `admin`, partner password is hardcoded to `password`, 2FA code is static `000000`, OAuth trusts frontend-provided profile fields, refresh tokens are raw mock strings. |
| Evidence | Static code and credentials are present in service logic. DTO examples also expose demo values. |
| Safe reproduction | Login with demo credentials/code in local environment; no external service required. |
| Impact | Account takeover, admin takeover, OAuth account takeover, refresh replay, weak OTP entropy. |
| Recommendation | Implement real SMS/OAuth/password auth; use `crypto.randomInt` for OTP; hash OTP/challenges with purpose, TTL, attempts and one-time use; verify admin/partner Argon2 hashes; enforce 2FA challenge binding; issue real signed JWTs; store refresh token hashes with rotation. |
| Regression test | Invalid static OTP/password/2FA must fail in non-test mode; forged OAuth payload must fail provider verification. |
| Release blocker | Yes |

### UZB-SEC-003

| Field | Value |
| --- | --- |
| ID | UZB-SEC-003 |
| Title | Booking endpoints expose and mutate bookings without ownership checks |
| Severity | HIGH |
| Confidence | CONFIRMED |
| OWASP category | A01 Broken Access Control |
| CWE | CWE-639, CWE-862 |
| Affected component | Bookings and user account |
| File | `apps/backend/src/bookings/bookings.controller.ts`, `apps/backend/src/bookings/bookings.service.ts`, `apps/backend/src/users/users.controller.ts`, `apps/backend/src/users/users.service.ts` |
| Line | `bookings.controller.ts:45-120`, `bookings.service.ts:123-193`, `bookings.service.ts:150-174`, `users.controller.ts:54-56`, `users.service.ts:55-65` |
| Description | Booking detail, voucher, status history, conversation, messages, cancel, retry payment and `/me/bookings/:id` resolve only by booking ID. They do not verify `booking.user_id === actor.id` or partner tenant ownership. |
| Evidence | Service methods call `assertBooking(id)` / `findBooking(id)` with no actor. PoC test at `apps/backend/test/security/security-findings.e2e-spec.ts:35-58`. |
| Safe reproduction | Create a booking for user A in memory and call `UsersService.booking(id)` without user scoping. |
| Impact | User A can view/cancel/message User B's booking if ID is known or guessed; partner can access other partner bookings. |
| Recommendation | Pass actor into every object-level service method; enforce owner/tenant checks in service/repository layer; return 404 or 403 consistently. |
| Regression test | User A cannot access User B booking, voucher, messages, refund or payment. Partner A cannot access Partner B bookings. |
| Release blocker | Yes |

### UZB-SEC-004

| Field | Value |
| --- | --- |
| ID | UZB-SEC-004 |
| Title | Partner tenant isolation is incomplete |
| Severity | HIGH |
| Confidence | CONFIRMED |
| OWASP category | A01 Broken Access Control |
| CWE | CWE-639 |
| Affected component | Partner dashboard/API |
| File | `apps/backend/src/partners/partners.service.ts`, `apps/backend/src/partner-api/partner-api.service.ts` |
| Line | `partners.service.ts:199-211`, `partners.service.ts:233-276`, `partners.service.ts:425-463`, `partners.service.ts:550-612`, `partner-api.service.ts:58-70` |
| Description | Some partner list endpoints filter by organization, but object/action endpoints such as hotel detail/update, room update, booking detail/status, finance document download, webhook update/delete/test do not verify ownership. Invalid partner API keys fall back to `demo-partner-org-id`. |
| Evidence | `assertHotel(id)` checks only existence; `booking(id)` checks only existence; `organizationId(apiKey)` returns fallback organization for unknown keys. PoC test at `apps/backend/test/security/security-findings.e2e-spec.ts:88-104`. |
| Safe reproduction | Call PartnerApiService with an invalid key and observe demo org bookings returned. |
| Impact | Partner A can view/update Partner B resources; unknown API keys can access demo tenant data; production tenant data could leak if fallback remains. |
| Recommendation | Reject unknown API keys; hash and scope API keys; require tenant checks for every partner object/action; include organization ID in repository predicates. |
| Regression test | Partner A receives 403/404 for Partner B hotels, rooms, trips, bookings, ledger, webhooks and exports. Unknown API key receives 403. |
| Release blocker | Yes |

### UZB-SEC-005

| Field | Value |
| --- | --- |
| ID | UZB-SEC-005 |
| Title | Payment webhooks are unsigned, unauthenticated and non-idempotent |
| Severity | CRITICAL |
| Confidence | CONFIRMED |
| OWASP category | A01 Broken Access Control, A04 Insecure Design |
| CWE | CWE-345, CWE-352, CWE-840 |
| Affected component | Payments |
| File | `apps/backend/src/payments/payments.controller.ts`, `apps/backend/src/payments/payments.service.ts` |
| Line | `payments.controller.ts:34-89`, `payments.service.ts:35-61` |
| Description | Click/Payme/Uzcard/Humo webhook endpoints are public and accept body-only events. No provider signature, timestamp, amount, currency, event ID, replay protection or booking/payment ownership validation is enforced. |
| Evidence | `providerWebhook` sets payment status to `paid` for non-prepare events. PoC test at `apps/backend/test/security/security-findings.e2e-spec.ts:60-86`. |
| Safe reproduction | Submit a local webhook body with `booking_id` and any transaction ID; payment becomes paid. |
| Impact | Anyone can mark bookings paid, forge provider references, replay events and cause financial/accounting abuse. |
| Recommendation | Implement provider-specific signature verification over raw body, timing-safe compare, timestamp/replay checks, unique event IDs, amount/currency validation, idempotent state machine and strict status transitions. |
| Regression test | Missing/invalid signature, duplicate event, wrong amount/currency, wrong booking and replay all fail safely. |
| Release blocker | Yes |

### UZB-SEC-006

| Field | Value |
| --- | --- |
| ID | UZB-SEC-006 |
| Title | Booking inventory and status changes are not transactionally safe |
| Severity | HIGH |
| Confidence | HIGH CONFIDENCE |
| OWASP category | A04 Insecure Design |
| CWE | CWE-362, CWE-367 |
| Affected component | Bookings, hotel inventory, bus seats |
| File | `apps/backend/src/bookings/bookings.service.ts`, `apps/backend/src/infrastructure/postgres.service.ts`, `apps/backend/src/infrastructure/infrastructure.module.ts` |
| Line | `bookings.service.ts:35-59`, `bookings.service.ts:82-119`, `bookings.service.ts:256-298`, `postgres.service.ts:47-48`, `infrastructure.module.ts:7-8` |
| Description | Hotel bookings do not reserve/decrement `RoomInventory`. Bus seats are mutated in memory without DB locks or uniqueness on active holds. Booking creation/payment/status updates are not wrapped in Prisma transactions. If Postgres query fails, code falls back to in-memory behavior. |
| Evidence | Seat status is changed after booking creation in a normal loop; hotel room inventory is not checked against booked counts; infrastructure exports `InMemoryDbService` globally. |
| Safe reproduction | Existing service code demonstrates no transactional boundaries; concurrency tests are still needed against real DB repositories. |
| Impact | Double booking, oversold rooms/seats, inconsistent payment/booking status, data loss on process restart. |
| Recommendation | Move booking flow to Prisma transactions with row-level/serializable locking or optimistic versioning; enforce unique active holds for seats; update inventory atomically; remove fallback in production. |
| Regression test | Parallel booking attempts for last room/seat result in one success and remaining requests fail cleanly. |
| Release blocker | Yes |

### UZB-SEC-007

| Field | Value |
| --- | --- |
| ID | UZB-SEC-007 |
| Title | Partner API keys are returned and matched as plaintext/prefix |
| Severity | HIGH |
| Confidence | CONFIRMED |
| OWASP category | A02 Cryptographic Failures, A07 Identification and Authentication Failures |
| CWE | CWE-256, CWE-798 |
| Affected component | Partner API keys |
| File | `apps/backend/src/partners/partners.service.ts`, `apps/backend/src/partner-api/partner-api.service.ts`, `apps/backend/prisma/schema.prisma` |
| Line | `partners.service.ts:564-577`, `partner-api.service.ts:66-70`, `schema.prisma:784-800` |
| Description | Prisma schema models `secretHash`, but implementation stores and returns `secret`. Validation accepts either full secret or `key_prefix`; unknown keys fall back to demo organization. |
| Evidence | `createApiKey` response includes `secret`; `organizationId` checks `secret` or `key_prefix`. |
| Safe reproduction | See UZB-SEC-004 PoC test. |
| Impact | API key disclosure, prefix-only authentication, tenant data exposure. |
| Recommendation | Return full key only once, store Argon2/HMAC hash, authenticate full key only, compare timing-safe, remove fallback, enforce scopes/IP allowlist/expiry/revocation. |
| Regression test | Prefix-only key and unknown key fail; revoked/expired/out-of-scope keys fail. |
| Release blocker | Yes |

### UZB-SEC-008

| Field | Value |
| --- | --- |
| ID | UZB-SEC-008 |
| Title | CORS defaults to allow-all while credentials are enabled |
| Severity | HIGH |
| Confidence | HIGH CONFIDENCE |
| OWASP category | A05 Security Misconfiguration |
| CWE | CWE-942 |
| Affected component | HTTP config |
| File | `apps/backend/src/config/cors.ts`, `apps/backend/src/main.ts` |
| Line | `cors.ts:1-4`, `main.ts:21-24` |
| Description | If `CORS_ORIGINS` is missing or `*`, `origin` becomes `true`; CORS is enabled with `credentials: true`. This can reflect arbitrary origins in many Express CORS configurations. |
| Evidence | `corsOriginsFromEnv` returns `true` for missing or `*`; `enableCors` sets credentials. |
| Safe reproduction | Start backend without `CORS_ORIGINS` and inspect CORS response for arbitrary local Origin. |
| Impact | Cross-origin credentialed requests can be exposed if browser cookies are used. Combined with CSRF gaps this is high risk. |
| Recommendation | In production, require explicit allowlist; reject `Origin: null`; avoid wildcard with credentials; validate exact origins only. |
| Regression test | `https://eviluzbron.uz` and `Origin: null` do not receive credentialed CORS headers. |
| Release blocker | Yes |

### UZB-SEC-009

| Field | Value |
| --- | --- |
| ID | UZB-SEC-009 |
| Title | Admin permission model is too coarse for finance/content/support roles |
| Severity | HIGH |
| Confidence | CONFIRMED |
| OWASP category | A01 Broken Access Control |
| CWE | CWE-266, CWE-863 |
| Affected component | Admin RBAC |
| File | `apps/backend/src/admin/admin.controller.ts`, `apps/backend/src/admin/admin.service.ts`, `packages/types/src/auth.ts` |
| Line | `admin.controller.ts:16-18`, `admin.controller.ts:279-356`, `admin.controller.ts:359-555`, `admin.service.ts:1113-1157`, `auth.ts:6-15` |
| Description | Every admin route is allowed for `ADMIN` and `SUPER_ADMIN`; no `FINANCE_ADMIN`, `CONTENT_ADMIN`, `SUPPORT_ADMIN`, `MODERATOR` role enforcement exists in the Role enum or guard. |
| Evidence | Class-level `@Roles(Role.ADMIN, Role.SUPER_ADMIN)` covers refunds, withdrawals, CMS, settings, role permissions and admin-user changes. |
| Safe reproduction | With any accepted `ADMIN` actor, call finance/CMS/settings/admin-user endpoints locally. |
| Impact | Lower-privileged admin can approve withdrawals/refunds, edit CMS, reset 2FA or change role permissions. |
| Recommendation | Add permission-based guard, role matrix, route-level permissions, audit all sensitive admin actions and prevent self-privilege escalation. |
| Regression test | Moderator cannot change roles; finance admin cannot edit CMS; content admin cannot approve withdrawals. |
| Release blocker | Yes |

### UZB-SEC-010

| Field | Value |
| --- | --- |
| ID | UZB-SEC-010 |
| Title | Upload and presign endpoints lack file validation and object ownership controls |
| Severity | MEDIUM |
| Confidence | CONFIRMED |
| OWASP category | A05 Security Misconfiguration, A01 Broken Access Control |
| CWE | CWE-434, CWE-22, CWE-862 |
| Affected component | Uploads |
| File | `apps/backend/src/uploads/uploads.controller.ts`, `apps/backend/src/uploads/uploads.service.ts` |
| Line | `uploads.controller.ts:20-50`, `uploads.service.ts:15-38`, `uploads.service.ts:41-42` |
| Description | Upload endpoints accept arbitrary filename, MIME type and size from JSON and return mock URLs. Delete does not check owner. No MIME signature, extension allowlist, size limit, document privacy or malware scan hook exists. |
| Evidence | Service trusts `body.filename`, `body.mime_type`, `body.size`; delete returns `{ deleted: true }` by ID only. |
| Safe reproduction | Call local service/controller with any filename/MIME. |
| Impact | Unsafe file upload design; private documents could become public or deleted by another actor when real storage is connected. |
| Recommendation | Use multipart/presigned policy with server-generated object keys, MIME sniffing, size/count limits, owner-scoped delete, private buckets for documents, short presigned expiry, malware scan hook. |
| Regression test | Executable/SVG/polyglot/oversized files fail; user cannot delete another user's object. |
| Release blocker | No, if feature disabled before production; otherwise Yes |

### UZB-SEC-011

| Field | Value |
| --- | --- |
| ID | UZB-SEC-011 |
| Title | Frontend token storage and dev auth headers weaken session security |
| Severity | MEDIUM |
| Confidence | CONFIRMED |
| OWASP category | A02 Cryptographic Failures, A07 Identification and Authentication Failures |
| CWE | CWE-922 |
| Affected component | Web frontends |
| File | `apps/web-admin/app/(auth)/login/page.tsx`, `apps/web-admin/lib/api/client.ts`, `apps/web-partner/app/_stores/auth-store.ts`, `apps/web-user/lib/auth/session.ts` |
| Line | `login/page.tsx:30-35`, `client.ts:15-21`, `auth-store.ts:22-45`, `session.ts:39-47`, `session.ts:55-58` |
| Description | Admin token is stored with js-cookie from client JS, partner tokens are persisted in localStorage, admin API client sends hardcoded `x-user-role`, and web-user sends dev auth headers from session. |
| Evidence | Admin cookie is not created by server as HttpOnly; partner store explicitly notes localStorage. |
| Safe reproduction | Inspect browser storage/cookies in local panels. |
| Impact | XSS can steal admin/partner tokens; dev headers can bypass backend if backend trusts them. |
| Recommendation | Set auth cookies server-side as HttpOnly/Secure/SameSite; keep refresh tokens out of JS; remove dev auth headers in production; enforce CSP and CSRF controls. |
| Regression test | JS cannot read admin/refresh tokens; backend ignores client role headers. |
| Release blocker | Yes while backend trusts dev headers |

### UZB-SEC-012

| Field | Value |
| --- | --- |
| ID | UZB-SEC-012 |
| Title | Refund/support/notification/export object-level ownership checks are incomplete |
| Severity | MEDIUM |
| Confidence | HIGH CONFIDENCE |
| OWASP category | A01 Broken Access Control |
| CWE | CWE-639 |
| Affected component | Refunds, support, notifications, exports, reviews |
| File | `apps/backend/src/refunds/refunds.service.ts`, `apps/backend/src/support/support.service.ts`, `apps/backend/src/notifications/notifications.service.ts`, `apps/backend/src/exports/exports.service.ts`, `apps/backend/src/reviews/reviews.service.ts` |
| Line | `refunds.service.ts:36-45`, `support.service.ts:31-64`, `notifications.service.ts:18-23`, `exports.service.ts:22-36`, `reviews.service.ts:27-40` |
| Description | Several object endpoints resolve by ID and mutate/read without verifying the actor owns the resource. |
| Evidence | `findOne(id)`, `status(id)`, `read(id)`, `download(id)`, `update(id)` take only the object ID. |
| Safe reproduction | Create object under one actor and call ID-based method as another actor in unit test. |
| Impact | Cross-user ticket/refund/export/review/notification access or modification. |
| Recommendation | Pass actor to all ID-based services and include owner/tenant predicates. |
| Regression test | User A cannot read/update/delete User B support tickets, refunds, exports, reviews or notifications. |
| Release blocker | Yes for production privacy |

### UZB-SEC-013

| Field | Value |
| --- | --- |
| ID | UZB-SEC-013 |
| Title | Docker and local deployment are not hardened |
| Severity | MEDIUM |
| Confidence | CONFIRMED |
| OWASP category | A05 Security Misconfiguration |
| CWE | CWE-250, CWE-521 |
| Affected component | Docker/Docker Compose |
| File | `apps/backend/Dockerfile`, `docker-compose.backend.yml` |
| Line | `Dockerfile:1-27`, `docker-compose.backend.yml:2-43` |
| Description | Container runs as root by default, images are tag-pinned but not digest-pinned, API has no Docker healthcheck, Postgres/Redis are published to host ports, Redis has no password, local Postgres password is weak/default. |
| Evidence | No `USER` directive; compose exposes `5432`, `6379`, `4000` and sets simple local DB password. |
| Safe reproduction | Inspect Dockerfile/compose. |
| Impact | Container escape blast radius, exposed local services, weak defaults accidentally reused. |
| Recommendation | Run as non-root, use minimal runtime, add API healthcheck, avoid publishing DB/Redis except local profiles, set Redis auth where needed, use secrets manager for production. |
| Regression test | Container user is non-root; compose production profile does not expose DB/Redis publicly. |
| Release blocker | No for local-only compose; Yes for production deployment |

### UZB-SEC-014

| Field | Value |
| --- | --- |
| ID | UZB-SEC-014 |
| Title | Swagger defaults to enabled |
| Severity | MEDIUM |
| Confidence | CONFIRMED |
| OWASP category | A05 Security Misconfiguration |
| CWE | CWE-200 |
| Affected component | Swagger/API docs |
| File | `apps/backend/src/main.ts` |
| Line | `main.ts:49-70` |
| Description | Swagger is enabled unless `SWAGGER_ENABLED=false`. In production, this risks exposing API surface and dev auth schemes if env is misconfigured. |
| Evidence | Default value is `'true'`. |
| Safe reproduction | Start without `SWAGGER_ENABLED=false` and visit `/v1/docs`. |
| Impact | Endpoint discovery and auth scheme disclosure. |
| Recommendation | Default Swagger off in production; protect docs behind admin auth/VPN; remove dev API-key docs in production. |
| Regression test | Production config without explicit enable does not serve `/v1/docs`. |
| Release blocker | No, but must be fixed before public production |

### UZB-SEC-015

| Field | Value |
| --- | --- |
| ID | UZB-SEC-015 |
| Title | Dependency/security automation coverage is incomplete |
| Severity | LOW |
| Confidence | HIGH CONFIDENCE |
| OWASP category | A06 Vulnerable and Outdated Components |
| CWE | CWE-1104 |
| Affected component | CI/CD |
| File | `.github/workflows/backend-ci.yml`, `.github/workflows/ci.yml`, `package.json` |
| Line | `backend-ci.yml:29-34`, `ci.yml:103-106`, `package.json:16-27` |
| Description | CI runs build/test/lint, but no dependency audit, secret scan, SAST, container scan or SBOM generation is configured. Backend lint auto-fixes in CI. |
| Evidence | Workflow steps do not include audit/scanning jobs; backend lint script is `eslint ... --fix`. |
| Safe reproduction | Inspect workflows and scripts. |
| Impact | Vulnerable dependencies/secrets/container issues may be missed before merge. |
| Recommendation | Add non-mutating lint, npm audit/OSV, CodeQL/Semgrep, secret scanning, Trivy/Grype image scan, Dependabot/Renovate and SBOM. |
| Regression test | CI fails on high/critical dependency vulnerabilities and committed secrets. |
| Release blocker | No |

### UZB-SEC-016

| Field | Value |
| --- | --- |
| ID | UZB-SEC-016 |
| Title | WebSocket, BullMQ, Redis and real provider controls are not implemented yet |
| Severity | INFO |
| Confidence | CONFIRMED |
| OWASP category | A04 Insecure Design |
| CWE | N/A |
| Affected component | Real-time, queues, cache, external integrations |
| File | `apps/backend/src/realtime/events.ts`, `apps/backend/src/jobs/job-names.ts`, `apps/backend/src/integrations/*` |
| Line | `events.ts:1-17`, `job-names.ts:1-19` |
| Description | Event/queue/provider contracts exist, but no actual gateway, processors, Redis locks/cache or external provider verification logic is present. |
| Evidence | Only constants/interfaces were found. |
| Safe reproduction | Inspect files. |
| Impact | Not a direct vulnerability until enabled, but planned features lack security enforcement. |
| Recommendation | Before enabling, implement auth, room ownership, DTO validation, rate limits, idempotent jobs, Redis ACL/TLS, lock ownership and provider-specific signature verification. |
| Regression test | Add tests for WebSocket room auth, duplicate jobs, stale cache, OTP TTL and webhook delivery idempotency. |
| Release blocker | No if features disabled |

## 6. Role and Permission Matrix

Current role enum:

- `USER`
- `PARTNER`
- `ADMIN`
- `SUPER_ADMIN`

Requested production matrix:

| Area | USER | PARTNER_OWNER | PARTNER_MANAGER | PARTNER_OPERATOR | SUPER_ADMIN | MODERATOR | FINANCE_ADMIN | CONTENT_ADMIN | SUPPORT_ADMIN | Current status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Public catalog/hotels/buses | Read | Read | Read | Read | Read | Read | Read | Read | Read | Public read OK |
| User profile `/me` | Own only | No | No | No | Admin read only | No | No | No | Support limited | `USER` only, but dev auth spoofable |
| User booking detail | Own only | Tenant booking only | Tenant booking only | Tenant booking only | All | No | Payment view only | No | Support ticket only | Missing ownership |
| Partner hotels/rooms | No | Own org | Own org | Limited ops | All | Review/publish only | No | No | No | Missing object tenant checks |
| Partner bookings/status | No | Own org | Own org | Check-in/out only | All | No | Payment/refund only | No | Support context only | Missing object tenant checks/status matrix |
| Partner finance/withdrawals | No | Own org | Finance delegated | No | All | No | All finance | No | No | Missing partner sub-roles |
| Admin partner approval | No | No | No | No | All | Yes | No | No | No | Any `ADMIN` allowed |
| Admin finance/refund/withdrawal | No | No | No | No | All | No | Yes | No | No | Any `ADMIN` allowed |
| Admin CMS | No | No | No | No | All | No | No | Yes | No | Any `ADMIN` allowed |
| Admin support | No | No | No | No | All | No | No | No | Yes | Any `ADMIN` allowed |
| Admin users/roles/settings | No | No | No | No | All | No | No | No | No | Any `ADMIN` allowed |
| Exports | Own only | Own org | Own org | Limited | All | Role-based | Finance only | Content only | Support only | Missing owner checks |

Expected unauthorized responses:

- Anonymous protected endpoint: `401 Unauthorized`.
- Authenticated but wrong role: `403 Forbidden`.
- Authenticated but wrong owner/tenant: prefer `404 Not Found` for opaque user/partner objects, or `403 Forbidden` for admin-visible objects.

## 7. Booking and Payment Invariants

Required invariants before production:

- Client never controls `subtotal`, `discountAmount`, `totalAmount`, `commissionAmount`, `partnerPayable` or provider fees.
- A booking cannot become `confirmed` without valid payment or partner approval where required.
- Booking status transitions are centralized and finite-state.
- Cancelled/expired/completed bookings cannot be reconfirmed casually.
- Hotel inventory cannot go negative.
- A bus seat can have at most one active hold/booking.
- A payment intent is unique/idempotent per booking/provider flow.
- Payment webhook must verify signature, event identity, amount, currency and target booking.
- Duplicate webhooks do not change money twice.
- Refunds and withdrawals are idempotent and cannot exceed paid/available balance.
- Partner balances are derived from immutable ledger entries.
- Cash payment commission debt is recorded in ledger.
- Promo/bonus cannot create negative totals and must be concurrency-safe.

Current status:

- Some server-side amount calculation exists for booking creation: `apps/backend/src/bookings/bookings.service.ts:35-45`, `apps/backend/src/bookings/bookings.service.ts:96-105`.
- No transaction, inventory lock, webhook signature, ledger immutability or full status machine is implemented yet.

## 8. Test Results

| Command | Result | Exit code | Notes |
| --- | --- | --- | --- |
| `npm run prisma:validate -w @agoda/backend` | Passed | 0 | Prisma schema valid. |
| `npm run build:types` | Passed | 0 | `@agoda/types` TypeScript build passed. |
| `npm run build:backend` | Passed | 0 | Nest build passed. |
| `npm run test:backend` | Passed | 0 | 1 unit test passed. |
| `npm run test:e2e -w @agoda/backend` | Failed in sandbox | 1 | First run failed with `listen EPERM: operation not permitted 127.0.0.1`; sandbox limitation. |
| `npm run test:e2e -w @agoda/backend` | Passed with local port permission | 0 | Before security PoC tests: 1 suite, 1 test passed. |
| `npm run test:e2e -w @agoda/backend` | Passed with security PoC tests | 0 | After adding security PoC tests: 2 suites, 6 tests passed. |
| `npm run lint -w @agoda/backend` | Skipped | N/A | Script uses `eslint --fix`; audit instruction says do not alter application source during audit. |
| Dependency audit | Not run | N/A | External registry/network audit not used; treat as limitation. |

Security tests created:

- `apps/backend/test/security/security-findings.e2e-spec.ts`

Covered PoC groups:

- Authorization role spoofing.
- JWT/mock token forgery.
- User booking IDOR.
- Payment webhook missing signature.
- Partner API invalid key fallback.

Not yet covered by automated tests:

- Refresh token replay.
- OTP replay/rate limiting.
- Mass assignment.
- Hotel/bus inventory concurrency.
- Promo/bonus concurrency.
- Refund/withdrawal idempotency.
- WebSocket room authorization.
- File upload validation.
- Rate limiting.

## 9. Prioritized Remediation Plan

Immediate - release blockers:

1. Replace header/mock authentication with real JWT guard.
2. Disable dev headers, demo OTP/password/2FA and mock OAuth outside local test mode.
3. Enforce object ownership and tenant checks for every ID-based endpoint.
4. Implement signed/idempotent payment webhooks.
5. Replace in-memory booking/payment state changes with Prisma transactions.

Within 7 days:

1. Add granular admin permissions and route-level permission guard.
2. Fix partner API key storage/validation: hash full keys, reject unknown keys, enforce scopes.
3. Lock down CORS and disable Swagger by default in production.
4. Implement upload validation and private document storage.
5. Add CSRF strategy for cookie-authenticated state-changing endpoints.

Within 30 days:

1. Implement refresh token rotation, token family invalidation and logout-all.
2. Add OTP rate limiting by phone, IP, purpose, challenge/session and normalized phone.
3. Implement booking status state machine and audit logs for all sensitive actions.
4. Add immutable ledger, withdrawal/refund idempotency and decimal-safe accounting.
5. Add WebSocket gateway security and BullMQ idempotent processors before enabling them.

Hardening backlog:

1. Add non-mutating lint scripts and update CI to use them.
2. Add dependency audit, secret scan, SAST, container scan and SBOM.
3. Harden Docker runtime as non-root with minimal permissions.
4. Add privacy masking for admin/partner views and exports.
5. Add production-grade logging redaction and audit immutability.

## 10. Final Verdict

**FAIL - RELEASE BLOCKED**

Reason:

- Authentication can be bypassed by client-controlled headers and forged mock tokens.
- Admin and payment flows contain confirmed critical vulnerabilities.
- Tenant/object ownership checks are incomplete across booking, partner, support, refund, notification and export flows.
- Payment webhook integrity and financial idempotency are not implemented.

The codebase is suitable for local demo/MVP development only. It should not be exposed to the public internet or real payment/user data until the Immediate release blockers are fixed and regression tests are converted from PoC behavior to secure expected behavior.
