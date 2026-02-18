/*
  Medical Dashboard Tables
  Creates: patients, medics, consultations, activity_log
*/

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  first_name text DEFAULT '',
  last_name text DEFAULT '',
  date_of_birth date,
  phone text DEFAULT '',
  address text,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  primary_pathology text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'in_treatment', 'recovered', 'inactive')),
  "riskScore" integer DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create medics table
CREATE TABLE IF NOT EXISTS medics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz DEFAULT now()
);

-- Create consultations table
CREATE TABLE IF NOT EXISTS consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  symptoms text,
  duration text,
  intensity text CHECK (intensity IN ('low', 'medium', 'high')),
  other_signs text,
  ai_response text,
  diagnosis_summary text,
  recommendations text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'reviewed')),
  follow_up_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create activity_log table
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  user_name text NOT NULL,
  user_initials text NOT NULL DEFAULT 'U',
  action text NOT NULL,
  entity_type text NOT NULL CHECK (entity_type IN ('patient', 'appointment', 'consultation', 'other')),
  entity_id uuid,
  entity_name text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medics ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Patients policies
DO $$ BEGIN
  CREATE POLICY "patients_select_all" ON patients FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "patients_insert_all" ON patients FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "patients_update_all" ON patients FOR UPDATE USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "patients_delete_all" ON patients FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Medics policies
DO $$ BEGIN
  CREATE POLICY "medics_select_all" ON medics FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "medics_insert_all" ON medics FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "medics_update_all" ON medics FOR UPDATE USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Consultations policies
DO $$ BEGIN
  CREATE POLICY "consultations_select_all" ON consultations FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "consultations_insert_all" ON consultations FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "consultations_update_all" ON consultations FOR UPDATE USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Activity log policies
DO $$ BEGIN
  CREATE POLICY "activity_log_select_all" ON activity_log FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "activity_log_insert_all" ON activity_log FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_patients_last_name ON patients(last_name);
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_created_at ON consultations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_medics_username ON medics(username);

-- Add columns to appointments if needed
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_id uuid;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS medic_id uuid;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_name text;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_email text;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_phone text;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS appointment_date date;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS appointment_time time;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS duration integer DEFAULT 30;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS motif text;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS type_consultation text DEFAULT 'Consultation';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS cancelled_reason text;

-- Insert default medic user
INSERT INTO medics (username, password)
VALUES ('medecin', 'password123')
ON CONFLICT (username) DO NOTHING;

-- Insert sample patients
INSERT INTO patients (first_name, last_name, email, phone, status, "riskScore", primary_pathology, date_of_birth)
VALUES
  ('Jean', 'Martin', 'jean.martin@email.com', '0612345678', 'active', 45, 'Diabète type 2', '1965-03-15'),
  ('Marie', 'Dubois', 'marie.dubois@email.com', '0623456789', 'in_treatment', 78, 'Hypertension', '1958-07-22'),
  ('Pierre', 'Bernard', 'pierre.bernard@email.com', '0634567890', 'active', 32, NULL, '1980-11-08'),
  ('Sophie', 'Petit', 'sophie.petit@email.com', '0645678901', 'recovered', 15, 'Grippe', '1992-04-30'),
  ('Luc', 'Robert', 'luc.robert@email.com', '0656789012', 'active', 88, 'Insuffisance cardiaque', '1950-01-12')
ON CONFLICT (email) DO NOTHING;

-- Insert sample activity
INSERT INTO activity_log (user_name, user_initials, action, entity_type, entity_name)
VALUES
  ('Dr. Dupont', 'DD', 'Consultation terminée', 'patient', 'Marie Martin'),
  ('Dr. Dupont', 'DD', 'Rendez-vous planifié', 'appointment', 'Pierre Durand'),
  ('Dr. Dupont', 'DD', 'Dossier patient mis à jour', 'patient', 'Sophie Bernard');
