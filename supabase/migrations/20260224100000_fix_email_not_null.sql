-- Allow NULL emails: remove NOT NULL constraint and fix existing empty strings
ALTER TABLE patients ALTER COLUMN email DROP NOT NULL;

-- Convert existing empty string emails to NULL
UPDATE patients SET email = NULL WHERE email = '';
