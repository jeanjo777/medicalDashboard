-- MediCare Pro - Consolidated Database Schema
-- Generated from 40 Supabase migrations - final resolved state

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- POSTGREST ROLES (Supabase-compatible)
-- ============================================================

DO $$ BEGIN CREATE ROLE anon NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE ROLE authenticated NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE ROLE service_role NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT anon TO medicare;
GRANT authenticated TO medicare;
GRANT service_role TO medicare;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;

-- ============================================================
-- UTILITY FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_appointments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_reminders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_date_series(
    start_date date,
    end_date date,
    step interval DEFAULT '1 day'
)
RETURNS SETOF date AS $$
BEGIN
    RETURN QUERY SELECT d::date FROM generate_series(start_date, end_date, step) AS d;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================
-- CORE TABLES
-- ============================================================

-- Patients
CREATE TABLE IF NOT EXISTS patients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE,
    name text,
    first_name text DEFAULT '',
    last_name text DEFAULT '',
    prenom text,
    date_of_birth date,
    date_naissance date,
    age integer,
    gender text CHECK (gender IN ('male', 'female', 'other', 'M', 'F')),
    phone text DEFAULT '',
    address text,
    blood_type text,
    allergies text,
    medical_history text,
    emergency_contact text,
    profile_pic text,
    primary_pathology text,
    status text DEFAULT 'active' CHECK (status IN ('active', 'in_treatment', 'recovered', 'inactive', 'actif', 'inactif', 'archived')),
    "riskScore" integer DEFAULT 0,
    risk_score integer DEFAULT 0,
    notes text,
    last_visit date,
    visit_type varchar(50),
    filiale varchar(50),
    test_typhoide varchar(20),
    test_dengue varchar(20),
    urines_albumine varchar(50),
    urines_sucre varchar(50),
    glycemie numeric,
    temperature numeric,
    poids numeric,
    taille integer,
    tension_arterielle varchar(20),
    pouls integer,
    test_palu varchar(20),
    registered_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_last_name ON patients(last_name);
CREATE INDEX IF NOT EXISTS idx_patients_date_of_birth ON patients(date_of_birth);
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients(created_at);

CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Medics (doctors/practitioners)
CREATE TABLE IF NOT EXISTS medics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    username text UNIQUE NOT NULL,
    email text UNIQUE,
    password text,
    password_hash text,
    nom text DEFAULT '',
    prenom text DEFAULT '',
    specialite text DEFAULT 'Médecin généraliste',
    telephone text DEFAULT '',
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

CREATE TRIGGER update_medics_updated_at
    BEFORE UPDATE ON medics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_name text NOT NULL,
    patient_email text,
    patient_phone text,
    appointment_date date,
    appointment_time text,
    message text,
    status text DEFAULT 'a_venir',
    patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
    medic_id uuid REFERENCES medics(id) ON DELETE SET NULL,
    motif text DEFAULT 'Consultation générale',
    type_consultation text DEFAULT 'Consultation',
    notes text,
    duration integer DEFAULT 30,
    cancelled_at timestamptz,
    cancelled_reason text DEFAULT '',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_medic_id ON appointments(medic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date_status ON appointments(appointment_date, status);

CREATE TRIGGER trigger_update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_appointments_updated_at();

-- Consultations (AI-driven)
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
    urgency_level text CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')),
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'ai_analyzed', 'doctor_reviewing', 'medic_reviewing', 'completed', 'reviewed', 'patient_notified', 'follow_up_scheduled')),
    reviewed_by uuid REFERENCES medics(id),
    reviewed_at timestamptz,
    medic_notes text,
    follow_up_appointment_id uuid,
    follow_up_date date,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_medic_id ON consultations(medic_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_urgency ON consultations(urgency_level);
CREATE INDEX IF NOT EXISTS idx_consultations_created_at ON consultations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consultations_reviewed_by ON consultations(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_consultations_patient_status ON consultations(patient_id, status, created_at);

CREATE TRIGGER update_consultations_updated_at
    BEFORE UPDATE ON consultations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Consultation Messages (chat history)
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

-- Appointment Requests (public form)
CREATE TABLE IF NOT EXISTS appointment_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    prenom text NOT NULL,
    nom text NOT NULL,
    telephone text NOT NULL,
    email text NOT NULL,
    type_de_soin text DEFAULT 'Non spécifié',
    message text DEFAULT '',
    date_demande text NOT NULL,
    source text DEFAULT 'Site web - Formulaire de contact',
    statut text DEFAULT 'nouveau',
    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointment_requests_email ON appointment_requests(email);
CREATE INDEX IF NOT EXISTS idx_appointment_requests_statut ON appointment_requests(statut);
CREATE INDEX IF NOT EXISTS idx_appointment_requests_created ON appointment_requests(created_at DESC);

-- ============================================================
-- AUTH & SECURITY TABLES
-- ============================================================

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

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    user_type text CHECK (user_type IN ('medic', 'patient')),
    token text UNIQUE NOT NULL,
    email text,
    expires_at timestamptz NOT NULL,
    used boolean DEFAULT false,
    used_at timestamptz,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS password_reset_attempts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL,
    ip_address text,
    user_agent text,
    success boolean DEFAULT false,
    reason text,
    created_at timestamptz DEFAULT now()
);

-- ============================================================
-- NOTIFICATIONS & ACTIVITY
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    type text NOT NULL,
    priority text DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    title text NOT NULL,
    message text NOT NULL,
    data jsonb DEFAULT '{}',
    actions jsonb DEFAULT '[]',
    read boolean DEFAULT false,
    read_at timestamptz,
    expires_at timestamptz,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

CREATE TABLE IF NOT EXISTS activity_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES medics(id) ON DELETE SET NULL,
    user_type text CHECK (user_type IN ('medic', 'patient', 'system')),
    user_name text NOT NULL,
    user_initials text DEFAULT 'U',
    action text NOT NULL,
    entity_type text CHECK (entity_type IN ('patient', 'appointment', 'consultation', 'other')),
    entity_id uuid,
    entity_name text,
    metadata jsonb DEFAULT '{}',
    details jsonb DEFAULT '{}',
    ip_address text,
    user_agent text,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity_type ON activity_log(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity_id ON activity_log(entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON activity_log(action);

-- ============================================================
-- EMAILS
-- ============================================================

CREATE TABLE IF NOT EXISTS emails (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    to_email text NOT NULL,
    to_name text,
    subject text NOT NULL,
    body text NOT NULL,
    status text DEFAULT 'pending' CHECK (status IN ('sent', 'failed', 'pending')),
    resend_id text,
    template_used text,
    error_message text,
    sent_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS received_emails (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    from_email text NOT NULL,
    from_name text,
    to_email text NOT NULL,
    subject text,
    text_body text,
    html_body text,
    reply_to text,
    resend_id text,
    headers jsonb,
    attachments jsonb,
    is_read boolean NOT NULL DEFAULT false,
    received_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- REMINDERS
-- ============================================================

CREATE TABLE IF NOT EXISTS appointment_reminders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    reminder_type text CHECK (reminder_type IN ('email', 'sms', 'push', 'in_app')),
    scheduled_for timestamptz NOT NULL,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
    sent_at timestamptz,
    error_message text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER update_reminders_updated_at_trigger
    BEFORE UPDATE ON appointment_reminders
    FOR EACH ROW EXECUTE FUNCTION update_reminders_updated_at();

CREATE TABLE IF NOT EXISTS reminder_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    type text CHECK (type IN ('email', 'sms', 'in_app')),
    subject text,
    body text NOT NULL,
    variables jsonb,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- ANALYTICS
-- ============================================================

CREATE TABLE IF NOT EXISTS analytics_stats (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    date date NOT NULL,
    patients_consultes integer DEFAULT 0,
    patients_consultes_evolution numeric DEFAULT 0,
    rdv_honores integer DEFAULT 0,
    rdv_honores_evolution numeric DEFAULT 0,
    rdv_exceptionnels integer DEFAULT 0,
    rdv_exceptionnels_evolution numeric DEFAULT 0,
    cas_risque integer DEFAULT 0,
    cas_risque_evolution numeric DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analytics_departement (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    departement text NOT NULL,
    patients_count integer DEFAULT 0,
    croissance numeric DEFAULT 0,
    date date,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analytics_medecins (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    medecin_id uuid REFERENCES medics(id),
    medecin_name text,
    consultations integer DEFAULT 0,
    minutes_par_patient numeric DEFAULT 0,
    satisfaction numeric DEFAULT 0,
    date date,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analytics_flux_patients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    mois text NOT NULL,
    consultations integer DEFAULT 0,
    suivis integer DEFAULT 0,
    urgences integer DEFAULT 0,
    annee integer,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analytics_pathologies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    pathologie text NOT NULL,
    pourcentage numeric DEFAULT 0,
    count integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analytics_recuperation (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    semaine text NOT NULL,
    taux_reel numeric DEFAULT 0,
    objectif numeric DEFAULT 0,
    annee integer,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analytics_systemes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    systeme text NOT NULL,
    score numeric DEFAULT 0,
    date date,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analytics_alerts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type text NOT NULL,
    severity text CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    title text NOT NULL,
    description text,
    threshold_value numeric,
    current_value numeric,
    is_acknowledged boolean DEFAULT false,
    acknowledged_by uuid REFERENCES medics(id),
    created_at timestamptz DEFAULT now()
);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION create_notification(
    p_user_id uuid,
    p_type text,
    p_title text,
    p_message text,
    p_priority text DEFAULT 'medium',
    p_data jsonb DEFAULT '{}'
)
RETURNS uuid AS $$
DECLARE
    v_id uuid;
BEGIN
    INSERT INTO notifications (user_id, type, title, message, priority, data)
    VALUES (p_user_id, p_type, p_title, p_message, p_priority, p_data)
    RETURNING id INTO v_id;
    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION mark_notification_read(p_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE notifications SET read = true, read_at = now() WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE notifications SET read = true, read_at = now()
    WHERE user_id = p_user_id AND read = false;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_expired_notifications()
RETURNS void AS $$
BEGIN
    DELETE FROM notifications WHERE expires_at IS NOT NULL AND expires_at < now();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_activity(
    p_user_id uuid,
    p_user_type text,
    p_user_name text,
    p_action text,
    p_entity_type text DEFAULT NULL,
    p_entity_id uuid DEFAULT NULL,
    p_entity_name text DEFAULT NULL,
    p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid AS $$
DECLARE
    v_id uuid;
BEGIN
    INSERT INTO activity_log (user_id, user_type, user_name, action, entity_type, entity_id, entity_name, metadata)
    VALUES (p_user_id, p_user_type, p_user_name, p_action, p_entity_type, p_entity_id, p_entity_name, p_metadata)
    RETURNING id INTO v_id;
    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_consultation(p_id uuid)
RETURNS void AS $$
BEGIN
    DELETE FROM consultation_messages WHERE consultation_id = p_id;
    DELETE FROM consultations WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION notify_consultation_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO notifications (user_id, type, title, message, priority, data)
        SELECT
            NEW.medic_id,
            CASE
                WHEN NEW.urgency_level = 'critical' THEN 'urgent_consultation'
                ELSE 'consultation_reviewed'
            END,
            'Consultation status changed',
            'Consultation status changed to ' || NEW.status,
            CASE
                WHEN NEW.urgency_level = 'critical' THEN 'critical'
                WHEN NEW.urgency_level = 'high' THEN 'high'
                ELSE 'medium'
            END,
            jsonb_build_object('consultation_id', NEW.id, 'patient_id', NEW.patient_id, 'old_status', OLD.status, 'new_status', NEW.status)
        WHERE NEW.medic_id IS NOT NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER consultation_status_change_notification
    AFTER UPDATE ON consultations
    FOR EACH ROW EXECUTE FUNCTION notify_consultation_status_change();

CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM password_reset_tokens WHERE expires_at < now() OR used = true;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cleanup_old_reset_attempts()
RETURNS void AS $$
BEGIN
    DELETE FROM password_reset_attempts WHERE created_at < now() - interval '30 days';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cleanup_old_login_attempts()
RETURNS void AS $$
BEGIN
    DELETE FROM login_attempts WHERE created_at < now() - interval '30 days';
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SEED: Default admin medic
-- ============================================================

INSERT INTO medics (username, nom, prenom, specialite, password, password_hash, is_active)
VALUES (
    'medecin',
    'Admin',
    'MediCare',
    'Administrateur',
    'Medical@2026',
    '$2b$12$MXgIzLwNof8kkPkkL0apie.tEfl8/y7gPLXPwB47MHrHIUfKEGwhq',
    true
)
ON CONFLICT (username) DO NOTHING;

-- ============================================================
-- GRANT PERMISSIONS TO ROLES
-- ============================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Done
SELECT 'MediCare Pro database initialized successfully' AS status;
