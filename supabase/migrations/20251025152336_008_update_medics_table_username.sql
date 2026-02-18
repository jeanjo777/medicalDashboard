/*
  # Update medics table to use username instead of email

  1. Changes
    - Drop the email column from medics table
    - Add username column (text, unique, not null)
    - Update indexes to use username instead of email
  
  2. Important Notes
    - This migration removes the email column
    - Username will be used for authentication
    - Username must be unique
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'medics' AND column_name = 'email'
  ) THEN
    ALTER TABLE medics DROP COLUMN email;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'medics' AND column_name = 'username'
  ) THEN
    ALTER TABLE medics ADD COLUMN username text UNIQUE NOT NULL;
  END IF;
END $$;

DROP INDEX IF EXISTS idx_medics_email;
CREATE INDEX IF NOT EXISTS idx_medics_username ON medics(username);
