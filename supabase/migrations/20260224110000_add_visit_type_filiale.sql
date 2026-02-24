-- Add visit type and filiale fields to patients table
ALTER TABLE patients ADD COLUMN IF NOT EXISTS visit_type VARCHAR(50) NULL;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS filiale VARCHAR(50) NULL;
