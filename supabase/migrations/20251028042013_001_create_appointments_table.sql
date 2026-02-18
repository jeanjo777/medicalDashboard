/*
  # Create appointments table

  1. New Tables
    - `appointments`
      - `id` (uuid, primary key)
      - `patient_name` (text)
      - `patient_email` (text)
      - `patient_phone` (text)
      - `appointment_date` (date)
      - `appointment_time` (text)
      - `message` (text)
      - `status` (text) - pending, confirmed, cancelled
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `appointments` table
    - Add policies for service role access
*/

CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name text NOT NULL,
  patient_email text NOT NULL,
  patient_phone text NOT NULL,
  appointment_date date NOT NULL,
  appointment_time text NOT NULL,
  message text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage appointments"
  ON appointments
  FOR ALL
  USING (true)
  WITH CHECK (true);