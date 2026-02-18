/*
  # Add Public Select Policy for Patients

  1. Changes
    - Add policy to allow public (unauthenticated) patient viewing
    - This allows the EnhancedPatientsPage to display patients without authentication
    - Maintains existing security for UPDATE, DELETE operations

  2. Security
    - SELECT: Allow public to view all patients (for demo/testing)
    - INSERT: Allow public to insert new patients (unchanged)
    - UPDATE: Restricted to medics only (unchanged)
    - DELETE: Restricted to medics only (unchanged)

  3. Notes
    - This is useful for demo/testing environments
    - For production, consider implementing proper authentication
    - Sensitive operations still require authentication
*/

-- Add policy to allow public patient viewing
CREATE POLICY "Allow public patient viewing"
  ON patients
  FOR SELECT
  TO public
  USING (true);
