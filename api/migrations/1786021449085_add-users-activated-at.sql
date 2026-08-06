-- SAGE — Phase 8 (admin module): distinguish "pending approval" from
-- "deactivated" accounts. Lecturer/admin signups register inactive with
-- activated_at NULL; the admin console's pending list = is_active=false AND
-- activated_at IS NULL. Admin activation stamps activated_at; deactivation
-- leaves the stamp so the account reads as "inactive", not "pending".

ALTER TABLE users ADD COLUMN activated_at timestamptz;

-- Existing active accounts were activated at creation.
UPDATE users SET activated_at = now() WHERE is_active = true AND activated_at IS NULL;
