-- Browser blob URLs and mock CDN URLs are not durable listing media.
UPDATE media_files
SET deleted_at = COALESCE(deleted_at, CURRENT_TIMESTAMP)
WHERE owner_type = 'hotel'
  AND (
    url LIKE 'blob:%'
    OR url LIKE '%/mock/%'
    OR url LIKE '%/mock-presign/%'
  );
