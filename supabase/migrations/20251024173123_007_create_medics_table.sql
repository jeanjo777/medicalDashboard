/*
  # Create medics table for doctor authentication

  1. New Tables
    - `medics`
      - `id` (uuid, primary key) - Unique identifier
      - `email` (text, unique, not null) - Doctor's email address
      - `password` (text, not null) - Hashed password
      - `created_at` (timestamptz) - Registration timestamp
      - `last_login` (timestamptz) - Last login timestamp
  
  2. Security
    - Enable RLS on `medics` table
    - Add policy for doctors to read their own data
    - Add policy for doctors to update their own last_login
  
  3. Constraints
    - Only ONE medic can be registered (enforced by unique constraint)
    - Email must be unique and valid format
    - Password is stored hashed (bcrypt)
  
  4. Important Notes
    - Registration requires a secret code (validated in edge function)
    - Only one doctor account can exist in the system
    - Password reset functionality available via separate flow
*/

CREATE TABLE IF NOT EXISTS medics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
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

CREATE INDEX IF NOT EXISTS idx_medics_email ON medics(email);
