/*
  # Add password reset attempts tracking

  1. New Tables
    - `password_reset_attempts`
      - `id` (uuid, primary key) - Unique identifier
      - `email` (text) - Email requesting reset
      - `ip_address` (text) - IP address of requester
      - `user_agent` (text) - Browser/device info
      - `success` (boolean) - Whether request was successful
      - `reason` (text) - Reason for failure if applicable
      - `created_at` (timestamptz) - Timestamp of attempt

  2. Modifications to existing tables
    - Update `password_reset_tokens` table to reduce expiration to 30 minutes

  3. Security
    - Enable RLS on `password_reset_attempts` table
    - Track all reset attempts for security monitoring
    - Implement rate limiting based on email and IP

  4. Notes
    - This table logs all password reset attempts
    - Used for security monitoring and rate limiting
    - Helps prevent abuse of password reset functionality
*/

CREATE TABLE IF NOT EXISTS password_reset_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address text,
  user_agent text,
  success boolean DEFAULT false,
  reason text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE password_reset_attempts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_password_reset_attempts_email ON password_reset_attempts(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_attempts_ip ON password_reset_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_password_reset_attempts_created_at ON password_reset_attempts(created_at);

CREATE POLICY "Service role can manage password reset attempts"
  ON password_reset_attempts
  FOR ALL
  USING (false)
  WITH CHECK (false);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'password_reset_tokens' AND column_name = 'expires_at'
  ) THEN
    ALTER TABLE password_reset_tokens 
    ALTER COLUMN expires_at SET DEFAULT (now() + interval '30 minutes');
  END IF;
END $$;