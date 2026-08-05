-- SAGE — password reset tokens
-- One-time, expiring tokens for the forgot-password / reset-password flow.
-- Only the sha256 hash is stored, never the raw token.

CREATE TABLE password_reset_tokens (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id),
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at    timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX password_reset_tokens_user_id_idx ON password_reset_tokens (user_id);
CREATE INDEX password_reset_tokens_token_hash_idx ON password_reset_tokens (token_hash);
