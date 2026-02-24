-- Migration: Create emails table for messagerie email feature
-- Date: 2026-02-25

CREATE TABLE IF NOT EXISTS public.emails (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email      TEXT NOT NULL,
  to_name       TEXT,
  subject       TEXT NOT NULL,
  body          TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'sent'
                  CHECK (status IN ('sent', 'failed', 'pending')),
  resend_id     TEXT,
  template_used TEXT,
  error_message TEXT,
  sent_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;

-- Authenticated users (medics) can read all emails
CREATE POLICY "auth read emails"
  ON public.emails
  FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can delete emails from history
CREATE POLICY "auth delete emails"
  ON public.emails
  FOR DELETE
  TO authenticated
  USING (true);

-- Service role (Edge Function) bypasses RLS for INSERT automatically

CREATE INDEX IF NOT EXISTS emails_created_at_idx ON public.emails (created_at DESC);
CREATE INDEX IF NOT EXISTS emails_status_idx ON public.emails (status);

COMMENT ON TABLE public.emails IS 'Historique des emails envoyés via Resend pour la messagerie médicale';
