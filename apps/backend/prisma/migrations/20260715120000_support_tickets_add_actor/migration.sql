-- Add actor_type and actor_id to support_tickets so both USER and PARTNER
-- actors can create tickets.  user_id is made nullable because partner
-- tickets do not reference the users table.

ALTER TABLE "support_tickets"
  ADD COLUMN IF NOT EXISTS "actor_type" VARCHAR(32) NOT NULL DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS "actor_id" UUID;

ALTER TABLE "support_tickets"
  ALTER COLUMN "user_id" DROP NOT NULL;

-- Back-fill actor_id from existing user_id rows
UPDATE "support_tickets" SET "actor_id" = "user_id" WHERE "actor_id" IS NULL;

-- Index for fast actor-based lookups (used by partner list queries)
CREATE INDEX IF NOT EXISTS "support_tickets_actor_id_idx"
  ON "support_tickets"("actor_id");
