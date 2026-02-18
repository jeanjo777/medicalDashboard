/*
  # Create password reset tokens table

  1. New Tables
    - `password_reset_tokens`
      - `id` (uuid, primary key) - Unique identifier for each token
      - `email` (text) - Email address for password reset
      - `token` (text, unique) - Secure token for password reset
      - `expires_at` (timestamptz) - Expiration time for the token
      - `used` (boolean) - Flag to track if token has been used
      - `created_at` (timestamptz) - Timestamp when token was created

  2. Security
    - Enable RLS on `password_reset_tokens` table
    - No public access - tokens are managed server-side only
    - Tokens expire after 1 hour
    - Tokens can only be used once

  3. Notes
    - This table stores temporary password reset tokens
    - Tokens are automatically cleaned up after expiration
    - Edge Functions will manage token generation and validation
*/

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '1 hour'),
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

CREATE POLICY "Service role can manage password reset tokens"
  ON password_reset_tokens
  FOR ALL
  USING (false)
  WITH CHECK (false);