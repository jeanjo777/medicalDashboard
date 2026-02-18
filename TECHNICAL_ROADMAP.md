# 🗓️ ROADMAP TECHNIQUE COMPLÈTE

Découpage exhaustif des tâches d'amélioration avec estimations et dépendances.

**Date:** 2025-11-02
**Version:** 1.0

---

## 📋 TABLE DES MATIÈRES

1. [Système d'Estimation](#système-destimation)
2. [Sprint 0 - Fondations](#sprint-0---fondations-complété)
3. [Sprint 1 - P0 Critiques](#sprint-1---p0-critiques-2-semaines)
4. [Sprint 2 - P1 Haute Priorité](#sprint-2---p1-haute-priorité-2-3-semaines)
5. [Sprint 3 - P2 Moyenne Priorité](#sprint-3---p2-moyenne-priorité-2-3-semaines)
6. [Sprint 4 - P3 Polish](#sprint-4---p3-polish-1-2-semaines)
7. [Backlog - Futures Features](#backlog---futures-features)

---

## 📊 SYSTÈME D'ESTIMATION

### Complexité

```
🟢 FAIBLE (1-2 jours)
   - Tâche simple, bien définie
   - Peu ou pas de dépendances
   - Risque minimal

🟡 MODÉRÉ (3-5 jours)
   - Tâche moyennement complexe
   - Quelques dépendances
   - Risque modéré

🔴 ÉLEVÉ (1-2 semaines)
   - Tâche complexe ou vaste
   - Nombreuses dépendances
   - Risque élevé
```

### Priorité

```
P0 - CRITIQUE (Bloquant production)
P1 - HAUTE (Important pour UX/perf)
P2 - MOYENNE (Nice to have)
P3 - BASSE (Polish/perfectionnement)
```

---

## ✅ SPRINT 0 - FONDATIONS (COMPLÉTÉ)

**Durée:** 2 semaines
**Status:** ✅ 100% Complété

### Tâches Réalisées

| ID | Tâche | Complexité | Status |
|----|-------|------------|--------|
| S0-01 | Audit dashboard complet | 🟡 Modéré | ✅ |
| S0-02 | Analyse faiblesses + priorités | 🟡 Modéré | ✅ |
| S0-03 | Table activity_log + RLS | 🟢 Faible | ✅ |
| S0-04 | Hooks réutilisables (useActivityLog, useDashboardStats) | 🟡 Modéré | ✅ |
| S0-05 | DashboardStatsCards avec change % réels | 🟢 Faible | ✅ |
| S0-06 | RecentActivity avec DB + real-time | 🟡 Modéré | ✅ |
| S0-07 | UserMenu avec logout | 🟢 Faible | ✅ |
| S0-08 | Système recherche/filtres backend | 🔴 Élevé | ✅ |
| S0-09 | Toast notifications système | 🟡 Modéré | ✅ |
| S0-10 | ConfirmDialog composant | 🟢 Faible | ✅ |
| S0-11 | PatientDetailModal complet | 🔴 Élevé | ✅ |
| S0-12 | Code splitting + lazy loading | 🟡 Modéré | ✅ |
| S0-13 | WCAG 2.1 AA utilities | 🟡 Modéré | ✅ |
| S0-14 | Responsive hooks | 🟢 Faible | ✅ |
| S0-15 | Touch gestures hooks | 🟡 Modéré | ✅ |

**Documentation créée:**
- DASHBOARD_AUDIT_REPORT.md
- WEAKNESSES_PRIORITIES_ANALYSIS.md
- DYNAMIC_DATA_IMPLEMENTATION.md
- UX_INTERACTIONS_GUIDE.md
- PERFORMANCE_OPTIMIZATION_GUIDE.md

---

## 🚀 SPRINT 1 - P0 CRITIQUES (2 semaines)

**Objectif:** Résoudre tous les bloquants production
**Priorité:** P0
**Risque:** Élevé

### S1-01: Validation Formulaires Complète

**Priorité:** P0
**Complexité:** 🔴 ÉLEVÉ (1-2 semaines)
**Dépendances:** Aucune

#### Description
Implémenter validation robuste pour tous les formulaires avec Zod + React Hook Form.

#### Tâches Techniques

1. **Installation dépendances**
   ```bash
   npm install zod react-hook-form @hookform/resolvers
   ```

2. **Schémas Zod**
   - Créer `src/schemas/patient.schema.ts`
   - Créer `src/schemas/appointment.schema.ts`
   - Créer `src/schemas/consultation.schema.ts`
   - Créer `src/schemas/auth.schema.ts`

3. **Hook useForm wrapper**
   - Créer `src/hooks/useFormValidation.ts`
   - Intégrer Zod resolver
   - Gérer erreurs i18n (français)

4. **Mise à jour formulaires**
   - PatientRegisterPage
   - MedicRegisterPage
   - AddPatientModal
   - EditPatientModal
   - LoginPage
   - ResetPasswordPage

5. **Messages d'erreur**
   - Créer `src/constants/errorMessages.ts`
   - Mapping erreurs serveur → messages user-friendly
   - Affichage erreurs inline + accessibles

6. **Tests**
   - Test validation côté client
   - Test validation côté serveur
   - Test messages d'erreur

#### Critères d'Acceptation

```
✅ Tous les formulaires ont validation Zod
✅ Messages d'erreur clairs et en français
✅ Validation temps réel (on blur)
✅ Erreurs serveur gérées
✅ Accessibilité (aria-invalid, aria-describedby)
✅ Tests unitaires validation
```

#### Estimation: 8-10 jours

---

### S1-02: Gestion Erreurs Globale

**Priorité:** P0
**Complexité:** 🟡 MODÉRÉ (3-5 jours)
**Dépendances:** S1-01

#### Description
Créer système centralisé de gestion d'erreurs avec retry, fallback et logging.

#### Tâches Techniques

1. **Error Boundary**
   - Créer `src/components/ErrorBoundary.tsx`
   - Différents niveaux (page, section, global)
   - Fallback UI avec retry

2. **Error Handler Service**
   - Créer `src/services/errorHandler.ts`
   - Classifier erreurs (network, auth, validation, server)
   - Logger erreurs (console.error + monitoring)
   - Retry logic pour erreurs réseau

3. **Network Error Handling**
   - Interceptor Supabase (detect offline)
   - Queue requêtes offline
   - Retry exponentiel

4. **User Feedback**
   - Toast automatique pour erreurs
   - Messages contextuels
   - Actions correctives suggérées

5. **Monitoring Setup**
   - Intégrer Sentry (optional)
   - Custom error tracking
   - Performance monitoring

#### Critères d'Acceptation

```
✅ ErrorBoundary empêche crash app
✅ Erreurs network retry automatique
✅ User reçoit feedback clair
✅ Erreurs loggées pour debug
✅ Offline mode détecté
```

#### Estimation: 4-5 jours

---

### S1-03: Authentication Guards & Routes Protégées

**Priorité:** P0
**Complexité:** 🟡 MODÉRÉ (3-4 jours)
**Dépendances:** Aucune

#### Description
Protéger toutes les routes avec guards et gérer redirections auth.

#### Tâches Techniques

1. **Auth Context Enhanced**
   - Créer `src/contexts/AuthContext.tsx`
   - État user + loading + error
   - Fonctions login/logout/refresh
   - Auto-refresh token

2. **Protected Route Component**
   - Créer `src/components/ProtectedRoute.tsx`
   - Redirect vers /login si non auth
   - Loading state pendant check
   - Restore path après login

3. **Role-Based Access**
   - Enum roles (medic, patient, admin)
   - HOC `withRole(Component, ['medic', 'admin'])`
   - Vérification côté serveur RLS

4. **Session Management**
   - Persist session localStorage
   - Auto-logout après inactivité
   - Refresh token avant expiration
   - Logout all tabs (broadcast)

5. **Routes Update**
   - Wrapper toutes routes dashboard
   - Public routes (login, register, forgot-password)
   - Redirections appropriées

#### Critères d'Acceptation

```
✅ Routes protégées inaccessibles sans auth
✅ Redirect vers login si non auth
✅ Restore path après login
✅ Role-based access fonctionne
✅ Session persiste refresh page
✅ Auto-logout après inactivité
```

#### Estimation: 3-4 jours

---

### S1-04: Loading States Uniformes

**Priorité:** P0
**Complexité:** 🟢 FAIBLE (2-3 jours)
**Dépendances:** Aucune

#### Description
Standardiser tous les loading states pour UX cohérente.

#### Tâches Techniques

1. **LoadingSkeleton Variants**
   - Ajouter variant="table-row"
   - Ajouter variant="form"
   - Ajouter variant="modal"
   - Ajouter variant="full-page"

2. **Suspense Boundaries**
   - Page-level suspense
   - Component-level suspense
   - Fallback approprié par niveau

3. **Loading Hook**
   - Créer `src/hooks/useLoading.ts`
   - Gérer loading global
   - Spinner overlay option
   - Min display time (avoid flash)

4. **Update Composants**
   - Remplacer tous les custom loaders
   - Utiliser LoadingSkeleton partout
   - Cohérence visuelle

#### Critères d'Acceptation

```
✅ Tous les états loading utilisent LoadingSkeleton
✅ Skeleton shapes match content
✅ Pas de flash (min 300ms display)
✅ Cohérence visuelle 100%
✅ Accessibilité (aria-busy, role="status")
```

#### Estimation: 2-3 jours

---

### S1-05: Data Persistence Offline

**Priorité:** P0
**Complexité:** 🔴 ÉLEVÉ (1-2 semaines)
**Dépendances:** S1-02

#### Description
Permettre usage basique offline avec sync au retour online.

#### Tâches Techniques

1. **IndexedDB Setup**
   - Installer `idb` ou `dexie`
   - Créer schéma DB local
   - Tables: patients, appointments, consultations

2. **Offline Detection**
   - Hook `useOnlineStatus()`
   - Event listeners (online/offline)
   - Banner "Vous êtes hors ligne"

3. **Request Queue**
   - Queue mutations quand offline
   - Persist queue dans IndexedDB
   - Replay au retour online

4. **Optimistic Updates**
   - Update UI immédiatement
   - Mark données "pending sync"
   - Rollback si échec sync

5. **Conflict Resolution**
   - Last-write-wins strategy
   - Timestamp-based
   - User prompt si conflit majeur

6. **Sync Service**
   - Background sync (Service Worker)
   - Periodic sync
   - Manual refresh option

#### Critères d'Acceptation

```
✅ App utilisable offline (lecture)
✅ Mutations queueées offline
✅ Sync automatique au retour online
✅ Conflits gérés correctement
✅ User informé du statut
✅ Performance non dégradée
```

#### Estimation: 10-12 jours

---

## 🎯 SPRINT 2 - P1 HAUTE PRIORITÉ (2-3 semaines)

**Objectif:** Améliorer significativement UX et performance
**Priorité:** P1

### S2-01: Virtual Scrolling pour Listes Longues

**Priorité:** P1
**Complexité:** 🟡 MODÉRÉ (4-5 jours)
**Dépendances:** Aucune

#### Description
Implémenter virtual scrolling pour tables patients/appointments avec react-window.

#### Tâches Techniques

1. **Installation**
   ```bash
   npm install react-window react-window-infinite-loader
   ```

2. **VirtualTable Component**
   - Créer `src/components/Common/VirtualTable.tsx`
   - Props: data, columns, rowHeight, onRowClick
   - Render visible rows only

3. **Infinite Scroll**
   - Load more au scroll bottom
   - Loading indicator
   - Threshold configurable

4. **Update Tables**
   - PatientsViewPageEnhanced
   - AppointmentsViewPage
   - Maintenir features (search, filter, sort)

5. **Performance Testing**
   - Test avec 10k+ rows
   - Mesurer scroll FPS
   - Mesurer memory usage

#### Critères d'Acceptation

```
✅ Scroll fluide avec 10k+ items
✅ Memory usage constant
✅ Search/filter fonctionnent
✅ Keyboard navigation OK
✅ Accessibilité maintenue
```

#### Estimation: 4-5 jours

---

### S2-02: Dark Mode Complet

**Priorité:** P1
**Complexité:** 🟡 MODÉRÉ (3-4 jours)
**Dépendances:** Aucune

#### Description
Implémenter dark/light mode avec persist et system preference.

#### Tâches Techniques

1. **Theme System**
   - Extend ThemeContext
   - Add theme: 'light' | 'dark' | 'system'
   - Detect system preference

2. **CSS Variables**
   - Créer `src/styles/themes.css`
   - Define colors per theme
   - Update components use CSS vars

3. **Toggle Component**
   - Update ThemeToggle component
   - 3 options: light/dark/system
   - Icon animation

4. **Persist Preference**
   - localStorage 'theme'
   - Sync across tabs
   - SSR-safe

5. **Update All Components**
   - Replace hardcoded colors
   - Use CSS variables
   - Test contrast both modes

#### Critères d'Acceptation

```
✅ Toggle light/dark/system fonctionne
✅ Préférence persistée
✅ WCAG AA contrast les 2 modes
✅ Sync entre tabs
✅ SSR compatible
✅ Smooth transition
```

#### Estimation: 3-4 jours

---

### S2-03: Cache Intelligent avec React Query

**Priorité:** P1
**Complexité:** 🔴 ÉLEVÉ (1 semaine)
**Dépendances:** Aucune

#### Description
Remplacer fetches manuels par React Query pour cache optimal.

#### Tâches Techniques

1. **Installation & Setup**
   ```bash
   npm install @tanstack/react-query @tanstack/react-query-devtools
   ```
   - Setup QueryClient
   - Add QueryClientProvider
   - Configure defaults (staleTime, cacheTime)

2. **Query Hooks**
   - `src/queries/usePatients.ts`
   - `src/queries/useAppointments.ts`
   - `src/queries/useConsultations.ts`
   - `src/queries/useDashboardStats.ts`

3. **Mutation Hooks**
   - `src/mutations/useCreatePatient.ts`
   - `src/mutations/useUpdatePatient.ts`
   - `src/mutations/useDeletePatient.ts`
   - Invalidation cache après mutation

4. **Optimistic Updates**
   - Update cache before server response
   - Rollback si erreur
   - UI feedback immédiat

5. **Prefetching**
   - Prefetch au hover (patient cards)
   - Prefetch pagination next page
   - Background refetch

6. **Migration Composants**
   - Remplacer useEffect + fetch
   - Utiliser query hooks
   - Supprimer loading states manuels

#### Critères d'Acceptation

```
✅ Toutes requêtes via React Query
✅ Cache fonctionne correctement
✅ Mutations invalident cache
✅ Optimistic updates OK
✅ DevTools intégré
✅ Performance améliorée
```

#### Estimation: 7-8 jours

---

### S2-04: Keyboard Shortcuts Global

**Priorité:** P1
**Complexité:** 🟡 MODÉRÉ (3-4 jours)
**Dépendances:** Aucune

#### Description
Ajouter shortcuts clavier pour navigation et actions rapides.

#### Tâches Techniques

1. **Shortcuts Hook**
   - Créer `src/hooks/useKeyboardShortcuts.ts`
   - Detect OS (Mac/Windows)
   - Prevent conflicts

2. **Global Shortcuts**
   - `Cmd/Ctrl + K`: Global search
   - `Cmd/Ctrl + N`: New patient
   - `Cmd/Ctrl + B`: Toggle sidebar
   - `Cmd/Ctrl + ,`: Settings
   - `?`: Show shortcuts help
   - `/`: Focus search
   - `Esc`: Close modals/clear

3. **Contextual Shortcuts**
   - Table navigation (↑/↓, Enter)
   - Modal actions (Cmd+Enter = save)
   - Pagination (←/→)

4. **Help Modal**
   - Créer `src/components/ShortcutsHelp.tsx`
   - Liste tous shortcuts
   - Categorized (navigation, actions, etc)
   - Search shortcuts

5. **Visual Hints**
   - Show shortcut in tooltips
   - Keyboard icon + key combo
   - Animated hint on first use

#### Critères d'Acceptation

```
✅ Shortcuts fonctionnent cross-platform
✅ Pas de conflits avec browser
✅ Help modal accessible (?)
✅ Visual hints sur boutons
✅ Accessibilité maintenue
```

#### Estimation: 3-4 jours

---

### S2-05: Notifications Push/Email

**Priorité:** P1
**Complexité:** 🔴 ÉLEVÉ (1-2 semaines)
**Dépendances:** Aucune

#### Description
Système de notifications push + email pour événements importants.

#### Tâches Techniques

1. **Email Service (Supabase Edge Function)**
   - Setup SMTP (SendGrid/Mailgun)
   - Templates emails (appointment reminder, etc)
   - Queue email sending

2. **Notification Types**
   - Appointment reminder (24h avant)
   - New patient assigned
   - Lab results ready
   - Prescription renewal due

3. **User Preferences**
   - Table `notification_preferences`
   - UI pour gérer préférences
   - Opt-in/opt-out par type

4. **Push Notifications (Web)**
   - Service Worker setup
   - Push subscription
   - FCM/Web Push API
   - Permission request

5. **Scheduling**
   - Supabase Cron jobs
   - Check upcoming appointments
   - Send reminders

6. **In-App Notifications**
   - NotificationBell update
   - Real-time via Supabase subscriptions
   - Mark as read
   - History

#### Critères d'Acceptation

```
✅ Emails envoyés correctement
✅ Push notifications fonctionnent
✅ User peut gérer préférences
✅ Reminders envoyés à temps
✅ Unsubscribe fonctionne
✅ RGPD compliant
```

#### Estimation: 10-14 jours

---

## 🎨 SPRINT 3 - P2 MOYENNE PRIORITÉ (2-3 semaines)

### S3-01: Export CSV/PDF

**Priorité:** P2
**Complexité:** 🟡 MODÉRÉ (4-5 jours)
**Dépendances:** Aucune

#### Description
Permettre export données patients/appointments en CSV et PDF.

#### Tâches Techniques

1. **CSV Export**
   - Installer `papaparse` ou native
   - Export patients list
   - Export appointments list
   - Include filters applied

2. **PDF Export**
   - Installer `jspdf` + `jspdf-autotable`
   - Patient detail PDF
   - Appointment summary PDF
   - Logo + branding

3. **ExportButton Component**
   - Already exists, add functionality
   - Format selector (CSV/PDF)
   - Progress indicator
   - Download trigger

4. **Server-Side Generation**
   - Edge Function pour large exports
   - Streaming pour big datasets
   - Email PDF si trop lourd

5. **Templates**
   - PDF template patient report
   - PDF template appointment list
   - Customizable header/footer

#### Critères d'Acceptation

```
✅ CSV export fonctionne
✅ PDF généré correctement
✅ Large datasets gérés
✅ Templates professionnels
✅ Download automatique
```

#### Estimation: 4-5 jours

---

### S3-02: Bulk Actions

**Priorité:** P2
**Complexité:** 🟡 MODÉRÉ (4-5 jours)
**Dépendances:** Aucune

#### Description
Permettre actions sur plusieurs items simultanément.

#### Tâches Techniques

1. **Selection System**
   - Checkbox per row
   - Select all checkbox
   - Shift-click range select
   - Keyboard selection (Shift+↑/↓)

2. **Bulk Actions Bar**
   - Floating bar avec count
   - Actions: Delete, Export, Update Status
   - Confirmation pour actions destructives

3. **Backend Mutations**
   - Bulk delete patients
   - Bulk update status
   - Transaction pour consistency

4. **Progress Feedback**
   - Progress bar pour bulk operations
   - Success/error count
   - Detailed results

5. **Undo Support**
   - Undo bulk delete (30s window)
   - Store deleted items temp
   - Toast avec undo button

#### Critères d'Acceptation

```
✅ Selection multiple fonctionne
✅ Bulk actions s'exécutent
✅ Progress visible
✅ Undo fonctionne
✅ Errors gérées
```

#### Estimation: 4-5 jours

---

### S3-03: Advanced Filters Saved

**Priorité:** P2
**Complexité:** 🟡 MODÉRÉ (3-4 jours)
**Dépendances:** S2-03 (React Query)

#### Description
Sauvegarder filtres personnalisés et les réutiliser.

#### Tâches Techniques

1. **Saved Filters Table**
   ```sql
   CREATE TABLE saved_filters (
     id uuid PRIMARY KEY,
     user_id uuid REFERENCES medics(id),
     name text NOT NULL,
     filters jsonb NOT NULL,
     is_default boolean DEFAULT false,
     created_at timestamptz DEFAULT now()
   );
   ```

2. **UI Saved Filters**
   - Dropdown "Mes filtres"
   - Save current filters button
   - Edit/delete saved filters
   - Set as default

3. **Apply Filter**
   - One-click apply
   - Show active saved filter
   - Modify + save as new

4. **Share Filters**
   - Share URL avec filtres
   - Copy link button
   - Parse URL params on load

#### Critères d'Acceptation

```
✅ Filtres sauvegardés persistent
✅ Apply en 1 clic
✅ Edit/delete fonctionnent
✅ Partage URL fonctionne
✅ Default filter applied on load
```

#### Estimation: 3-4 jours

---

### S3-04: Dashboard Customizable

**Priorité:** P2
**Complexité:** 🔴 ÉLEVÉ (1-2 semaines)
**Dépendances:** Aucune

#### Description
Permettre user de customiser layout et widgets dashboard.

#### Tâches Techniques

1. **Drag & Drop System**
   - Installer `react-beautiful-dnd` ou `@dnd-kit`
   - Grid layout avec zones drop
   - Drag widgets entre zones

2. **Widget Registry**
   - Config widgets disponibles
   - Props par widget
   - Enable/disable widgets

3. **Layout Persistence**
   - Table `dashboard_layouts`
   - Save layout per user
   - Default layout si new user

4. **Widget Marketplace**
   - List widgets disponibles
   - Add/remove widgets
   - Preview widget

5. **Layout Templates**
   - Templates pré-définis
   - "Medical", "Stats", "Compact"
   - One-click apply

#### Critères d'Acceptation

```
✅ Drag & drop fonctionne
✅ Layout persiste
✅ Add/remove widgets
✅ Templates disponibles
✅ Responsive layout
```

#### Estimation: 10-12 jours

---

### S3-05: Consultation Notes Rich Text

**Priorité:** P2
**Complexité:** 🟡 MODÉRÉ (4-5 jours)
**Dépendances:** Aucune

#### Description
Éditeur rich text pour notes consultation avec formatting.

#### Tâches Techniques

1. **Rich Text Editor**
   - Installer `@tiptap/react` ou `slate`
   - Toolbar (bold, italic, lists, etc)
   - Markdown support

2. **Features**
   - Text formatting (bold, italic, underline)
   - Lists (ordered, unordered)
   - Headings
   - Links
   - Tables (optional)
   - Images (optional)

3. **Templates**
   - Note templates
   - Prescription template
   - Lab report template
   - Quick insert

4. **Auto-save**
   - Draft save every 30s
   - Conflict detection
   - Version history

5. **Export**
   - Export to PDF
   - Export to Word (optional)
   - Print formatting

#### Critères d'Acceptation

```
✅ Formatting fonctionne
✅ Templates disponibles
✅ Auto-save fonctionne
✅ Export PDF OK
✅ Accessibilité maintenue
```

#### Estimation: 4-5 jours

---

## 💎 SPRINT 4 - P3 POLISH (1-2 semaines)

### S4-01: Animations & Micro-interactions

**Priorité:** P3
**Complexité:** 🟡 MODÉRÉ (4-5 jours)
**Dépendances:** Aucune

#### Description
Ajouter animations polish et micro-interactions pour UX premium.

#### Tâches Techniques

1. **Animation Library**
   - Installer `framer-motion`
   - Setup AnimatePresence
   - Default transitions

2. **Page Transitions**
   - Fade in/out entre pages
   - Slide pour modals
   - Scale pour popovers

3. **Micro-interactions**
   - Button hover/active states
   - Card hover lift
   - Input focus glow
   - Checkbox/toggle animations
   - Success checkmark animation

4. **Loading Animations**
   - Skeleton shimmer
   - Spinner smooth
   - Progress bar animation

5. **Performance**
   - Use transform/opacity only
   - GPU acceleration
   - Respect prefers-reduced-motion

#### Critères d'Acceptation

```
✅ Animations smooth (60 FPS)
✅ Pas de jank
✅ Reduced motion respecté
✅ Performance non dégradée
✅ Cohérence visuelle
```

#### Estimation: 4-5 jours

---

### S4-02: Onboarding Flow

**Priorité:** P3
**Complexité:** 🟡 MODÉRÉ (3-4 jours)
**Dépendances:** Aucune

#### Description
Créer onboarding pour nouveaux users avec tour guidé.

#### Tâches Techniques

1. **Tour Library**
   - Installer `react-joyride` ou custom
   - Steps définition
   - Spotlight sur éléments

2. **Tour Steps**
   - Welcome modal
   - Dashboard overview
   - Navigation explication
   - Key features highlight
   - First action (create patient)

3. **Progress Tracking**
   - Table `onboarding_progress`
   - Mark steps completed
   - Resume tour option

4. **Skip/Replay**
   - Skip tour button
   - Replay from settings
   - "Show tips" toggle

5. **Contextual Help**
   - Tooltips sur première visite
   - Help icon avec tips
   - Video tutorials links

#### Critères d'Acceptation

```
✅ Tour fonctionne sans bug
✅ Can skip/replay
✅ Progress tracked
✅ Contextual help utile
✅ Non-intrusif
```

#### Estimation: 3-4 jours

---

### S4-03: Advanced Analytics

**Priorité:** P3
**Complexité:** 🔴 ÉLEVÉ (1 semaine)
**Dépendances:** S2-03 (React Query)

#### Description
Dashboard analytics avancé avec KPIs et insights.

#### Tâches Techniques

1. **KPIs Calculation**
   - Patient retention rate
   - Appointment no-show rate
   - Average consultation time
   - Revenue per patient
   - Growth trends

2. **Advanced Charts**
   - Funnel chart (patient journey)
   - Cohort analysis
   - Heatmap (appointments by day/hour)
   - Geo map (patients by location)

3. **Filters & Drill-down**
   - Date range selector
   - Compare periods
   - Filter by medic
   - Drill-down to details

4. **Export Reports**
   - PDF executive summary
   - CSV raw data
   - Scheduled reports (email)

5. **Insights AI (Optional)**
   - Auto-detect trends
   - Anomaly detection
   - Recommendations

#### Critères d'Acceptation

```
✅ KPIs calculés correctement
✅ Charts interactifs
✅ Filters fonctionnent
✅ Export fonctionne
✅ Performance OK (large datasets)
```

#### Estimation: 7-8 jours

---

### S4-04: Multi-language Support

**Priorité:** P3
**Complexité:** 🔴 ÉLEVÉ (1-2 semaines)
**Dépendances:** Aucune

#### Description
Internationalisation de l'app (français, anglais, espagnol).

#### Tâches Techniques

1. **i18n Setup**
   - Installer `react-i18next`
   - Setup i18n config
   - Language detector

2. **Translation Files**
   - `src/locales/fr/translation.json`
   - `src/locales/en/translation.json`
   - `src/locales/es/translation.json`

3. **Extract Strings**
   - Replace hardcoded text
   - Use t() function
   - Handle plurals
   - Handle interpolation

4. **Language Selector**
   - Dropdown in header
   - Persist preference
   - Fallback to browser lang

5. **RTL Support (Optional)**
   - Setup RTL CSS
   - Mirror layouts
   - Test with Arabic

6. **Date/Number Formatting**
   - Use Intl API
   - Format per locale
   - Timezone handling

#### Critères d'Acceptation

```
✅ 3 langues disponibles
✅ Switch langue fonctionne
✅ Préférence persistée
✅ Date/numbers formatted
✅ 100% strings translated
✅ No hardcoded text
```

#### Estimation: 10-14 jours

---

### S4-05: Print Styles

**Priorité:** P3
**Complexité:** 🟢 FAIBLE (2-3 jours)
**Dépendances:** Aucune

#### Description
Optimiser layouts pour impression (patient reports, etc).

#### Tâches Techniques

1. **Print CSS**
   - Créer `src/styles/print.css`
   - Hide navigation/sidebar
   - Optimize page breaks
   - Black & white friendly

2. **Print Button**
   - Add print icon
   - Print preview
   - Page setup dialog

3. **Printable Layouts**
   - Patient detail view
   - Appointment list
   - Consultation notes
   - Lab reports

4. **QR Codes (Optional)**
   - Generate QR for patient ID
   - Include on printed reports
   - Scan to view online

#### Critères d'Acceptation

```
✅ Print layout propre
✅ No broken content
✅ Page breaks optimaux
✅ QR codes fonctionnent
✅ B&W readable
```

#### Estimation: 2-3 jours

---

## 🔮 BACKLOG - FUTURES FEATURES

### Feature Ideas (Non prioritisé)

| ID | Feature | Complexité | Valeur Business |
|----|---------|------------|-----------------|
| B-01 | Video Consultations | 🔴 Élevé | Haute |
| B-02 | Prescription Management | 🔴 Élevé | Haute |
| B-03 | Lab Integration | 🔴 Élevé | Moyenne |
| B-04 | Appointment SMS Reminders | 🟡 Modéré | Haute |
| B-05 | Medical History Timeline | 🟡 Modéré | Moyenne |
| B-06 | Drug Interaction Checker | 🔴 Élevé | Haute |
| B-07 | Insurance Management | 🔴 Élevé | Moyenne |
| B-08 | Billing & Invoicing | 🔴 Élevé | Haute |
| B-09 | Document Upload/Management | 🟡 Modéré | Moyenne |
| B-10 | Appointment Scheduling AI | 🔴 Élevé | Moyenne |

---

## 📊 RÉSUMÉ PAR SPRINT

### Sprint 0 (Complété)
- **Durée:** 2 semaines
- **Tâches:** 15
- **Complexité totale:** ~25 jours-personne
- **Status:** ✅ 100%

### Sprint 1 (P0 - Critiques)
- **Durée:** 2 semaines
- **Tâches:** 5
- **Complexité totale:** ~30 jours-personne
- **Team:** 2-3 devs recommandé

### Sprint 2 (P1 - Haute)
- **Durée:** 2-3 semaines
- **Tâches:** 5
- **Complexité totale:** ~35 jours-personne
- **Team:** 2-3 devs recommandé

### Sprint 3 (P2 - Moyenne)
- **Durée:** 2-3 semaines
- **Tâches:** 5
- **Complexité totale:** ~30 jours-personne
- **Team:** 2-3 devs recommandé

### Sprint 4 (P3 - Polish)
- **Durée:** 1-2 semaines
- **Tâches:** 5
- **Complexité totale:** ~25 jours-personne
- **Team:** 2 devs recommandé

---

## 📈 TIMELINE GLOBALE

```
Sprint 0: ████████████████ (Complété) ✅
          ↓
Sprint 1: ████████████████ (2 semaines)
          ↓
Sprint 2: ████████████████████ (2-3 semaines)
          ↓
Sprint 3: ████████████████████ (2-3 semaines)
          ↓
Sprint 4: ████████████ (1-2 semaines)
          ↓
        PRODUCTION READY 🚀

Total: ~12-16 semaines (3-4 mois)
```

---

## 🎯 PRIORISATION RECOMMANDÉE

### Must Have (Phase 1)
```
✅ Sprint 0 (Complété)
→ Sprint 1: S1-01, S1-02, S1-03, S1-04
→ Sprint 2: S2-03 (React Query)
```

### Should Have (Phase 2)
```
→ Sprint 1: S1-05 (Offline)
→ Sprint 2: S2-01, S2-02, S2-04
```

### Nice to Have (Phase 3)
```
→ Sprint 2: S2-05 (Notifications)
→ Sprint 3: All tasks
→ Sprint 4: All tasks
```

---

**Dernière mise à jour:** 2025-11-02
**Version:** 1.0
**Status:** ✅ Complet et prêt pour planification
