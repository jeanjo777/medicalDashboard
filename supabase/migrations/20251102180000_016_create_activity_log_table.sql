/*
  # Create Activity Log System

  1. New Tables
    - `activity_log`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references medics)
      - `user_name` (text, for display)
      - `user_initials` (text, for avatar)
      - `action` (text, action type)
      - `entity_type` (text, patient/appointment/consultation)
      - `entity_id` (uuid, reference to entity)
      - `entity_name` (text, for display)
      - `metadata` (jsonb, additional data)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `activity_log` table
    - Add policy for authenticated users to read activity log
    - Add policy for authenticated users to insert their own activities

  3. Indexes
    - Index on user_id for fast user activity queries
    - Index on created_at for chronological sorting
    - Index on entity_type for filtering by type

  4. Functions
    - Helper function to log activities automatically
*/

-- Create activity_log table
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES medics(id) ON DELETE SET NULL,
  user_name text NOT NULL,
  user_initials text NOT NULL DEFAULT 'U',
  action text NOT NULL,
  entity_type text NOT NULL CHECK (entity_type IN ('patient', 'appointment', 'consultation', 'other')),
  entity_id uuid,
  entity_name text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity_type ON activity_log(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity_id ON activity_log(entity_id);

-- Enable Row Level Security
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view all activity log (for transparency)
CREATE POLICY "Authenticated users can view activity log"
  ON activity_log
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can insert their own activities
CREATE POLICY "Users can log their own activities"
  ON activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Helper function to log activity
CREATE OR REPLACE FUNCTION log_activity(
  p_user_id uuid,
  p_user_name text,
  p_user_initials text,
  p_action text,
  p_entity_type text,
  p_entity_id uuid DEFAULT NULL,
  p_entity_name text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
) RETURNS uuid AS $$
DECLARE
  v_activity_id uuid;
BEGIN
  INSERT INTO activity_log (
    user_id,
    user_name,
    user_initials,
    action,
    entity_type,
    entity_id,
    entity_name,
    metadata
  ) VALUES (
    p_user_id,
    p_user_name,
    p_user_initials,
    p_action,
    p_entity_type,
    p_entity_id,
    p_entity_name,
    p_metadata
  ) RETURNING id INTO v_activity_id;

  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Seed some initial activity data for demonstration
DO $$
DECLARE
  v_medic_id uuid;
  v_patient_id uuid;
  v_appointment_id uuid;
BEGIN
  -- Get first medic
  SELECT id INTO v_medic_id FROM medics LIMIT 1;

  IF v_medic_id IS NOT NULL THEN
    -- Get some patients and appointments
    SELECT id INTO v_patient_id FROM patients ORDER BY created_at DESC LIMIT 1;
    SELECT id INTO v_appointment_id FROM appointments ORDER BY created_at DESC LIMIT 1;

    -- Insert sample activities
    INSERT INTO activity_log (user_id, user_name, user_initials, action, entity_type, entity_id, entity_name, created_at)
    VALUES
      (v_medic_id, 'Dr. Adams', 'DA', 'Completed checkup', 'patient', v_patient_id, 'John Doe', now() - interval '5 minutes'),
      (v_medic_id, 'Dr. Adams', 'DA', 'Scheduled appointment', 'appointment', v_appointment_id, 'Sarah Miller', now() - interval '15 minutes'),
      (v_medic_id, 'Dr. Adams', 'DA', 'Updated patient record', 'patient', v_patient_id, 'Michael Brown', now() - interval '1 hour'),
      (v_medic_id, 'Dr. Adams', 'DA', 'Reviewed lab results', 'consultation', NULL, 'Emily Davis', now() - interval '2 hours');
  END IF;
END $$;

-- Add comment
COMMENT ON TABLE activity_log IS 'Stores all user activities for audit trail and recent activity widget';
