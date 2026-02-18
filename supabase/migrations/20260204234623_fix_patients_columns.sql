/*
  Add missing columns to patients table
*/

-- Add missing columns to patients table
ALTER TABLE patients ADD COLUMN IF NOT EXISTS first_name text DEFAULT '';
ALTER TABLE patients ADD COLUMN IF NOT EXISTS last_name text DEFAULT '';
ALTER TABLE patients ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS phone text DEFAULT '';
ALTER TABLE patients ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
ALTER TABLE patients ADD COLUMN IF NOT EXISTS "riskScore" integer DEFAULT 0;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS primary_pathology text;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS notes text;

-- Add missing columns to medics table
ALTER TABLE medics ADD COLUMN IF NOT EXISTS password text;

-- Create activity_log table if not exists
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  user_name text NOT NULL DEFAULT 'Système',
  user_initials text NOT NULL DEFAULT 'S',
  action text NOT NULL,
  entity_type text NOT NULL DEFAULT 'other',
  entity_id uuid,
  entity_name text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "activity_log_public_read" ON activity_log FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "activity_log_public_insert" ON activity_log FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add columns to appointments table for dashboard compatibility
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_id uuid;
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

-- Insert sample medic user for login
INSERT INTO medics (username, password)
SELECT 'medecin', 'password123'
WHERE NOT EXISTS (SELECT 1 FROM medics WHERE username = 'medecin');

-- Insert sample patients (include name column for NOT NULL constraint)
INSERT INTO patients (name, first_name, last_name, email, phone, status, "riskScore", primary_pathology, date_of_birth)
SELECT 'Jean Martin', 'Jean', 'Martin', 'jean.martin@email.com', '0612345678', 'active', 45, 'Diabète type 2', '1965-03-15'::date
WHERE NOT EXISTS (SELECT 1 FROM patients WHERE email = 'jean.martin@email.com');

INSERT INTO patients (name, first_name, last_name, email, phone, status, "riskScore", primary_pathology, date_of_birth)
SELECT 'Marie Dubois', 'Marie', 'Dubois', 'marie.dubois@email.com', '0623456789', 'in_treatment', 78, 'Hypertension', '1958-07-22'::date
WHERE NOT EXISTS (SELECT 1 FROM patients WHERE email = 'marie.dubois@email.com');

INSERT INTO patients (name, first_name, last_name, email, phone, status, "riskScore", date_of_birth)
SELECT 'Pierre Bernard', 'Pierre', 'Bernard', 'pierre.bernard@email.com', '0634567890', 'active', 32, '1980-11-08'::date
WHERE NOT EXISTS (SELECT 1 FROM patients WHERE email = 'pierre.bernard@email.com');

INSERT INTO patients (name, first_name, last_name, email, phone, status, "riskScore", primary_pathology, date_of_birth)
SELECT 'Sophie Petit', 'Sophie', 'Petit', 'sophie.petit@email.com', '0645678901', 'recovered', 15, 'Grippe', '1992-04-30'::date
WHERE NOT EXISTS (SELECT 1 FROM patients WHERE email = 'sophie.petit@email.com');

INSERT INTO patients (name, first_name, last_name, email, phone, status, "riskScore", primary_pathology, date_of_birth)
SELECT 'Luc Robert', 'Luc', 'Robert', 'luc.robert@email.com', '0656789012', 'active', 88, 'Insuffisance cardiaque', '1950-01-12'::date
WHERE NOT EXISTS (SELECT 1 FROM patients WHERE email = 'luc.robert@email.com');

-- Insert sample activity log
INSERT INTO activity_log (user_name, user_initials, action, entity_type, entity_name)
VALUES
  ('Dr. Dupont', 'DD', 'Consultation terminée', 'patient', 'Marie Martin'),
  ('Dr. Dupont', 'DD', 'Rendez-vous planifié', 'appointment', 'Pierre Durand'),
  ('Dr. Dupont', 'DD', 'Dossier patient mis à jour', 'patient', 'Sophie Bernard');
