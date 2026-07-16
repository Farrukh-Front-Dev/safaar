-- Listing data must be persisted by the raw pg service as well as Prisma.
ALTER TABLE hotel_translations
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE hotel_translations
  ADD COLUMN IF NOT EXISTS short_description TEXT;

ALTER TABLE hotels
  ADD COLUMN IF NOT EXISTS cancellation_policy_code VARCHAR(32) NOT NULL DEFAULT 'MODERATE',
  ADD COLUMN IF NOT EXISTS smoking_allowed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pets_allowed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS children_allowed BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS extra_fees JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS rules_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

ALTER TABLE media_files
  ADD COLUMN IF NOT EXISTS caption TEXT,
  ADD COLUMN IF NOT EXISTS category VARCHAR(32),
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_cover BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS hotels_status_updated_at_idx
  ON hotels (status, updated_at DESC);

CREATE INDEX IF NOT EXISTS media_files_hotel_order_idx
  ON media_files (owner_type, owner_id, sort_order, created_at);
