ALTER TABLE hotels
  ADD COLUMN IF NOT EXISTS submitted_by UUID;

UPDATE hotels h
SET submitted_by = COALESCE(
  (
    SELECT pu.id
    FROM partner_users pu
    WHERE pu.organization_id = h.partner_organization_id
      AND pu.status = 'active'
      AND pu.deleted_at IS NULL
    ORDER BY pu.created_at ASC
    LIMIT 1
  ),
  h.partner_organization_id
)
WHERE h.submitted_at IS NOT NULL
  AND h.submitted_by IS NULL;

CREATE INDEX IF NOT EXISTS hotels_submitted_by_idx
  ON hotels (submitted_by)
  WHERE submitted_by IS NOT NULL;
