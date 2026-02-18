/*
  # Create Activity Log System

  1. New Tables
    - `activity_log`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references medics - nullable)
      - `user_name` (text, for display)
      - `user_initials` (text, for avatar)
      - `action` (text, action type)
      - `entity_type` (text, patient/appointment/consultation)
      - `entity_id` (uuid, reference to entity - nullable)
      - `entity_name` (text, for display - nullable)
      - `metadata` (jsonb, additional data)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `activity_log` table
    - Add policy for public to read activity log
    - Add policy for public to insert activities

  3. Indexes
    - Index on created_at for chronological sorting
    - Index on entity_type for filtering by type
*/

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

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity_type ON activity_log(entity_type);

-- Enable Row Level Security
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Policy: Allow everyone to view activity log
CREATE POLICY "Anyone can view activity log"
  ON activity_log
  FOR SELECT
  USING (true);

-- Policy: Allow everyone to insert activities
CREATE POLICY "Anyone can log activities"
  ON activity_log
  FOR INSERT
  WITH CHECK (true);

-- Seed some initial activity data for demonstration
INSERT INTO activity_log (user_name, user_initials, action, entity_type, entity_name, created_at)
VALUES
  ('Dr. Dupont', 'JD', 'Consultation terminée', 'patient', 'Marie Martin', now() - interval '5 minutes'),
  ('Dr. Dupont', 'JD', 'Rendez-vous planifié', 'appointment', 'Pierre Durand', now() - interval '15 minutes'),
  ('Dr. Dupont', 'JD', 'Dossier patient mis à jour', 'patient', 'Sophie Bernard', now() - interval '1 hour'),
  ('Dr. Dupont', 'JD', 'Résultats d''analyse vérifiés', 'consultation', 'Julie Petit', now() - interval '2 hours'),
  ('Dr. Dupont', 'JD', 'Nouveau patient enregistré', 'patient', 'Thomas Robert', now() - interval '3 hours'),
  ('Dr. Dupont', 'JD', 'Prescription créée', 'consultation', 'Anne Moreau', now() - interval '4 hours'),
  ('Dr. Dupont', 'JD', 'Rendez-vous confirmé', 'appointment', 'Lucas Simon', now() - interval '5 hours'),
  ('Dr. Dupont', 'JD', 'Suivi patient', 'patient', 'Emma Laurent', now() - interval '6 hours')
ON CONFLICT DO NOTHING;

-- Add comment
COMMENT ON TABLE activity_log IS 'Stores all user activities for audit trail and recent activity widget';
