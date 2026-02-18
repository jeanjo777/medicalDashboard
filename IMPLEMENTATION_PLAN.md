# Plan d'Implémentation - Systèmes Médicaux IA

## Analyse de l'Existant

### 1. Système de Consultations IA (Actuel)
**Points forts:**
- Edge Function `create-consultation` utilise Claude API (Sonnet)
- Prompt médical bien structuré avec règles éthiques
- Workflow de statuts: `pending` → `ai_analyzed` → `completed` → `reviewed`
- Table `consultation_messages` pour historique chat
- Niveaux d'urgence: low/medium/high/critical
- Fallback si API indisponible

**Limitations identifiées:**
- Pas de conversation multi-tour (une seule analyse par consultation)
- Pas de suivi médecin après analyse IA
- Interface minimaliste sans tableau de bord médecin
- Pas de validation/révision par médecin dans le workflow
- Pas d'intégration avec les rendez-vous

### 2. Système de Rendez-vous (Actuel)
**Points forts:**
- CRUD complet avec modales (Add, Edit, Detail)
- Statuts: `a_venir`, `en_cours`, `termine`, `annule`
- Export multi-format (CSV, JSON, TXT)
- Pagination, recherche, filtres
- Hook `useAppointmentsQuery` optimisé

**Limitations identifiées:**
- Pas de vue calendrier visuelle
- Pas de rappels automatiques
- Pas de synchronisation avec consultations IA
- Pas de créneaux disponibles/gestion planning médecin

### 3. Système Analytics (Actuel)
**Points forts:**
- 7 tables analytics (stats, départements, médecins, flux, pathologies, récupération, systèmes)
- Tabs: Overview, Predictions, Correlations, Segmentation, AI Alerts, Comparative, Reports
- Visualisations Recharts complètes
- Export des données

**Limitations identifiées:**
- Données hardcodées (mock) dans tous les composants
- Pas de connexion réelle avec les tables analytics
- Prédictions IA statiques, pas de vrai modèle ML
- Alertes non dynamiques

---

## Plan d'Implémentation

### Phase 1: Système de Consultations IA Amélioré

#### 1.1 Conversation Multi-tour
**Fichiers à modifier:**
- `supabase/functions/create-consultation/index.ts`
- `src/pages/ConsultationPage.tsx`

**Actions:**
1. Créer une nouvelle Edge Function `continue-consultation` pour poursuivre le dialogue
2. Modifier `ConsultationPage` pour:
   - Ajouter un champ de saisie après la première réponse
   - Afficher l'historique complet des messages
   - Permettre plusieurs échanges user/AI

**Nouvelle structure de messages:**
```typescript
interface Message {
  id: string;
  consultation_id: string;
  sender: 'user' | 'ai' | 'medic';
  message: string;
  metadata?: {
    urgency_update?: string;
    follow_up_required?: boolean;
  };
  created_at: Date;
}
```

#### 1.2 Interface Médecin pour Révision
**Nouveaux fichiers:**
- `src/pages/ConsultationsListPage.tsx`
- `src/components/ConsultationReviewModal.tsx`
- `src/hooks/useConsultationsQuery.ts`

**Actions:**
1. Page listant toutes les consultations avec filtres par statut/urgence
2. Modal de révision permettant au médecin de:
   - Valider/modifier le diagnostic IA
   - Ajouter des notes
   - Changer le statut vers `reviewed`
   - Programmer un rendez-vous de suivi

#### 1.3 Workflow Complet
**Migration SQL:**
```sql
ALTER TABLE consultations ADD COLUMN reviewed_by uuid REFERENCES medics(id);
ALTER TABLE consultations ADD COLUMN reviewed_at timestamptz;
ALTER TABLE consultations ADD COLUMN medic_notes text;
ALTER TABLE consultations ADD COLUMN follow_up_appointment_id uuid REFERENCES appointments(id);
ALTER TABLE consultations
  DROP CONSTRAINT consultations_status_check,
  ADD CONSTRAINT consultations_status_check
  CHECK (status IN ('pending', 'ai_analyzed', 'medic_reviewing', 'completed', 'reviewed', 'follow_up_scheduled'));
```

---

### Phase 2: Gestion des Rendez-vous Améliorée

#### 2.1 Vue Calendrier
**Nouveaux fichiers:**
- `src/components/Appointments/CalendarView.tsx`
- `src/hooks/useCalendarData.ts`

**Actions:**
1. Intégrer `react-big-calendar` ou `@fullcalendar/react`
2. Vue jour/semaine/mois
3. Glisser-déposer pour reprogrammer
4. Coloration par statut et type de consultation

#### 2.2 Gestion des Créneaux
**Migration SQL:**
```sql
CREATE TABLE medic_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medic_id uuid NOT NULL REFERENCES medics(id),
  day_of_week integer CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  slot_duration integer DEFAULT 30,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE appointment_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medic_id uuid NOT NULL REFERENCES medics(id),
  slot_date date NOT NULL,
  slot_time time NOT NULL,
  is_available boolean DEFAULT true,
  appointment_id uuid REFERENCES appointments(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(medic_id, slot_date, slot_time)
);
```

**Nouveaux composants:**
- `src/components/Appointments/SlotPicker.tsx`
- `src/components/Appointments/AvailabilityManager.tsx`

#### 2.3 Système de Rappels
**Nouvelle Edge Function:** `send-appointment-reminder`
**Actions:**
1. Cron job Supabase pour vérifier les RDV à J-1 et J-0
2. Envoi email/notification
3. Table `notification_logs` pour traçabilité

---

### Phase 3: Analytics Avancées avec Données Réelles

#### 3.1 Connexion aux Données Réelles
**Fichiers à modifier:**
- `src/hooks/useAnalyticsData.ts`
- Tous les composants dans `src/components/Analytics/`

**Nouvelles Edge Functions:**
- `get-analytics-overview` - KPIs calculés en temps réel
- `get-analytics-predictions` - Prédictions basées sur historique
- `get-patient-segmentation` - Segmentation dynamique

**Actions:**
1. Remplacer les données mock par des appels API
2. Créer des vues SQL pour les agrégations:
```sql
CREATE VIEW v_analytics_kpis AS
SELECT
  COUNT(DISTINCT p.id) as total_patients,
  COUNT(DISTINCT CASE WHEN c.created_at > NOW() - INTERVAL '30 days' THEN c.patient_id END) as patients_consultes_30j,
  COUNT(a.id) FILTER (WHERE a.status = 'termine') * 100.0 / NULLIF(COUNT(a.id), 0) as taux_rdv_honores,
  COUNT(c.id) FILTER (WHERE c.urgency_level IN ('high', 'critical')) as cas_risque
FROM patients p
LEFT JOIN consultations c ON c.patient_id = p.id
LEFT JOIN appointments a ON a.patient_id = p.id;
```

#### 3.2 Prédictions IA Dynamiques
**Nouvelle Edge Function:** `generate-predictions`

**Algorithme:**
1. Récupérer données historiques (24 mois)
2. Appliquer régression linéaire/saisonnalité
3. Calculer intervalles de confiance
4. Générer insights automatiques

**Structure de réponse:**
```typescript
interface PredictionResult {
  predictions: { month: string; predicted: number; lower: number; upper: number }[];
  confidence: number;
  insights: { type: string; message: string; severity: 'info' | 'warning' | 'critical' }[];
  model_metadata: { training_period: string; accuracy: number };
}
```

#### 3.3 Alertes IA en Temps Réel
**Actions:**
1. Créer table `analytics_alerts`:
```sql
CREATE TABLE analytics_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL,
  severity text CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title text NOT NULL,
  description text,
  threshold_value decimal,
  current_value decimal,
  is_acknowledged boolean DEFAULT false,
  acknowledged_by uuid REFERENCES medics(id),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);
```

2. Edge Function `check-analytics-thresholds` exécutée périodiquement
3. Composant `AIAlertsTab` connecté aux données réelles
4. Notifications push pour alertes critiques

---

## Ordre de Priorité Recommandé

| Priorité | Tâche | Complexité | Impact |
|----------|-------|------------|--------|
| 1 | 1.2 Interface Médecin Révision | Moyenne | Haute |
| 2 | 2.1 Vue Calendrier | Moyenne | Haute |
| 3 | 3.1 Analytics Données Réelles | Haute | Haute |
| 4 | 1.1 Conversation Multi-tour | Moyenne | Moyenne |
| 5 | 2.2 Gestion Créneaux | Haute | Moyenne |
| 6 | 3.2 Prédictions IA Dynamiques | Haute | Moyenne |
| 7 | 2.3 Système Rappels | Moyenne | Moyenne |
| 8 | 3.3 Alertes Temps Réel | Moyenne | Moyenne |
| 9 | 1.3 Workflow Complet | Faible | Faible |

---

## Estimation des Fichiers à Créer/Modifier

### Nouveaux Fichiers (13)
- `src/pages/ConsultationsListPage.tsx`
- `src/components/ConsultationReviewModal.tsx`
- `src/components/ConsultationChat.tsx`
- `src/hooks/useConsultationsQuery.ts`
- `src/components/Appointments/CalendarView.tsx`
- `src/components/Appointments/SlotPicker.tsx`
- `src/components/Appointments/AvailabilityManager.tsx`
- `src/hooks/useCalendarData.ts`
- `supabase/functions/continue-consultation/index.ts`
- `supabase/functions/send-appointment-reminder/index.ts`
- `supabase/functions/get-analytics-overview/index.ts`
- `supabase/functions/generate-predictions/index.ts`
- `supabase/migrations/XXX_enhance_consultations_workflow.sql`

### Fichiers à Modifier (12)
- `src/pages/ConsultationPage.tsx`
- `src/components/Analytics/OverviewTab.tsx`
- `src/components/Analytics/PredictionsTab.tsx`
- `src/components/Analytics/AIAlertsTab.tsx`
- `src/components/Analytics/SegmentationTab.tsx`
- `src/hooks/useAnalyticsData.ts`
- `src/pages/AppointmentsPage.tsx`
- `src/components/Appointments/AddAppointmentModal.tsx`
- `src/App.tsx` (nouvelles routes)
- `src/components/MedicalSidebarRefined.tsx` (nouveau menu)
- `supabase/functions/create-consultation/index.ts`
- `src/services/api.ts` (nouveaux endpoints)

---

## Questions pour Clarification

Avant de commencer l'implémentation, j'ai besoin de clarifier:

1. **Priorisation:** Par quelle phase souhaitez-vous commencer?
2. **Calendrier:** Préférez-vous `react-big-calendar` ou `@fullcalendar/react`?
3. **Notifications:** Email seul ou aussi notifications push navigateur?
4. **Analytics ML:** Voulez-vous un vrai modèle ML (TensorFlow.js) ou des algorithmes statistiques simples?
5. **Scope initial:** Implémentation complète ou MVP pour chaque phase?
