-- Fix: Allow anon role to access appointments table
-- The app uses custom auth (medics table), not Supabase Auth,
-- so requests come in with 'anon' role, not 'authenticated'.

-- Add anon SELECT policy
DROP POLICY IF EXISTS "Anon can view appointments" ON appointments;
CREATE POLICY "Anon can view appointments"
  ON appointments
  FOR SELECT
  TO anon
  USING (true);

-- Add anon INSERT policy
DROP POLICY IF EXISTS "Anon can create appointments" ON appointments;
CREATE POLICY "Anon can create appointments"
  ON appointments
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Add anon UPDATE policy
DROP POLICY IF EXISTS "Anon can update appointments" ON appointments;
CREATE POLICY "Anon can update appointments"
  ON appointments
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Add anon DELETE policy
DROP POLICY IF EXISTS "Anon can delete appointments" ON appointments;
CREATE POLICY "Anon can delete appointments"
  ON appointments
  FOR DELETE
  TO anon
  USING (true);
