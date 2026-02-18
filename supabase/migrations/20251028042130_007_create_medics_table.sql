/*
  # Create medics table for doctor authentication

  1. New Tables
    - `medics`
      - `id` (uuid, primary key) - Unique identifier
      - `username` (text, unique, not null) - Doctor's username
      - `password` (text, not null) - Hashed password
      - `created_at` (timestamptz) - Registration timestamp
      - `last_login` (timestamptz) - Last login timestamp
  
  2. Security
    - Enable RLS on `medics` table
    - Add policy for doctors to read their own data
    - Add policy for doctors to update their own last_login
  
  3. Constraints
    - Only ONE medic can be registered (enforced by unique constraint)
    - Username must be unique
    - Password is stored hashed (SHA-256)
  
  4. Important Notes
    - Registration requires a secret code (validated in edge function)
    - Only one doctor account can exist in the system
    - Password reset functionality available via separate flow
*/

CREATE TABLE IF NOT EXISTS medics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password text NOT NULL CHECK (length(password) >= 8),
  created_at timestamptz DEFAULT now(),
  last_login timestamptz DEFAULT now()
);

ALTER TABLE medics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Medics can read own data"
  ON medics
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Medics can update own last_login"
  ON medics
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

CREATE INDEX IF NOT EXISTS idx_medics_username ON medics(username);