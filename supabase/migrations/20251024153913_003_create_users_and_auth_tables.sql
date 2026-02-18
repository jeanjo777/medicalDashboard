/*
  # Create secure authentication tables

  1. New Tables
    - `medical_users`
      - `id` (uuid, primary key) - Unique identifier for user
      - `email` (text, unique) - Email address
      - `username` (text, unique) - Username for login
      - `password_hash` (text) - Hashed password (bcrypt)
      - `role` (text) - User role (default: 'doctor')
      - `is_active` (boolean) - Account status
      - `created_at` (timestamptz) - Account creation date
      - `updated_at` (timestamptz) - Last update

    - `login_attempts`
      - `id` (uuid, primary key) - Unique identifier
      - `email` (text) - Email used for login attempt
      - `ip_address` (text) - IP address of attempt
      - `success` (boolean) - Whether attempt was successful
      - `created_at` (timestamptz) - Timestamp of attempt

  2. Security
    - Enable RLS on both tables
    - No public access - managed server-side only
    - Track failed login attempts for security
    - Passwords are hashed using bcrypt

  3. Notes
    - This table stores medical staff credentials
    - Login attempts are logged for security monitoring
    - Use Edge Functions for all authentication operations
*/

CREATE TABLE IF NOT EXISTS medical_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text DEFAULT 'doctor',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address text,
  success boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE medical_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_medical_users_email ON medical_users(email);
CREATE INDEX IF NOT EXISTS idx_medical_users_username ON medical_users(username);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_created_at ON login_attempts(created_at);

CREATE POLICY "Service role can manage medical users"
  ON medical_users
  FOR ALL
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Service role can manage login attempts"
  ON login_attempts
  FOR ALL
  USING (false)
  WITH CHECK (false);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM medical_users WHERE email = 'simpliceake1975@gmail.com') THEN
    INSERT INTO medical_users (email, username, password_hash, role)
    VALUES (
      'simpliceake1975@gmail.com',
      'medecin',
      '$2a$10$YourHashedPasswordHere',
      'doctor'
    );
  END IF;
END $$;