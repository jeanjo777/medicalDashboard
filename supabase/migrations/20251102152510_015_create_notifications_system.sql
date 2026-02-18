/*
  # Notifications System

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, reference to users/medics)
      - `type` (text) - notification type (medical_emergency, appointment_missed, etc.)
      - `priority` (text) - critical/high/medium/low
      - `title` (text) - notification title
      - `message` (text) - notification message
      - `data` (jsonb) - additional structured data
      - `actions` (jsonb) - quick actions array
      - `read` (boolean) - read status
      - `read_at` (timestamptz) - when marked as read
      - `expires_at` (timestamptz) - optional expiration
      - `created_at` (timestamptz) - creation timestamp

  2. Security
    - Enable RLS
    - Users can only see their own notifications
    - Policies for SELECT and UPDATE

  3. Indexes
    - user_id for fast filtering
    - read status for unread count
    - priority for sorting
    - created_at for chronological order

  4. Functions
    - delete_expired_notifications() - cleanup expired notifications
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  priority text NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  actions jsonb DEFAULT '[]'::jsonb,
  read boolean DEFAULT false,
  read_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id::text = auth.uid()::text);

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id::text = auth.uid()::text)
  WITH CHECK (user_id::text = auth.uid()::text);

-- Policy: System can insert notifications
CREATE POLICY "System can insert notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to delete expired notifications
CREATE OR REPLACE FUNCTION delete_expired_notifications()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM notifications
  WHERE expires_at IS NOT NULL
    AND expires_at < now();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN deleted_count;
END;
$$;

-- Function to create notification (helper)
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_type text,
  p_priority text,
  p_title text,
  p_message text,
  p_data jsonb DEFAULT '{}'::jsonb,
  p_actions jsonb DEFAULT '[]'::jsonb,
  p_expires_at timestamptz DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    priority,
    title,
    message,
    data,
    actions,
    expires_at
  ) VALUES (
    p_user_id,
    p_type,
    p_priority,
    p_title,
    p_message,
    p_data,
    p_actions,
    p_expires_at
  )
  RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE notifications
  SET read = true,
      read_at = now()
  WHERE id = notification_id
    AND user_id::text = auth.uid()::text;

  RETURN FOUND;
END;
$$;

-- Function to mark all notifications as read for user
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE notifications
  SET read = true,
      read_at = now()
  WHERE user_id::text = auth.uid()::text
    AND read = false;

  GET DIAGNOSTICS updated_count = ROW_COUNT;

  RETURN updated_count;
END;
$$;

-- Insert sample notifications for testing
DO $$
DECLARE
  sample_user_id uuid;
BEGIN
  -- Get first medic user (or create sample if none exists)
  SELECT id INTO sample_user_id FROM medics LIMIT 1;

  IF sample_user_id IS NOT NULL THEN
    -- Critical notification
    INSERT INTO notifications (user_id, type, priority, title, message, data, actions) VALUES
    (sample_user_id, 'appointment_missed', 'high', 'Rendez-vous manqué', 'Jean Martin - RDV 14h30 non honoré',
     '{"appointmentId": "123", "patientName": "Jean Martin", "time": "14:30"}'::jsonb,
     '[{"label": "Recontacter", "action": "call_patient"}, {"label": "Reprogrammer", "action": "reschedule"}]'::jsonb);

    -- Medium notification
    INSERT INTO notifications (user_id, type, priority, title, message, data, actions) VALUES
    (sample_user_id, 'prescription_renewal', 'medium', 'Ordonnance à renouveler', 'Marie Dubois - Traitement expire dans 3 jours',
     '{"prescriptionId": "456", "patientName": "Marie Dubois", "medication": "Metformine 850mg"}'::jsonb,
     '[{"label": "Renouveler", "action": "renew_prescription"}, {"label": "Voir dossier", "action": "view_patient"}]'::jsonb);

    -- Low notification
    INSERT INTO notifications (user_id, type, priority, title, message, data, actions) VALUES
    (sample_user_id, 'new_patient', 'low', 'Nouveau patient', 'Emma Rousseau - Inscription complète',
     '{"patientId": "789", "patientName": "Emma Rousseau"}'::jsonb,
     '[{"label": "Voir dossier", "action": "view_patient"}]'::jsonb);
  END IF;
END $$;
