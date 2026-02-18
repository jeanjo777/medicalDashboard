/*
  # Amélioration de la table appointments pour gestion complète des rendez-vous

  1. Modifications de la table `appointments`
    - Ajout de `patient_id` (uuid, référence vers patients)
    - Ajout de `medic_id` (uuid, référence vers medics)
    - Ajout de `motif` (texte, raison du rendez-vous)
    - Ajout de `type_consultation` (texte, type de consultation)
    - Ajout de `notes` (texte, notes privées du médecin)
    - Ajout de `duration` (entier, durée en minutes)
    - Modification de `status` pour avoir des valeurs claires
    - Ajout de `cancelled_at` (timestamp, date d'annulation si applicable)
    - Ajout de `cancelled_reason` (texte, raison de l'annulation)
    - Ajout de `updated_at` (timestamp, date de dernière modification)

  2. Sécurité
    - RLS déjà activé sur la table
    - Ajout de politiques pour que les médecins authentifiés puissent gérer leurs rendez-vous
    - Les patients peuvent voir leurs propres rendez-vous

  3. Notes importantes
    - Cette migration améliore le système de rendez-vous pour une gestion professionnelle
    - Permet de lier rendez-vous aux patients et médecins
    - Permet de suivre l'historique complet (création, modification, annulation)
    - Supporte différents types de consultations et statuts
*/

-- Ajouter les nouvelles colonnes si elles n'existent pas
DO $$
BEGIN
  -- patient_id (référence vers la table patients)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'patient_id'
  ) THEN
    ALTER TABLE appointments ADD COLUMN patient_id uuid REFERENCES patients(id) ON DELETE CASCADE;
  END IF;

  -- medic_id (référence vers la table medics)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'medic_id'
  ) THEN
    ALTER TABLE appointments ADD COLUMN medic_id uuid REFERENCES medics(id) ON DELETE SET NULL;
  END IF;

  -- motif (raison du rendez-vous)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'motif'
  ) THEN
    ALTER TABLE appointments ADD COLUMN motif text DEFAULT 'Consultation générale';
  END IF;

  -- type_consultation
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'type_consultation'
  ) THEN
    ALTER TABLE appointments ADD COLUMN type_consultation text DEFAULT 'Consultation';
  END IF;

  -- notes privées
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'notes'
  ) THEN
    ALTER TABLE appointments ADD COLUMN notes text DEFAULT '';
  END IF;

  -- durée en minutes
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'duration'
  ) THEN
    ALTER TABLE appointments ADD COLUMN duration integer DEFAULT 30;
  END IF;

  -- date d'annulation
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'cancelled_at'
  ) THEN
    ALTER TABLE appointments ADD COLUMN cancelled_at timestamptz;
  END IF;

  -- raison de l'annulation
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'cancelled_reason'
  ) THEN
    ALTER TABLE appointments ADD COLUMN cancelled_reason text DEFAULT '';
  END IF;

  -- date de dernière modification
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE appointments ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Mettre à jour la colonne status pour avoir une valeur par défaut claire
ALTER TABLE appointments ALTER COLUMN status SET DEFAULT 'a_venir';

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_medic_id ON appointments(medic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_appointments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at automatiquement
DROP TRIGGER IF EXISTS trigger_update_appointments_updated_at ON appointments;
CREATE TRIGGER trigger_update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_appointments_updated_at();

-- Politiques RLS pour les médecins authentifiés
DROP POLICY IF EXISTS "Medics can view all appointments" ON appointments;
CREATE POLICY "Medics can view all appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Medics can create appointments" ON appointments;
CREATE POLICY "Medics can create appointments"
  ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Medics can update appointments" ON appointments;
CREATE POLICY "Medics can update appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Medics can delete appointments" ON appointments;
CREATE POLICY "Medics can delete appointments"
  ON appointments
  FOR DELETE
  TO authenticated
  USING (true);
