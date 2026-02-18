/*
  # Création des Tables Analytics

  1. Nouvelles Tables
    - `analytics_stats` - Statistiques agrégées par période
      - `id` (uuid, primary key)
      - `date` (date) - Date de la statistique
      - `patients_consultes` (integer) - Nombre de patients consultés
      - `patients_consultes_evolution` (decimal) - Évolution en %
      - `rdv_exceptionnels` (decimal) - Taux de RDV exceptionnels
      - `rdv_exceptionnels_evolution` (decimal) - Évolution en %
      - `rdv_honores` (decimal) - Taux de RDV honorés
      - `rdv_honores_evolution` (decimal) - Évolution en %
      - `cas_risque` (integer) - Nombre de cas à risque
      - `cas_risque_evolution` (integer) - Évolution nombre
      - `created_at` (timestamptz)
    
    - `analytics_departement` - Statistiques par département
      - `id` (uuid, primary key)
      - `departement` (text) - Nom du département
      - `patients_count` (integer) - Nombre de patients
      - `croissance` (decimal) - Croissance en %
      - `date` (date) - Date de la statistique
      - `created_at` (timestamptz)
    
    - `analytics_medecins` - Performance des médecins
      - `id` (uuid, primary key)
      - `medecin_name` (text) - Nom du médecin
      - `consultations` (integer) - Nombre de consultations
      - `minutes_par_patient` (integer) - Minutes moyennes par patient
      - `satisfaction` (decimal) - Score de satisfaction (0-5)
      - `date` (date) - Date de la statistique
      - `created_at` (timestamptz)
    
    - `analytics_flux_patients` - Flux de patients mensuel
      - `id` (uuid, primary key)
      - `mois` (text) - Mois (Jan, Fév, etc.)
      - `consultations` (integer) - Nombre de consultations
      - `suivis` (integer) - Nombre de suivis
      - `urgences` (integer) - Nombre d'urgences
      - `annee` (integer) - Année
      - `created_at` (timestamptz)
    
    - `analytics_pathologies` - Distribution des pathologies
      - `id` (uuid, primary key)
      - `pathologie` (text) - Nom de la pathologie
      - `pourcentage` (decimal) - Pourcentage
      - `count` (integer) - Nombre de cas
      - `created_at` (timestamptz)
    
    - `analytics_recuperation` - Taux de récupération hebdomadaire
      - `id` (uuid, primary key)
      - `semaine` (integer) - Numéro de semaine
      - `taux_reel` (decimal) - Taux réel de récupération
      - `objectif` (decimal) - Objectif fixé
      - `annee` (integer) - Année
      - `created_at` (timestamptz)
    
    - `analytics_systemes` - Scores des systèmes de santé
      - `id` (uuid, primary key)
      - `systeme` (text) - Nom du système (Cardiovasculaire, Respiratoire, etc.)
      - `score` (decimal) - Score en %
      - `date` (date) - Date de la mesure
      - `created_at` (timestamptz)

  2. Sécurité
    - Activer RLS sur toutes les tables
    - Politiques pour utilisateurs authentifiés uniquement

  3. Indexes
    - Index sur dates pour performance
    - Index sur départements et médecins
*/

-- Table: analytics_stats
CREATE TABLE IF NOT EXISTS analytics_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  patients_consultes integer NOT NULL DEFAULT 0,
  patients_consultes_evolution decimal(5,2) DEFAULT 0,
  rdv_exceptionnels decimal(5,2) NOT NULL DEFAULT 0,
  rdv_exceptionnels_evolution decimal(5,2) DEFAULT 0,
  rdv_honores decimal(5,2) NOT NULL DEFAULT 0,
  rdv_honores_evolution decimal(5,2) DEFAULT 0,
  cas_risque integer NOT NULL DEFAULT 0,
  cas_risque_evolution integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Table: analytics_departement
CREATE TABLE IF NOT EXISTS analytics_departement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  departement text NOT NULL,
  patients_count integer NOT NULL DEFAULT 0,
  croissance decimal(5,2) DEFAULT 0,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Table: analytics_medecins
CREATE TABLE IF NOT EXISTS analytics_medecins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medecin_name text NOT NULL,
  consultations integer NOT NULL DEFAULT 0,
  minutes_par_patient integer NOT NULL DEFAULT 0,
  satisfaction decimal(2,1) NOT NULL DEFAULT 0,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Table: analytics_flux_patients
CREATE TABLE IF NOT EXISTS analytics_flux_patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mois text NOT NULL,
  consultations integer NOT NULL DEFAULT 0,
  suivis integer NOT NULL DEFAULT 0,
  urgences integer NOT NULL DEFAULT 0,
  annee integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  created_at timestamptz DEFAULT now()
);

-- Table: analytics_pathologies
CREATE TABLE IF NOT EXISTS analytics_pathologies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pathologie text NOT NULL,
  pourcentage decimal(5,2) NOT NULL DEFAULT 0,
  count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Table: analytics_recuperation
CREATE TABLE IF NOT EXISTS analytics_recuperation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  semaine integer NOT NULL,
  taux_reel decimal(5,2) NOT NULL DEFAULT 0,
  objectif decimal(5,2) NOT NULL DEFAULT 75,
  annee integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  created_at timestamptz DEFAULT now()
);

-- Table: analytics_systemes
CREATE TABLE IF NOT EXISTS analytics_systemes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  systeme text NOT NULL,
  score decimal(5,2) NOT NULL DEFAULT 0,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE analytics_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_departement ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_medecins ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_flux_patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_pathologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_recuperation ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_systemes ENABLE ROW LEVEL SECURITY;

-- Policies: Authenticated users can read
CREATE POLICY "Authenticated users can read analytics_stats"
  ON analytics_stats FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read analytics_departement"
  ON analytics_departement FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read analytics_medecins"
  ON analytics_medecins FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read analytics_flux_patients"
  ON analytics_flux_patients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read analytics_pathologies"
  ON analytics_pathologies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read analytics_recuperation"
  ON analytics_recuperation FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read analytics_systemes"
  ON analytics_systemes FOR SELECT
  TO authenticated
  USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_stats_date ON analytics_stats(date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_departement_date ON analytics_departement(date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_medecins_date ON analytics_medecins(date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_flux_patients_annee ON analytics_flux_patients(annee);
CREATE INDEX IF NOT EXISTS idx_analytics_recuperation_annee ON analytics_recuperation(annee);
CREATE INDEX IF NOT EXISTS idx_analytics_systemes_date ON analytics_systemes(date DESC);