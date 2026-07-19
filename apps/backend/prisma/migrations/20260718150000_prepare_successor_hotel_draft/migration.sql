ALTER TABLE hotels
  ADD COLUMN IF NOT EXISTS next_draft_prepared_at TIMESTAMPTZ;
