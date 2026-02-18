/*
  # Création de la table des demandes de rendez-vous

  1. Nouvelle table
    - `appointment_requests`
      - `id` (uuid, clé primaire)
      - `prenom` (texte, obligatoire)
      - `nom` (texte, obligatoire)
      - `telephone` (texte, obligatoire)
      - `email` (texte, obligatoire)
      - `type_de_soin` (texte)
      - `message` (texte)
      - `date_demande` (texte)
      - `source` (texte, par défaut: 'Site web')
      - `statut` (texte, par défaut: 'nouveau')
      - `created_at` (timestamp avec timezone)

  2. Sécurité
    - Active RLS sur la table `appointment_requests`
    - Politique permettant l'insertion publique (pour le formulaire)
    - Les lectures nécessitent une authentification (pour l'admin)

  3. Notes importantes
    - Cette table stocke toutes les demandes de rendez-vous soumises via le site web
    - Le champ `statut` permet de suivre l'état de chaque demande (nouveau, contacté, confirmé, annulé)
    - RLS permet aux visiteurs non authentifiés de créer des demandes mais seuls les utilisateurs authentifiés peuvent les lire
*/

-- Créer la table des demandes de rendez-vous
CREATE TABLE IF NOT EXISTS appointment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prenom text NOT NULL,
  nom text NOT NULL,
  telephone text NOT NULL,
  email text NOT NULL,
  type_de_soin text DEFAULT 'Non spécifié',
  message text DEFAULT '',
  date_demande text NOT NULL,
  source text DEFAULT 'Site web - Formulaire de contact',
  statut text DEFAULT 'nouveau',
  created_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE appointment_requests ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre à tout le monde de créer une demande (formulaire public)
CREATE POLICY "Tout le monde peut créer une demande"
  ON appointment_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Politique pour permettre aux utilisateurs authentifiés de lire les demandes
CREATE POLICY "Utilisateurs authentifiés peuvent lire les demandes"
  ON appointment_requests
  FOR SELECT
  TO authenticated
  USING (true);

-- Politique pour permettre aux utilisateurs authentifiés de mettre à jour les demandes
CREATE POLICY "Utilisateurs authentifiés peuvent mettre à jour les demandes"
  ON appointment_requests
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_appointment_requests_email ON appointment_requests(email);
CREATE INDEX IF NOT EXISTS idx_appointment_requests_statut ON appointment_requests(statut);
CREATE INDEX IF NOT EXISTS idx_appointment_requests_created_at ON appointment_requests(created_at DESC);
