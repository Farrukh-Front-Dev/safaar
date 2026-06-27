# UzBron Backend

NestJS API for the UzBron platform. The API serves user, partner, and admin
clients from one modular backend.

## Run

```bash
npm run dev:backend
```

Default local API prefix:

```text
http://localhost:4000/v1
```

Override with:

```bash
API_PREFIX=v1 PORT=4000 npm run start:dev -w @agoda/backend
```

## Development Auth

JWT/Redis integration is intentionally mocked for the current backend MVP.
Protected endpoints accept temporary headers:

```text
x-user-role: USER | PARTNER | ADMIN | SUPER_ADMIN
x-user-id: demo-user-id
x-organization-id: demo-partner-org-id
x-request-id: any-uuid
```

Demo auth values:

```text
OTP code: 111111
partner/admin password: password
admin 2FA code: 000000
```

## Main Endpoint Groups

- `POST /v1/auth/user/send-otp`
- `POST /v1/auth/user/verify-otp`
- `GET /v1/catalog/regions`
- `GET /v1/hotels`
- `POST /v1/hotels/:id/quote`
- `GET /v1/bus-trips`
- `POST /v1/bookings/hotel`
- `POST /v1/bookings/bus`
- `POST /v1/payments/:bookingId/create`
- `POST /v1/refunds`
- `POST /v1/support/tickets`
- `GET /v1/partner/profile`
- `GET /v1/admin/dashboard/overview`
- `GET /v1/exports/:id`
- `POST /v1/uploads/presign`

## Checks

```bash
npm run build:types
npm run prisma:validate -w @agoda/backend
npm run lint -w @agoda/backend
npm run build:backend
npm run test:backend
npm run test:e2e -w @agoda/backend
```

`test:e2e` opens a local test port; in restricted sandboxes it may need elevated
permission.

## Swagger

When `SWAGGER_ENABLED=true`, API docs are available at:

```text
http://localhost:4000/v1/docs
```

## Database

Prisma 7 schema lives in:

```text
apps/backend/prisma/schema.prisma
```

Useful commands:

```bash
npm run prisma:validate -w @agoda/backend
npm run prisma:generate -w @agoda/backend
npm run prisma:migrate -w @agoda/backend
npm run prisma:deploy -w @agoda/backend
```

## Docker

Backend-only local stack:

```bash
docker compose -f docker-compose.backend.yml up --build
```

This starts API, PostgreSQL, and Redis.

## Current Implementation Notes

The code now has the TZ API surface, DTO validation, Swagger setup, security
headers, rate limiting, Prisma schema, Docker Compose, CI, and provider adapter
contracts. The remaining production work is to replace the current in-memory
services with Prisma repositories and connect real external credentials for
Click, Payme, Uzcard, Humo, SMS, email, push, and object storage.
