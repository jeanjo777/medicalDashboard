/*
  # Création de la table user_sessions pour gestion sécurisée des sessions

  1. Nouvelle Table `user_sessions`
    - `id` (uuid, primary key) - Identifiant unique de la session
    - `session_id` (text, unique) - ID de session UUID pour les cookies HTTPOnly
    - `user_id` (uuid) - Référence vers le médecin connecté
    - `token` (text) - JWT token pour validation
    - `ip_address` (text) - Adresse IP de connexion
    - `user_agent` (text) - User agent du navigateur
    - `created_at` (timestamptz) - Date de création de la session
    - `last_activity` (timestamptz) - Dernière activité
    - `expires_at` (timestamptz) - Date d'expiration de la session

  2. Sécurité
    - RLS activé sur la table
    - Seul le service role peut accéder aux sessions
    - Index pour performances sur session_id et user_id
    - Fonction de nettoyage automatique des sessions expirées

  3. Notes importantes
    - Les sessions expirent après 24 heures d'inactivité
    - Une session peut être révoquée à tout moment
    - Support pour HTTPOnly cookies
*/

-- Créer la table user_sessions
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  user_id uuid REFERENCES medics(id) ON DELETE CASCADE NOT NULL,
  token text NOT NULL,
  ip_address text DEFAULT '',
  user_agent text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  last_activity timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

-- Activer RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Politique restrictive - seuls les service roles peuvent accéder
CREATE POLICY "Service role can manage sessions"
  ON user_sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Créer la table login_attempts si elle n'existe pas
CREATE TABLE IF NOT EXISTS login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address text DEFAULT '',
  success boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Activer RLS sur login_attempts
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- Politique pour login_attempts
CREATE POLICY "Service role can manage login attempts"
  ON login_attempts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Index pour login_attempts
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_created_at ON login_attempts(created_at DESC);

-- Fonction pour nettoyer les sessions expirées
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM user_sessions
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour nettoyer les anciennes tentatives de connexion
CREATE OR REPLACE FUNCTION cleanup_old_login_attempts()
RETURNS void AS $$
BEGIN
  DELETE FROM login_attempts
  WHERE created_at < now() - interval '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour mettre à jour automatiquement last_activity
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour last_activity automatiquement
DROP TRIGGER IF EXISTS trigger_update_session_activity ON user_sessions;
CREATE TRIGGER trigger_update_session_activity
  BEFORE UPDATE ON user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_session_activity();
