/*
  # Add Profile Columns to Medics Table

  1. Changes
    - Add `nom` (text, last name)
    - Add `prenom` (text, first name)
    - Add `specialite` (text, medical specialty)
    - Add `email` (text, contact email)
    - Add `telephone` (text, phone number)

  2. Data Update
    - Update existing medic with profile data
*/

-- Add new columns to medics table
ALTER TABLE medics 
  ADD COLUMN IF NOT EXISTS nom text DEFAULT '',
  ADD COLUMN IF NOT EXISTS prenom text DEFAULT '',
  ADD COLUMN IF NOT EXISTS specialite text DEFAULT 'Médecin généraliste',
  ADD COLUMN IF NOT EXISTS email text DEFAULT '',
  ADD COLUMN IF NOT EXISTS telephone text DEFAULT '';

-- Update existing medic with sample data
UPDATE medics 
SET 
  nom = 'Dupont',
  prenom = 'Jean',
  specialite = 'Médecine générale',
  email = 'jean.dupont@clinic.fr',
  telephone = '+33 1 23 45 67 89'
WHERE username = 'medecin';

-- Add comment
COMMENT ON COLUMN medics.nom IS 'Last name of the medic';
COMMENT ON COLUMN medics.prenom IS 'First name of the medic';
COMMENT ON COLUMN medics.specialite IS 'Medical specialty';
COMMENT ON COLUMN medics.email IS 'Contact email address';
COMMENT ON COLUMN medics.telephone IS 'Contact phone number';
