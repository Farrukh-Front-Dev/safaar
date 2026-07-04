# UzBron Backend Security Remediation

Date: 2026-07-03
Branch: `security/backend-production-hardening`

## Fixed In Code

- Real HS256 JWT access/refresh tokens replaced forgeable `mock-access.*` tokens.
- Refresh token rotation was added. Reusing an old refresh token revokes the session family.
- Dev header auth is disabled by default in `buildActorFromHeaders`; it only works when `ENABLE_DEMO_AUTH=true`.
- OTP is now random, hashed, expiring, attempt-limited, and rate-limited in the local store.
- Admin/partner password login uses Argon2id hashes from the user stores.
- Admin TOTP setup/confirm/disable helpers were added with encrypted TOTP secrets and recovery code hashes.
- Production env validation now requires strong secrets and rejects demo/mock/in-memory flags.
- Production CORS requires an explicit allowlist and rejects `*`.
- In-memory fallback is rejected when `ENABLE_IN_MEMORY_DATA=false`.
- Booking, payment, refund, upload, notification, export, support, review, and partner ID operations now enforce owner/tenant scope.
- Payment webhooks now require HMAC signatures in mock mode, validate amount/currency, and store idempotency events.
- Partner API keys are generated once, stored as HMAC hashes, and no longer fall back to the demo organization.
- Granular admin permission decorators were added for sensitive write operations.
- Upload metadata validation now enforces MIME allowlists, size limits, safe filenames, and owner-scoped deletion.
- Additive Prisma migration was added for OTP challenges, admin recovery codes, refresh JTI fields, payment payload hashes, and idempotency records.
- Security regression tests now assert the hardened behavior instead of reproducing the vulnerabilities.

## Still Partial By Design

- The service layer still uses `InMemoryDbService` in many modules. The schema and migration are ready, but a full Prisma repository refactor is still required for durable production transactions.
- Hotel inventory and bus seat reservation logic is guarded in memory only. True race-free booking requires Prisma `$transaction` with row-level locking or equivalent atomic updates.
- Real Click/Payme/Uzcard/Humo webhook algorithms are not guessed. Non-mock provider mode fails closed until official signature verification is implemented.
- SMS, email, OAuth, storage, push, and payment providers are not called in tests or local code. They must be wired with official SDK/API contracts before production enablement.
- TOTP persistence is implemented in local admin records and Prisma schema, but DB-backed admin 2FA repository methods still need to be connected.

## Verification

```bash
npm run prisma:validate -w @agoda/backend
npm run build:types
npm run build:backend
npm run test:backend
npm run test:e2e -w @agoda/backend
npm run lint:check -w @agoda/backend
```

All commands above passed locally after the remediation patch.
