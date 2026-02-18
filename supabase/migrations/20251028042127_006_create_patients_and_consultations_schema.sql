/*
  # Create patients and consultations schema

  1. New Tables
    - `patients`
      - `id` (uuid, primary key) - Unique patient identifier
      - `email` (text, unique) - Patient email
      - `name` (text) - Patient full name
      - `age` (integer) - Patient age
      - `gender` (text) - Patient gender (male, female, other)
      - `profile_pic` (text) - URL to profile picture
      - `registered_at` (timestamptz) - Registration date
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

    - `consultations`
      - `id` (uuid, primary key) - Unique consultation identifier
      - `patient_id` (uuid, foreign key) - Reference to patient
      - `symptoms` (text) - Symptoms description
      - `duration` (text) - How long symptoms have been present
      - `intensity` (text) - Intensity level (low, medium, high)
      - `other_signs` (text) - Additional signs or symptoms
      - `ai_response` (text) - AI analysis response
      - `diagnosis_summary` (text) - Summary of diagnosis
      - `recommendations` (text) - AI recommendations
      - `status` (text) - Status (pending, completed, reviewed)
      - `created_at` (timestamptz) - Consultation timestamp
      - `updated_at` (timestamptz) - Update timestamp

    - `consultation_messages`
      - `id` (uuid, primary key) - Message identifier
      - `consultation_id` (uuid, foreign key) - Reference to consultation
      - `sender` (text) - Sender type (user, ai)
      - `message` (text) - Message content
      - `created_at` (timestamptz) - Message timestamp

  2. Security
    - Enable RLS on all tables
    - Patients can only access their own data
    - Service role can manage all data
    - Secure consultation history access

  3. Indexes
    - Index on patient email for faster lookups
    - Index on consultation patient_id for query performance
    - Index on consultation created_at for sorting

  4. Notes
    - All timestamps in UTC
    - Foreign keys ensure data integrity
    - Status field allows consultation workflow tracking
    - Messages table enables chat history
*/

CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  age integer,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  profile_pic text,
  registered_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own data"
  ON patients
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Service role can manage patients"
  ON patients
  FOR ALL
  USING (false)
  WITH CHECK (false);

CREATE TABLE IF NOT EXISTS consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  symptoms text NOT NULL,
  duration text,
  intensity text CHECK (intensity IN ('low', 'medium', 'high')),
  other_signs text,
  ai_response text,
  diagnosis_summary text,
  recommendations text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'reviewed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_created_at ON consultations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);

ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own consultations"
  ON consultations
  FOR SELECT
  TO authenticated
  USING (patient_id::text = auth.uid()::text);

CREATE POLICY "Patients can create own consultations"
  ON consultations
  FOR INSERT
  TO authenticated
  WITH CHECK (patient_id::text = auth.uid()::text);

CREATE POLICY "Service role can manage consultations"
  ON consultations
  FOR ALL
  USING (false)
  WITH CHECK (false);

CREATE TABLE IF NOT EXISTS consultation_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id uuid NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  sender text NOT NULL CHECK (sender IN ('user', 'ai')),
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consultation_messages_consultation_id ON consultation_messages(consultation_id);
CREATE INDEX IF NOT EXISTS idx_consultation_messages_created_at ON consultation_messages(created_at);

ALTER TABLE consultation_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages from their consultations"
  ON consultation_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM consultations
      WHERE consultations.id = consultation_messages.consultation_id
      AND consultations.patient_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can create messages in their consultations"
  ON consultation_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM consultations
      WHERE consultations.id = consultation_messages.consultation_id
      AND consultations.patient_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Service role can manage consultation messages"
  ON consultation_messages
  FOR ALL
  USING (false)
  WITH CHECK (false);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultations_updated_at
  BEFORE UPDATE ON consultations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();