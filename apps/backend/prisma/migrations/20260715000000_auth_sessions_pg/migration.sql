-- AlterTable: Add columns needed by the PostgreSQL-backed session store.
-- The auth_sessions table already exists (created by an earlier migration).
-- This migration adds: role, roles, organization_id, refresh_expires_at
-- and relaxes NOT NULL on user_id / expires_at (not used by the new store).

ALTER TABLE "auth_sessions"
  ADD COLUMN IF NOT EXISTS "role" VARCHAR(64) NOT NULL DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS "roles" TEXT[] NOT NULL DEFAULT ARRAY['user']::TEXT[],
  ADD COLUMN IF NOT EXISTS "organization_id" TEXT,
  ADD COLUMN IF NOT EXISTS "refresh_expires_at" BIGINT;

ALTER TABLE "auth_sessions"
  ALTER COLUMN "user_id" DROP NOT NULL,
  ALTER COLUMN "expires_at" DROP NOT NULL;
