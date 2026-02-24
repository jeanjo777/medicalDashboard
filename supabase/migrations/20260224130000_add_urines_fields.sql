-- Add urines albumine and sucre fields to patients table
ALTER TABLE patients ADD COLUMN IF NOT EXISTS urines_albumine VARCHAR(50) NULL;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS urines_sucre VARCHAR(50) NULL;
