-- Migration: Create received_emails table for inbox feature
-- Date: 2026-02-25

CREATE TABLE IF NOT EXISTS public.received_emails (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_email  TEXT NOT NULL,
  from_name   TEXT,
  to_email    TEXT NOT NULL,
  subject     TEXT,
  text_body   TEXT,
  html_body   TEXT,
  reply_to    TEXT,
  resend_id   TEXT,
  headers     JSONB,
  attachments JSONB,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.received_emails ENABLE ROW LEVEL SECURITY;

-- Authenticated users (medics) can read all received emails
CREATE POLICY "auth read received_emails"
  ON public.received_emails
  FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can delete received emails
CREATE POLICY "auth delete received_emails"
  ON public.received_emails
  FOR DELETE
  TO authenticated
  USING (true);

-- Authenticated users can update (mark as read)
CREATE POLICY "auth update received_emails"
  ON public.received_emails
  FOR UPDATE
  TO authenticated
  USING (true);

-- Service role (Edge Function) bypasses RLS for INSERT automatically

CREATE INDEX IF NOT EXISTS received_emails_received_at_idx ON public.received_emails (received_at DESC);
CREATE INDEX IF NOT EXISTS received_emails_is_read_idx ON public.received_emails (is_read);

COMMENT ON TABLE public.received_emails IS 'Emails reçus via Resend inbound pour la boîte de réception médicale';
