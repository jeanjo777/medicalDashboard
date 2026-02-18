/*
  # Add medic access policies for patients and consultations

  1. Changes
    - Add policy for medics to view all patients
    - Add policy for medics to update patients
    - Add policy for medics to view all consultations
    - Add policy for medics to update consultations
    - Add policy for medics to delete patients
  
  2. Important Notes
    - Medics need full access to patient data for clinical dashboard
    - Medics need to update consultation status and add treatment notes
    - Uses medics table to verify medic role
    - Maintains data security by requiring authentication
*/

CREATE POLICY "Medics can view all patients"
  ON patients
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM medics
      WHERE medics.id = auth.uid()
    )
  );

CREATE POLICY "Medics can update patients"
  ON patients
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM medics
      WHERE medics.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM medics
      WHERE medics.id = auth.uid()
    )
  );

CREATE POLICY "Medics can insert patients"
  ON patients
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM medics
      WHERE medics.id = auth.uid()
    )
  );

CREATE POLICY "Medics can delete patients"
  ON patients
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM medics
      WHERE medics.id = auth.uid()
    )
  );

CREATE POLICY "Medics can view all consultations"
  ON consultations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM medics
      WHERE medics.id = auth.uid()
    )
  );

CREATE POLICY "Medics can update consultations"
  ON consultations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM medics
      WHERE medics.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM medics
      WHERE medics.id = auth.uid()
    )
  );

CREATE POLICY "Medics can insert consultations"
  ON consultations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM medics
      WHERE medics.id = auth.uid()
    )
  );

CREATE POLICY "Medics can delete consultations"
  ON consultations
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM medics
      WHERE medics.id = auth.uid()
    )
  );
