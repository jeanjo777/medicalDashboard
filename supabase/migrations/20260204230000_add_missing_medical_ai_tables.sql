/*
  # Add Missing Medical AI Tables

  This migration adds tables required for the Medical AI platform
  without affecting existing tables (profiles, appointments, doctors, etc.)

  New Tables:
  - patients (medical patient records)
  - medics (medical professionals with auth)
  - consultations (AI consultation records)
  - consultation_messages (chat history)
  - analytics_* (7 analytics tables)
  - activity_log (audit trail)
  - password_reset_tokens (password reset)
*/

-- ============================================
-- PATIENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  prenom text,
  date_naissance date,
  age integer,
  gender text CHECK (gender IN ('male', 'female', 'other', 'M', 'F')),
  phone text,
  address text,
  blood_type text,
  allergies text,
  medical_history text,
  emergency_contact text,
  profile_pic text,
  status text DEFAULT 'actif' CHECK (status IN ('actif', 'inactif', 'archived')),
  risk_score integer DEFAULT 0,
  last_visit date,
  registered_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients(created_at DESC);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public read access for patients" ON patients FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Public insert for patients" ON patients FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Public update for patients" ON patients FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- MEDICS TABLE (Medical Professionals)
-- ============================================
CREATE TABLE IF NOT EXISTS medics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  nom text NOT NULL,
  prenom text NOT NULL,
  specialite text,
  phone text,
  avatar_url text,
  is_active boolean DEFAULT true,
  last_login timestamptz,
  login_attempts integer DEFAULT 0,
  locked_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_medics_username ON medics(username);
CREATE INDEX IF NOT EXISTS idx_medics_email ON medics(email);

ALTER TABLE medics ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public read for medics" ON medics FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Public insert for medics" ON medics FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Public update for medics" ON medics FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- CONSULTATIONS TABLE (AI Consultations)
-- ============================================
CREATE TABLE IF NOT EXISTS consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  medic_id uuid REFERENCES medics(id),
  symptoms text NOT NULL,
  duration text,
  intensity text CHECK (intensity IN ('low', 'medium', 'high')),
  other_signs text,
  ai_response text,
  diagnosis_summary text,
  recommendations text,
  urgency_level text DEFAULT 'medium' CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'ai_analyzed', 'medic_reviewing', 'completed', 'reviewed', 'follow_up_scheduled')),
  reviewed_by uuid REFERENCES medics(id),
  reviewed_at timestamptz,
  medic_notes text,
  follow_up_appointment_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_medic_id ON consultations(medic_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_urgency ON consultations(urgency_level);
CREATE INDEX IF NOT EXISTS idx_consultations_created_at ON consultations(created_at DESC);

ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public access for consultations" ON consultations FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- CONSULTATION MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS consultation_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id uuid NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  sender text NOT NULL CHECK (sender IN ('user', 'ai', 'medic')),
  message text NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consultation_messages_consultation_id ON consultation_messages(consultation_id);
CREATE INDEX IF NOT EXISTS idx_consultation_messages_created_at ON consultation_messages(created_at);

ALTER TABLE consultation_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public access for consultation_messages" ON consultation_messages FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- PASSWORD RESET TOKENS
-- ============================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_type text NOT NULL CHECK (user_type IN ('medic', 'patient')),
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires ON password_reset_tokens(expires_at);

ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public access for password_reset_tokens" ON password_reset_tokens FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- ACTIVITY LOG
-- ============================================
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  user_type text CHECK (user_type IN ('medic', 'patient', 'system')),
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON activity_log(action);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public access for activity_log" ON activity_log FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- ANALYTICS TABLES
-- ============================================

-- Analytics Stats (Daily KPIs)
CREATE TABLE IF NOT EXISTS analytics_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  patients_consultes integer NOT NULL DEFAULT 0,
  patients_consultes_evolution decimal(5,2) DEFAULT 0,
  rdv_exceptionnels decimal(5,2) NOT NULL DEFAULT 0,
  rdv_exceptionnels_evolution decimal(5,2) DEFAULT 0,
  rdv_honores decimal(5,2) NOT NULL DEFAULT 0,
  rdv_honores_evolution decimal(5,2) DEFAULT 0,
  cas_risque integer NOT NULL DEFAULT 0,
  cas_risque_evolution integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_stats_date ON analytics_stats(date DESC);
ALTER TABLE analytics_stats ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Public read analytics_stats" ON analytics_stats FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Analytics by Department
CREATE TABLE IF NOT EXISTS analytics_departement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  departement text NOT NULL,
  patients_count integer NOT NULL DEFAULT 0,
  croissance decimal(5,2) DEFAULT 0,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_departement_date ON analytics_departement(date DESC);
ALTER TABLE analytics_departement ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Public read analytics_departement" ON analytics_departement FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Analytics by Doctor Performance
CREATE TABLE IF NOT EXISTS analytics_medecins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medecin_id uuid REFERENCES medics(id),
  medecin_name text NOT NULL,
  consultations integer NOT NULL DEFAULT 0,
  minutes_par_patient integer NOT NULL DEFAULT 0,
  satisfaction decimal(2,1) NOT NULL DEFAULT 0,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_medecins_date ON analytics_medecins(date DESC);
ALTER TABLE analytics_medecins ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Public read analytics_medecins" ON analytics_medecins FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Analytics Patient Flow
CREATE TABLE IF NOT EXISTS analytics_flux_patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mois text NOT NULL,
  consultations integer NOT NULL DEFAULT 0,
  suivis integer NOT NULL DEFAULT 0,
  urgences integer NOT NULL DEFAULT 0,
  annee integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_flux_patients_annee ON analytics_flux_patients(annee);
ALTER TABLE analytics_flux_patients ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Public read analytics_flux_patients" ON analytics_flux_patients FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Analytics Pathologies Distribution
CREATE TABLE IF NOT EXISTS analytics_pathologies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pathologie text NOT NULL,
  pourcentage decimal(5,2) NOT NULL DEFAULT 0,
  count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE analytics_pathologies ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Public read analytics_pathologies" ON analytics_pathologies FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Analytics Recovery Rate
CREATE TABLE IF NOT EXISTS analytics_recuperation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  semaine integer NOT NULL,
  taux_reel decimal(5,2) NOT NULL DEFAULT 0,
  objectif decimal(5,2) NOT NULL DEFAULT 75,
  annee integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_recuperation_annee ON analytics_recuperation(annee);
ALTER TABLE analytics_recuperation ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Public read analytics_recuperation" ON analytics_recuperation FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Analytics Health Systems Scores
CREATE TABLE IF NOT EXISTS analytics_systemes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  systeme text NOT NULL,
  score decimal(5,2) NOT NULL DEFAULT 0,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_systemes_date ON analytics_systemes(date DESC);
ALTER TABLE analytics_systemes ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Public read analytics_systemes" ON analytics_systemes FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Analytics Alerts (AI-generated)
CREATE TABLE IF NOT EXISTS analytics_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL,
  severity text CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title text NOT NULL,
  description text,
  threshold_value decimal,
  current_value decimal,
  is_acknowledged boolean DEFAULT false,
  acknowledged_by uuid REFERENCES medics(id),
  acknowledged_at timestamptz,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_analytics_alerts_severity ON analytics_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_analytics_alerts_created_at ON analytics_alerts(created_at DESC);
ALTER TABLE analytics_alerts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Public access analytics_alerts" ON analytics_alerts FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_medics_updated_at
    BEFORE UPDATE ON medics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_consultations_updated_at
    BEFORE UPDATE ON consultations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- SAMPLE DATA FOR TESTING
-- ============================================

-- Insert sample medic (password: Test123!)
INSERT INTO medics (username, email, password_hash, nom, prenom, specialite)
VALUES (
  'dr.martin',
  'dr.martin@medical-ai.com',
  '7c7ff8ec3c94a5e269d2a870dd21d06aaffc03f0a4ed2e1c5f7c0b7f51fc7d96', -- SHA-256 of 'Test123!'
  'Martin',
  'Jean',
  'Médecine Générale'
) ON CONFLICT (username) DO NOTHING;

-- Insert sample analytics data
INSERT INTO analytics_stats (date, patients_consultes, rdv_honores, cas_risque)
VALUES
  (CURRENT_DATE, 45, 87.5, 3),
  (CURRENT_DATE - INTERVAL '1 day', 42, 85.0, 4),
  (CURRENT_DATE - INTERVAL '2 days', 38, 90.0, 2)
ON CONFLICT DO NOTHING;

INSERT INTO analytics_flux_patients (mois, consultations, suivis, urgences, annee)
VALUES
  ('Jan', 320, 180, 45, 2026),
  ('Fév', 285, 165, 38, 2026),
  ('Mar', 410, 220, 52, 2026),
  ('Avr', 390, 195, 48, 2026)
ON CONFLICT DO NOTHING;

INSERT INTO analytics_pathologies (pathologie, pourcentage, count)
VALUES
  ('Maladies respiratoires', 28.5, 285),
  ('Maladies cardiovasculaires', 22.3, 223),
  ('Troubles digestifs', 18.7, 187),
  ('Douleurs musculaires', 15.2, 152),
  ('Autres', 15.3, 153)
ON CONFLICT DO NOTHING;
