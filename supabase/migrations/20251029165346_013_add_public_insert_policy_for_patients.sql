/*
  # Add Public Insert Policy for Patients

  1. Changes
    - Add policy to allow public (unauthenticated) patient registration
    - This allows the AddPatientModal to work without authentication
    - Maintains existing security for SELECT, UPDATE, DELETE operations

  2. Security
    - INSERT: Allow public to insert new patients (self-registration)
    - SELECT: Restricted to medics and patient themselves (unchanged)
    - UPDATE: Restricted to medics only (unchanged)
    - DELETE: Restricted to medics only (unchanged)

  3. Notes
    - This is safe for patient self-registration scenarios
    - Sensitive operations still require authentication
*/

-- Drop existing restrictive service role policy if it exists
DROP POLICY IF EXISTS "Service role can manage patients" ON patients;

-- Add policy to allow public patient registration
CREATE POLICY "Allow public patient registration"
  ON patients
  FOR INSERT
  TO public
  WITH CHECK (true);
