-- Add test_typhoide and test_dengue columns to patients table
ALTER TABLE patients ADD COLUMN IF NOT EXISTS test_typhoide VARCHAR(20) NULL;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS test_dengue VARCHAR(20) NULL;
