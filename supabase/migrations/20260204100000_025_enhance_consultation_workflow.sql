-- Migration: Enhance consultation workflow and add reminders system
-- Date: 2026-02-04

-- ============================================
-- 1. ENHANCE CONSULTATIONS TABLE
-- ============================================

-- Add urgency_level column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'consultations' AND column_name = 'urgency_level'
  ) THEN
    ALTER TABLE consultations ADD COLUMN urgency_level text DEFAULT 'medium';
  END IF;
END $$;

-- Add reviewed_by column if not exists (references medic who reviewed)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'consultations' AND column_name = 'reviewed_by'
  ) THEN
    ALTER TABLE consultations ADD COLUMN reviewed_by uuid REFERENCES medics(id);
  END IF;
END $$;

-- Add reviewed_at column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'consultations' AND column_name = 'reviewed_at'
  ) THEN
    ALTER TABLE consultations ADD COLUMN reviewed_at timestamptz;
  END IF;
END $$;

-- Add constraint for urgency_level values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'consultations_urgency_level_check'
  ) THEN
    ALTER TABLE consultations ADD CONSTRAINT consultations_urgency_level_check
      CHECK (urgency_level IN ('low', 'medium', 'high', 'critical'));
  END IF;
END $$;

-- Update status constraint to include new states
ALTER TABLE consultations DROP CONSTRAINT IF EXISTS consultations_status_check;
ALTER TABLE consultations ADD CONSTRAINT consultations_status_check
  CHECK (status IN ('pending', 'ai_analyzed', 'doctor_reviewing', 'completed', 'reviewed', 'patient_notified'));

-- Create index on urgency_level for priority queries
CREATE INDEX IF NOT EXISTS idx_consultations_urgency_level
  ON consultations(urgency_level) WHERE urgency_level IN ('high', 'critical');

-- Create index on reviewed_by
CREATE INDEX IF NOT EXISTS idx_consultations_reviewed_by
  ON consultations(reviewed_by);


-- ============================================
-- 2. CREATE APPOINTMENT REMINDERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS appointment_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  reminder_type text NOT NULL CHECK (reminder_type IN ('email', 'sms', 'push', 'in_app')),
  scheduled_for timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  sent_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for reminders
CREATE INDEX IF NOT EXISTS idx_reminders_scheduled
  ON appointment_reminders(scheduled_for)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_reminders_appointment
  ON appointment_reminders(appointment_id);

CREATE INDEX IF NOT EXISTS idx_reminders_status
  ON appointment_reminders(status);

-- Enable RLS on reminders
ALTER TABLE appointment_reminders ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can manage all reminders
CREATE POLICY "Service role can manage reminders" ON appointment_reminders
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);


-- ============================================
-- 3. CREATE REMINDER TEMPLATES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS reminder_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  type text NOT NULL CHECK (type IN ('email', 'sms', 'in_app')),
  subject text,
  body text NOT NULL,
  variables jsonb DEFAULT '["patient_name", "appointment_date", "appointment_time", "medic_name"]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE reminder_templates ENABLE ROW LEVEL SECURITY;

-- Policy for service role
CREATE POLICY "Service role can manage templates" ON reminder_templates
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Insert default templates
INSERT INTO reminder_templates (name, type, subject, body) VALUES
  ('24h_email_reminder', 'email',
   'Rappel: Rendez-vous demain',
   'Bonjour {{patient_name}},\n\nNous vous rappelons votre rendez-vous prevu demain le {{appointment_date}} a {{appointment_time}} avec Dr. {{medic_name}}.\n\nCordialement,\nL''equipe medicale'),
  ('2h_sms_reminder', 'sms',
   NULL,
   'Rappel: RDV dans 2h le {{appointment_date}} a {{appointment_time}} avec Dr. {{medic_name}}'),
  ('24h_in_app_reminder', 'in_app',
   'Rappel de rendez-vous',
   'Votre rendez-vous avec Dr. {{medic_name}} est prevu demain a {{appointment_time}}.')
ON CONFLICT (name) DO NOTHING;


-- ============================================
-- 4. NOTIFICATION TRIGGERS FOR CONSULTATIONS
-- ============================================

-- Function to notify patient when consultation status changes
CREATE OR REPLACE FUNCTION notify_consultation_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify when consultation is reviewed
  IF NEW.status = 'reviewed' AND (OLD.status IS NULL OR OLD.status != 'reviewed') THEN
    INSERT INTO notifications (
      user_id,
      type,
      priority,
      title,
      message,
      data
    ) VALUES (
      NEW.patient_id,
      'consultation_reviewed',
      'high',
      'Consultation examinee',
      'Votre consultation a ete examinee par un medecin. Consultez les recommandations.',
      jsonb_build_object(
        'consultation_id', NEW.id,
        'reviewed_by', NEW.reviewed_by,
        'reviewed_at', NEW.reviewed_at
      )
    );
  END IF;

  -- Notify for critical urgency
  IF NEW.urgency_level = 'critical' AND (OLD.urgency_level IS NULL OR OLD.urgency_level != 'critical') THEN
    INSERT INTO notifications (
      user_id,
      type,
      priority,
      title,
      message,
      data
    ) VALUES (
      NEW.patient_id,
      'urgent_consultation',
      'critical',
      'URGENT: Consultation prioritaire',
      'Votre consultation a ete marquee comme urgente. Un medecin vous contactera rapidement.',
      jsonb_build_object(
        'consultation_id', NEW.id,
        'urgency_level', NEW.urgency_level
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if not exists
DROP TRIGGER IF EXISTS consultation_status_change_notification ON consultations;
CREATE TRIGGER consultation_status_change_notification
  AFTER UPDATE ON consultations
  FOR EACH ROW
  EXECUTE FUNCTION notify_consultation_status_change();


-- ============================================
-- 5. PERFORMANCE INDEXES
-- ============================================

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_consultations_created_month
  ON consultations (DATE_TRUNC('month', created_at));

CREATE INDEX IF NOT EXISTS idx_consultations_intensity_created
  ON consultations (intensity, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_appointments_date_status
  ON appointments (appointment_date, status);

CREATE INDEX IF NOT EXISTS idx_patients_age_gender
  ON patients (age, gender);

-- Composite index for consultation queries
CREATE INDEX IF NOT EXISTS idx_consultations_patient_status_created
  ON consultations (patient_id, status, created_at DESC);


-- ============================================
-- 6. UPDATE TRIGGER FOR REMINDERS
-- ============================================

CREATE OR REPLACE FUNCTION update_reminders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_reminders_updated_at ON appointment_reminders;
CREATE TRIGGER trigger_update_reminders_updated_at
  BEFORE UPDATE ON appointment_reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_reminders_updated_at();
