/*
  # Update Patients Table Schema

  1. Changes
    - Add missing columns for comprehensive patient management
    - Add first_name, last_name, date_of_birth, phone, address fields
    - Add primary_pathology, status, notes fields
    - Migrate existing data from name to first_name/last_name
    - Add constraints and defaults

  2. New Columns
    - `first_name` (text, NOT NULL) - Patient first name
    - `last_name` (text, NOT NULL) - Patient last name
    - `date_of_birth` (date) - Patient date of birth
    - `phone` (text, NOT NULL) - Contact phone number
    - `address` (text) - Patient address
    - `primary_pathology` (text) - Main medical condition
    - `status` (text) - Patient status (active, in_treatment, recovered, inactive)
    - `notes` (text) - Additional notes about patient

  3. Security
    - Maintain existing RLS policies
    - Add indexes for performance
*/

-- Add new columns if they don't exist
DO $$
BEGIN
  -- Add first_name
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE patients ADD COLUMN first_name text;
  END IF;

  -- Add last_name
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'last_name'
  ) THEN
    ALTER TABLE patients ADD COLUMN last_name text;
  END IF;

  -- Add date_of_birth
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'date_of_birth'
  ) THEN
    ALTER TABLE patients ADD COLUMN date_of_birth date;
  END IF;

  -- Add phone
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'phone'
  ) THEN
    ALTER TABLE patients ADD COLUMN phone text;
  END IF;

  -- Add address
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'address'
  ) THEN
    ALTER TABLE patients ADD COLUMN address text;
  END IF;

  -- Add primary_pathology
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'primary_pathology'
  ) THEN
    ALTER TABLE patients ADD COLUMN primary_pathology text;
  END IF;

  -- Add status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'status'
  ) THEN
    ALTER TABLE patients ADD COLUMN status text DEFAULT 'active';
  END IF;

  -- Add notes
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'notes'
  ) THEN
    ALTER TABLE patients ADD COLUMN notes text;
  END IF;
END $$;

-- Migrate existing data from 'name' to 'first_name' and 'last_name'
UPDATE patients
SET
  first_name = SPLIT_PART(name, ' ', 1),
  last_name = CASE
    WHEN SPLIT_PART(name, ' ', 2) != '' THEN SPLIT_PART(name, ' ', 2)
    ELSE SPLIT_PART(name, ' ', 1)
  END
WHERE first_name IS NULL OR last_name IS NULL;

-- Set default values for new patients
ALTER TABLE patients
  ALTER COLUMN first_name SET DEFAULT '',
  ALTER COLUMN last_name SET DEFAULT '',
  ALTER COLUMN phone SET DEFAULT '',
  ALTER COLUMN status SET DEFAULT 'active';

-- Add constraint for status values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'patients_status_check'
  ) THEN
    ALTER TABLE patients
    ADD CONSTRAINT patients_status_check
    CHECK (status IN ('active', 'in_treatment', 'recovered', 'inactive'));
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_last_name ON patients(last_name);
CREATE INDEX IF NOT EXISTS idx_patients_date_of_birth ON patients(date_of_birth);

-- Update timestamp trigger if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_patients_updated_at ON patients;
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
