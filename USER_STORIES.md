# 📖 USER STORIES & CRITÈRES D'ACCEPTATION

Documentation complète des user stories avec critères d'acceptation métiers et techniques.

**Date:** 2025-11-02
**Version:** 1.0

---

## 📋 TABLE DES MATIÈRES

1. [Template User Story](#template-user-story)
2. [Sprint 1 - P0 Critiques](#sprint-1---p0-critiques)
3. [Sprint 2 - P1 Haute Priorité](#sprint-2---p1-haute-priorité)
4. [Sprint 3 - P2 Moyenne Priorité](#sprint-3---p2-moyenne-priorité)
5. [Sprint 4 - P3 Polish](#sprint-4---p3-polish)

---

## 📝 TEMPLATE USER STORY

```
ID: US-{SPRINT}-{NUMBER}
TITRE: {Titre court descriptif}
PRIORITÉ: {P0/P1/P2/P3}
COMPLEXITÉ: {🟢/🟡/🔴}
ESTIMATION: {X-Y jours}

EN TANT QUE {rôle/persona}
JE VEUX {action/fonctionnalité}
AFIN DE {bénéfice/valeur métier}

CONTEXTE MÉTIER:
{Pourquoi cette fonctionnalité est importante}

CRITÈRES D'ACCEPTATION MÉTIERS:
✅ {Critère business 1}
✅ {Critère business 2}
✅ {Critère business 3}

CRITÈRES D'ACCEPTATION TECHNIQUES:
✅ {Critère technique 1}
✅ {Critère technique 2}
✅ {Critère technique 3}

SCÉNARIOS DE TEST:
Scenario 1: {Happy path}
GIVEN {condition initiale}
WHEN {action}
THEN {résultat attendu}

Scenario 2: {Edge case}
GIVEN {condition}
WHEN {action}
THEN {résultat}

DÉPENDANCES:
- Dépend de: {US-XX-XX}
- Bloque: {US-XX-XX}

NOTES TECHNIQUES:
{Détails d'implémentation, contraintes, etc.}
```

---

## 🚀 SPRINT 1 - P0 CRITIQUES

### US-S1-01: Validation des Formulaires

```
ID: US-S1-01
TITRE: Validation complète des formulaires avec feedback utilisateur
PRIORITÉ: P0 - CRITIQUE
COMPLEXITÉ: 🔴 ÉLEVÉ
ESTIMATION: 8-10 jours
```

**EN TANT QUE** médecin utilisateur de l'application
**JE VEUX** que tous mes formulaires valident les données en temps réel avec des messages clairs
**AFIN DE** éviter les erreurs de saisie et garantir l'intégrité des données patients

**CONTEXTE MÉTIER:**
Les erreurs de saisie dans les dossiers médicaux peuvent avoir des conséquences graves (mauvais dosage, allergies non détectées, contacts incorrects). Une validation robuste protège les patients et améliore la qualité des soins.

**CRITÈRES D'ACCEPTATION MÉTIERS:**

✅ **CAM-01:** Impossible de soumettre un formulaire avec des données invalides
✅ **CAM-02:** Les erreurs sont affichées en français clair et compréhensible
✅ **CAM-03:** La validation se fait en temps réel (on blur) pour un feedback immédiat
✅ **CAM-04:** Les champs obligatoires sont clairement marqués avec un astérisque rouge
✅ **CAM-05:** Les formats attendus sont indiqués (ex: "06 12 34 56 78" pour téléphone)
✅ **CAM-06:** Un résumé des erreurs est affiché en haut du formulaire si > 3 erreurs

**CRITÈRES D'ACCEPTATION TECHNIQUES:**

✅ **CAT-01:** Utilisation de Zod pour la validation des schémas
✅ **CAT-02:** Intégration avec React Hook Form pour la gestion des états
✅ **CAT-03:** Types TypeScript générés automatiquement depuis les schémas Zod
✅ **CAT-04:** Validation synchrone côté client (<100ms)
✅ **CAT-05:** Validation asynchrone côté serveur pour les vérifications DB (email unique)
✅ **CAT-06:** Erreurs serveur mappées vers messages user-friendly
✅ **CAT-07:** Accessibilité WCAG AA (aria-invalid, aria-describedby, role="alert")
✅ **CAT-08:** Pas de console.error en production
✅ **CAT-09:** Tests unitaires pour chaque règle de validation
✅ **CAT-10:** Performance: validation <100ms même avec 20+ champs

**SCÉNARIOS DE TEST:**

**Scenario 1: Validation nom patient (Happy Path)**
```gherkin
GIVEN je suis sur le formulaire "Nouveau Patient"
AND le champ "Nom complet" est vide
WHEN je clique dans le champ et tape "Jean Dupont"
AND je clique en dehors du champ (blur)
THEN aucune erreur n'est affichée
AND le champ a une bordure verte
AND une icône ✓ apparaît à droite
```

**Scenario 2: Validation email invalide**
```gherkin
GIVEN je suis sur le formulaire "Nouveau Patient"
WHEN je tape "jean@invalid" dans le champ email
AND je clique en dehors du champ
THEN un message "Email invalide" apparaît en rouge sous le champ
AND le champ a une bordure rouge
AND l'attribut aria-invalid="true" est présent
AND le bouton "Créer" reste désactivé
```

**Scenario 3: Validation téléphone français**
```gherkin
GIVEN je suis sur le formulaire "Nouveau Patient"
WHEN je tape "123" dans le champ téléphone
AND je clique en dehors du champ
THEN un message "Format: 06 12 34 56 78" apparaît
AND le champ a une bordure rouge
WHEN je corrige en "06 12 34 56 78"
THEN le message d'erreur disparaît
AND le champ passe en vert
```

**Scenario 4: Tentative de soumission avec erreurs**
```gherkin
GIVEN je suis sur le formulaire avec 5 champs invalides
WHEN je clique sur "Créer le patient"
THEN le formulaire ne se soumet pas
AND un encadré rouge apparaît en haut: "5 erreurs à corriger"
AND la page scroll vers la première erreur
AND un son d'erreur est joué (optionnel, désactivable)
```

**Scenario 5: Validation asynchrone (email déjà existant)**
```gherkin
GIVEN je suis sur le formulaire "Nouveau Patient"
WHEN je tape "jean@existing.fr" (déjà dans la DB)
AND je clique en dehors du champ
THEN un spinner apparaît pendant 500ms
THEN un message "Cet email est déjà utilisé" apparaît
AND un lien "Voir le patient →" est proposé
```

**DÉPENDANCES:**
- Dépend de: Aucune
- Bloque: US-S1-02 (Gestion erreurs globale)

**NOTES TECHNIQUES:**
```typescript
// Exemple schéma Zod
import { z } from 'zod';

export const patientSchema = z.object({
  name: z.string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),

  email: z.string()
    .email("Email invalide")
    .refine(async (email) => {
      // Vérification DB
      const exists = await checkEmailExists(email);
      return !exists;
    }, "Cet email est déjà utilisé"),

  phone: z.string()
    .regex(
      /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
      "Format invalide. Ex: 06 12 34 56 78"
    ),

  birthDate: z.date()
    .max(new Date(), "La date de naissance ne peut pas être dans le futur")
    .refine((date) => {
      const age = (new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365);
      return age < 150;
    }, "Âge non réaliste"),
});

export type PatientInput = z.infer<typeof patientSchema>;
```

---

### US-S1-02: Gestion des Erreurs Globale

```
ID: US-S1-02
TITRE: Système centralisé de gestion d'erreurs avec retry et feedback
PRIORITÉ: P0 - CRITIQUE
COMPLEXITÉ: 🟡 MODÉRÉ
ESTIMATION: 4-5 jours
```

**EN TANT QUE** médecin utilisant l'application
**JE VEUX** être informé clairement quand une erreur se produit et avoir des actions correctives suggérées
**AFIN DE** ne pas perdre mon travail et comprendre ce qui s'est passé

**CONTEXTE MÉTIER:**
Les erreurs réseau, serveur ou de validation peuvent faire perdre des données importantes (notes de consultation, prescriptions). Un système robuste évite la frustration et la perte de temps.

**CRITÈRES D'ACCEPTATION MÉTIERS:**

✅ **CAM-01:** Chaque erreur affiche un message compréhensible en français (pas de "Error 500")
✅ **CAM-02:** Les actions correctives sont suggérées ("Vérifiez votre connexion internet")
✅ **CAM-03:** Les erreurs réseau tentent un retry automatique (3 fois max, exponentiel)
✅ **CAM-04:** Un mode "hors ligne" détecté affiche un banner permanent
✅ **CAM-05:** Les données saisies sont préservées même après une erreur
✅ **CAM-06:** Un bouton "Réessayer" est proposé pour les erreurs temporaires

**CRITÈRES D'ACCEPTATION TECHNIQUES:**

✅ **CAT-01:** ErrorBoundary React à 3 niveaux (global, page, section)
✅ **CAT-02:** Service ErrorHandler centralisé pour classifier les erreurs
✅ **CAT-03:** Retry avec backoff exponentiel (1s, 2s, 4s)
✅ **CAT-04:** Logging des erreurs avec stack trace (console + monitoring)
✅ **CAT-05:** Toast automatique pour erreurs non-critiques
✅ **CAT-06:** Modal pour erreurs critiques (perte de connexion, auth expirée)
✅ **CAT-07:** Détection offline via navigator.onLine + fetch ping
✅ **CAT-08:** Queue des requêtes échouées pour replay au retour online
✅ **CAT-09:** Tests pour chaque type d'erreur (network, auth, validation, server)
✅ **CAT-10:** Sentry/monitoring intégré (optionnel)

**SCÉNARIOS DE TEST:**

**Scenario 1: Erreur réseau temporaire avec retry**
```gherkin
GIVEN je suis en train de créer un patient
AND ma connexion internet est instable
WHEN je clique sur "Créer le patient"
AND la requête échoue (network error)
THEN un toast "Connexion instable, nouvelle tentative..." apparaît
AND un retry automatique se lance après 1s
AND si ça échoue, retry après 2s
AND si ça échoue, retry après 4s
AND si échec final, toast "Impossible de se connecter. Réessayez."
AND un bouton [Réessayer] est disponible
```

**Scenario 2: Mode hors ligne détecté**
```gherkin
GIVEN je suis sur l'application
WHEN ma connexion internet se coupe
THEN un banner jaune apparaît en haut: "Vous êtes hors ligne. Les modifications seront synchronisées au retour de la connexion."
AND toutes les mutations sont mises en queue
AND l'interface reste utilisable (lecture des données en cache)
WHEN la connexion revient
THEN le banner devient vert: "Connexion rétablie. Synchronisation en cours..."
AND les mutations en queue sont rejouées
AND le banner disparaît après 3s
```

**Scenario 3: Erreur serveur 500**
```gherkin
GIVEN je suis sur le dashboard
WHEN le serveur retourne une erreur 500
THEN un toast rouge apparaît: "Le serveur rencontre un problème. Veuillez réessayer dans quelques instants."
AND l'erreur est loggée avec timestamp + contexte
AND un bouton [Réessayer] est proposé
AND un lien [Signaler le problème] est disponible
```

**Scenario 4: Token expiré (401)**
```gherkin
GIVEN je suis connecté depuis 24h
AND mon token a expiré
WHEN je fais une action nécessitant auth
THEN une modal apparaît: "Votre session a expiré"
AND un bouton [Se reconnecter] est proposé
AND mon travail en cours est sauvegardé en localStorage
WHEN je me reconnecte
THEN je suis redirigé vers la page où j'étais
AND mes données non sauvegardées sont restaurées
```

**Scenario 5: Erreur inattendue (bug dans le code)**
```gherkin
GIVEN je suis sur l'application
WHEN une erreur JavaScript non gérée se produit
THEN l'ErrorBoundary attrape l'erreur
AND une page d'erreur friendly s'affiche avec un logo triste
AND un message: "Oups, quelque chose s'est mal passé"
AND un bouton [Recharger la page]
AND un bouton [Retour au dashboard]
AND l'erreur est envoyée à Sentry avec stack trace
```

**DÉPENDANCES:**
- Dépend de: US-S1-01 (Validation formulaires)
- Bloque: US-S1-05 (Offline mode)

**NOTES TECHNIQUES:**
```typescript
// ErrorHandler Service
export class ErrorHandler {
  static classify(error: Error): ErrorType {
    if (error instanceof NetworkError) return 'network';
    if (error instanceof AuthError) return 'auth';
    if (error instanceof ValidationError) return 'validation';
    if (error instanceof ServerError) return 'server';
    return 'unknown';
  }

  static async handle(error: Error, context: ErrorContext) {
    const type = this.classify(error);

    // Log
    console.error('[ErrorHandler]', { type, error, context });

    // Monitor
    if (config.monitoring) {
      Sentry.captureException(error, { contexts: { custom: context } });
    }

    // User feedback
    const message = this.getUserMessage(type, error);
    const action = this.getSuggestedAction(type);

    if (this.isCritical(type)) {
      showModal({ type, message, action });
    } else {
      showToast({ type, message, action });
    }

    // Retry logic
    if (this.shouldRetry(type)) {
      return this.retryWithBackoff(context.request, context.retryCount);
    }
  }

  static async retryWithBackoff(request: Request, retryCount = 0) {
    if (retryCount >= 3) throw new Error('Max retries exceeded');

    const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
    await sleep(delay);

    try {
      return await fetch(request);
    } catch (error) {
      return this.retryWithBackoff(request, retryCount + 1);
    }
  }
}
```

---

### US-S1-03: Authentication Guards & Routes Protégées

```
ID: US-S1-03
TITRE: Protection des routes et gestion de session sécurisée
PRIORITÉ: P0 - CRITIQUE
COMPLEXITÉ: 🟡 MODÉRÉ
ESTIMATION: 3-4 jours
```

**EN TANT QUE** administrateur système
**JE VEUX** que seuls les utilisateurs authentifiés et autorisés puissent accéder aux pages sensibles
**AFIN DE** protéger les données médicales confidentielles et respecter le RGPD

**CONTEXTE MÉTIER:**
Les dossiers médicaux contiennent des données sensibles (diagnostic, traitements, allergies). L'accès non autorisé est une violation du secret médical et peut entraîner des poursuites légales. La sécurité est une obligation réglementaire (RGPD, CNIL).

**CRITÈRES D'ACCEPTATION MÉTIERS:**

✅ **CAM-01:** Un utilisateur non connecté ne peut accéder à aucune page privée
✅ **CAM-02:** Après connexion, l'utilisateur est redirigé vers la page qu'il tentait d'accéder
✅ **CAM-03:** Un médecin ne peut voir que ses propres patients (sauf admin)
✅ **CAM-04:** La session expire après 8h d'inactivité pour raisons de sécurité
✅ **CAM-05:** Une déconnexion sur un onglet déconnecte tous les onglets ouverts
✅ **CAM-06:** Un warning apparaît 5 min avant l'expiration de session

**CRITÈRES D'ACCEPTATION TECHNIQUES:**

✅ **CAT-01:** ProtectedRoute wrapper pour toutes les routes privées
✅ **CAT-02:** AuthContext avec user, loading, error states
✅ **CAT-03:** Token JWT stocké dans localStorage avec expiration
✅ **CAT-04:** Refresh token automatique 5 min avant expiration
✅ **CAT-05:** RLS (Row Level Security) Supabase pour protection DB
✅ **CAT-06:** Vérification role-based (medic, patient, admin)
✅ **CAT-07:** Broadcast Channel pour sync logout multi-tabs
✅ **CAT-08:** Idle detection (8h inactivité = auto logout)
✅ **CAT-09:** Redirect vers login avec `?redirect=/previous-path`
✅ **CAT-10:** Tests E2E pour chaque scénario d'auth

**SCÉNARIOS DE TEST:**

**Scenario 1: Accès non authentifié redirigé**
```gherkin
GIVEN je ne suis pas connecté
WHEN je tape l'URL "/dashboard" dans le navigateur
THEN je suis immédiatement redirigé vers "/login"
AND l'URL devient "/login?redirect=/dashboard"
AND un message "Veuillez vous connecter" apparaît
```

**Scenario 2: Connexion réussie avec redirection**
```gherkin
GIVEN je suis sur "/login?redirect=/patients"
WHEN je saisis mes identifiants corrects
AND je clique sur "Se connecter"
THEN je suis redirigé vers "/patients" (ma destination initiale)
AND mon token est stocké dans localStorage
AND un toast "Bienvenue Dr. Martin" apparaît
```

**Scenario 3: Token expiré auto-refresh**
```gherkin
GIVEN je suis connecté depuis 7h55
AND mon token expire dans 5 minutes
WHEN l'application détecte l'expiration proche
THEN un refresh token automatique se lance en background
AND mon token est renouvelé sans interruption
AND aucun message n'est affiché (transparent)
```

**Scenario 4: Session expirée (8h inactivité)**
```gherkin
GIVEN je suis connecté depuis 8h
AND je n'ai fait aucune action depuis 8h
WHEN le timer d'inactivité expire
THEN une modal apparaît: "Votre session a expiré"
AND je suis automatiquement déconnecté
AND redirigé vers "/login?redirect=/current-page"
AND mes données non sauvegardées sont en localStorage
```

**Scenario 5: Warning avant expiration**
```gherkin
GIVEN je suis connecté depuis 7h55
WHEN il reste 5 minutes avant expiration
THEN une modal apparaît: "Votre session expire dans 5 minutes"
AND un bouton [Rester connecté] relance le timer
AND un bouton [Se déconnecter maintenant] déconnecte
```

**Scenario 6: Déconnexion multi-tabs**
```gherkin
GIVEN je suis connecté sur 3 onglets
WHEN je clique "Déconnexion" sur l'onglet 1
THEN un Broadcast Channel envoie le signal
AND les onglets 2 et 3 reçoivent le signal
AND tous les onglets se déconnectent simultanément
AND tous redirigent vers "/login"
```

**Scenario 7: Accès role-based refusé**
```gherkin
GIVEN je suis connecté en tant que "medic" (non admin)
WHEN je tente d'accéder à "/admin/settings"
THEN je reçois une erreur 403 Forbidden
AND je suis redirigé vers "/dashboard"
AND un toast rouge: "Accès non autorisé"
```

**DÉPENDANCES:**
- Dépend de: Aucune
- Bloque: Toutes les autres user stories (sécurité)

**NOTES TECHNIQUES:**
```typescript
// ProtectedRoute Component
export function ProtectedRoute({
  children,
  roles = []
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSkeleton variant="full-page" />;

  if (!user) {
    return <Navigate to={`/login?redirect=${location.pathname}`} />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    toast.error("Accès non autorisé");
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
}

// Usage
<Route path="/dashboard" element={
  <ProtectedRoute>
    <DashboardPage />
  </ProtectedRoute>
} />

<Route path="/admin" element={
  <ProtectedRoute roles={['admin']}>
    <AdminPage />
  </ProtectedRoute>
} />

// Idle Detection
export function useIdleTimeout(timeoutMs = 8 * 60 * 60 * 1000) {
  const { logout } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout>();

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      showWarningModal({
        title: "Session expirée",
        message: "Vous allez être déconnecté pour raisons de sécurité",
        onConfirm: logout,
      });
    }, timeoutMs);
  }, [logout, timeoutMs]);

  useEffect(() => {
    // Reset on activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    resetTimer(); // Initial

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [resetTimer]);
}
```

---

### US-S1-04: Loading States Uniformes

```
ID: US-S1-04
TITRE: États de chargement cohérents dans toute l'application
PRIORITÉ: P0 - CRITIQUE
COMPLEXITÉ: 🟢 FAIBLE
ESTIMATION: 2-3 jours
```

**EN TANT QUE** utilisateur de l'application
**JE VEUX** voir un feedback visuel clair pendant le chargement des données
**AFIN DE** savoir que l'application fonctionne et ne pas cliquer plusieurs fois

**CONTEXTE MÉTIER:**
Les utilisateurs cliquent plusieurs fois si aucun feedback n'apparaît, créant des doublons et de la frustration. Un état de chargement clair améliore la perception de performance et réduit les erreurs.

**CRITÈRES D'ACCEPTATION MÉTIERS:**

✅ **CAM-01:** Chaque action async affiche un feedback visuel immédiat (<100ms)
✅ **CAM-02:** Les skeleton loaders correspondent à la structure du contenu réel
✅ **CAM-03:** Pas de "flash" de loading (minimum 300ms d'affichage)
✅ **CAM-04:** Les boutons en loading sont désactivés et montrent un spinner
✅ **CAM-05:** Le skeleton shimmer est smooth (60 FPS)
✅ **CAM-06:** Un indicateur de progression est visible pour les actions longues (>3s)

**CRITÈRES D'ACCEPTATION TECHNIQUES:**

✅ **CAT-01:** LoadingSkeleton component avec variants (table, card, form, full-page)
✅ **CAT-02:** Suspense boundaries à 3 niveaux (global, page, section)
✅ **CAT-03:** Hook useLoading pour gérer l'état global
✅ **CAT-04:** Minimum display time 300ms pour éviter flash
✅ **CAT-05:** Animation shimmer CSS (transform GPU-accelerated)
✅ **CAT-06:** Spinner SVG animé pour boutons
✅ **CAT-07:** Progress bar pour uploads/downloads
✅ **CAT-08:** Attributs ARIA (aria-busy, role="status")
✅ **CAT-09:** Tests visuels (storybook snapshots)
✅ **CAT-10:** Performance: <5ms render time skeleton

**SCÉNARIOS DE TEST:**

**Scenario 1: Loading table données patients**
```gherkin
GIVEN je suis sur la page Patients
WHEN la page charge les données
THEN un skeleton table avec 10 rows apparaît
AND chaque row a la même structure (avatar + 4 colonnes)
AND un effet shimmer anime de gauche à droite
AND le skeleton reste visible minimum 300ms
WHEN les données sont chargées
THEN le skeleton fade out (200ms)
AND les vraies données fade in (200ms)
```

**Scenario 2: Button loading sur création patient**
```gherkin
GIVEN je suis sur le formulaire Nouveau Patient
AND j'ai rempli tous les champs
WHEN je clique sur "Créer le patient"
THEN le bouton devient désactivé immédiatement
AND le texte devient "Création..."
AND un spinner blanc apparaît à gauche du texte
AND le curseur devient "not-allowed" sur hover
WHEN la création réussit (après 2s)
THEN le bouton revient à l'état normal
AND un toast success apparaît
```

**Scenario 3: Full-page loading au premier chargement**
```gherkin
GIVEN je viens de me connecter
WHEN l'app charge le dashboard pour la première fois
THEN un spinner centré avec logo apparaît
AND un texte "Chargement du dashboard..." en dessous
AND l'animation est fluide (60 FPS)
AND après 3s max, le dashboard apparaît avec transition
```

**Scenario 4: Éviter le flash de loading**
```gherkin
GIVEN je suis sur le dashboard
WHEN je charge des données qui arrivent en 50ms
THEN le skeleton n'apparaît PAS (trop rapide)
AND les données s'affichent directement
WHEN je charge des données qui arrivent en 500ms
THEN le skeleton apparaît après 100ms
AND reste visible minimum 300ms (total 400ms+)
```

**Scenario 5: Progress bar upload document**
```gherkin
GIVEN je suis sur l'upload de document patient
WHEN je sélectionne un fichier de 10 MB
AND je clique sur "Envoyer"
THEN une barre de progression apparaît
AND elle affiche "0% - 0 MB / 10 MB"
WHEN l'upload progresse
THEN la barre se remplit progressivement
AND le texte devient "45% - 4.5 MB / 10 MB"
WHEN l'upload termine
THEN la barre devient verte à 100%
AND un toast "Document envoyé avec succès" apparaît
```

**DÉPENDANCES:**
- Dépend de: Aucune
- Bloque: Aucune (amélioration UX)

**NOTES TECHNIQUES:**
```typescript
// LoadingSkeleton Component
export function LoadingSkeleton({ variant = 'card' }: Props) {
  return (
    <div
      className="animate-shimmer bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%]"
      role="status"
      aria-busy="true"
      aria-label="Chargement en cours"
    >
      {variant === 'table-row' && <TableRowSkeleton />}
      {variant === 'card' && <CardSkeleton />}
      {variant === 'form' && <FormSkeleton />}
      {variant === 'full-page' && <FullPageSkeleton />}
      <span className="sr-only">Chargement...</span>
    </div>
  );
}

// useLoading Hook
export function useLoading(minDisplayTime = 300) {
  const [isLoading, setIsLoading] = useState(false);
  const [startTime, setStartTime] = useState(0);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setStartTime(Date.now());
  }, []);

  const stopLoading = useCallback(async () => {
    const elapsed = Date.now() - startTime;
    const remaining = minDisplayTime - elapsed;

    if (remaining > 0) {
      await sleep(remaining);
    }

    setIsLoading(false);
  }, [startTime, minDisplayTime]);

  return { isLoading, startLoading, stopLoading };
}

// CSS Animation
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.animate-shimmer {
  animation: shimmer 1.5s ease-in-out infinite;
}
```

---

### US-S1-05: Data Persistence Offline

```
ID: US-S1-05
TITRE: Mode hors ligne avec synchronisation automatique
PRIORITÉ: P0 - CRITIQUE
COMPLEXITÉ: 🔴 ÉLEVÉ
ESTIMATION: 10-12 jours
```

**EN TANT QUE** médecin en déplacement (visites à domicile)
**JE VEUX** pouvoir consulter et modifier les dossiers patients même sans connexion internet
**AFIN DE** continuer à travailler normalement et synchroniser au retour de la connexion

**CONTEXTE MÉTIER:**
Les médecins font des visites à domicile dans des zones à faible connexion (campagne, hôpitaux avec mauvais réseau). Ne pas pouvoir accéder aux dossiers ou perdre des notes est inacceptable. Un mode offline garantit la continuité des soins.

**CRITÈRES D'ACCEPTATION MÉTIERS:**

✅ **CAM-01:** Toutes les données consultées récemment sont accessibles hors ligne
✅ **CAM-02:** Les modifications hors ligne sont sauvegardées localement
✅ **CAM-03:** Au retour de la connexion, synchronisation automatique sans intervention
✅ **CAM-04:** En cas de conflit, la dernière modification gagne (last-write-wins)
✅ **CAM-05:** Un indicateur visuel clair montre le statut (en ligne/hors ligne/sync en cours)
✅ **CAM-06:** Les données "pending sync" sont marquées visuellement (icône nuage grisé)

**CRITÈRES D'ACCEPTATION TECHNIQUES:**

✅ **CAT-01:** IndexedDB pour stockage local (via Dexie.js)
✅ **CAT-02:** Service Worker pour cache stratégique
✅ **CAT-03:** Queue des mutations offline dans IndexedDB
✅ **CAT-04:** Detection online/offline via navigator.onLine + ping
✅ **CAT-05:** Replay automatique de la queue au retour online
✅ **CAT-06:** Optimistic updates avec rollback si échec
✅ **CAT-07:** Conflict resolution timestamp-based
✅ **CAT-08:** Background sync API (si supporté)
✅ **CAT-09:** Tests avec Network throttling
✅ **CAT-10:** Performance: <50ms read/write IndexedDB

**SCÉNARIOS DE TEST:**

**Scenario 1: Consultation en mode offline**
```gherkin
GIVEN je suis sur la page Patients
AND j'ai consulté 10 patients aujourd'hui
WHEN ma connexion internet se coupe
THEN un banner jaune apparaît: "Mode hors ligne"
AND je peux toujours voir les 10 patients en cache
AND je peux cliquer sur un patient pour voir son dossier
AND toutes ses données (consultations, prescriptions) sont disponibles
```

**Scenario 2: Modification hors ligne et sync**
```gherkin
GIVEN je suis hors ligne
AND je consulte le dossier de Jean Dupont
WHEN je modifie ses notes de consultation
AND je clique sur "Sauvegarder"
THEN les modifications sont sauvegardées dans IndexedDB
AND une icône "☁️ Sync en attente" apparaît
AND le patient est marqué avec un badge "Non synchronisé"
WHEN ma connexion revient
THEN le banner devient vert: "Synchronisation..."
AND les modifications sont envoyées au serveur
AND l'icône devient "✓ Synchronisé"
AND le badge disparaît
```

**Scenario 3: Création patient hors ligne**
```gherkin
GIVEN je suis hors ligne
WHEN je crée un nouveau patient "Marie Martin"
AND je clique sur "Créer"
THEN le patient apparaît dans ma liste locale
AND il a un ID temporaire (temp-uuid-1234)
AND un badge "☁️ Non synchronisé"
WHEN ma connexion revient
THEN le patient est créé sur le serveur
AND reçoit un vrai UUID du serveur
AND l'ID local est remplacé
AND le badge disparaît
```

**Scenario 4: Conflit de modification**
```gherkin
GIVEN je modifie le patient Jean hors ligne (timestamp: 10:00)
AND un collègue modifie le même patient online (timestamp: 10:05)
WHEN ma connexion revient à 10:10
AND je tente de synchroniser
THEN le système détecte un conflit
AND compare les timestamps
AND la modification la plus récente (10:05) gagne
AND mes modifications (10:00) sont écrasées
AND un toast m'informe: "Données mises à jour par un collègue"
AND un lien "Voir les modifications" est proposé
```

**Scenario 5: Queue replay avec erreurs**
```gherkin
GIVEN j'ai 5 mutations en queue offline
WHEN ma connexion revient
THEN le replay commence dans l'ordre
AND la mutation 1 réussit ✓
AND la mutation 2 réussit ✓
AND la mutation 3 échoue ✗ (validation error)
THEN le replay s'arrête
AND un toast "Erreur de synchronisation" apparaît
AND un lien "Voir les détails" montre la mutation 3
AND je peux corriger ou ignorer
AND continuer le replay (mutations 4 et 5)
```

**DÉPENDANCES:**
- Dépend de: US-S1-02 (Gestion erreurs)
- Bloque: Aucune

**NOTES TECHNIQUES:**
```typescript
// IndexedDB Schema
import Dexie, { Table } from 'dexie';

class AppDatabase extends Dexie {
  patients!: Table<Patient>;
  consultations!: Table<Consultation>;
  mutationQueue!: Table<QueuedMutation>;

  constructor() {
    super('MedCareDB');
    this.version(1).stores({
      patients: 'id, name, email, lastModified',
      consultations: 'id, patientId, date, lastModified',
      mutationQueue: '++id, type, timestamp, status',
    });
  }
}

export const db = new AppDatabase();

// Offline Detector
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      // Verify with ping
      fetch('/api/ping', { method: 'HEAD' })
        .then(() => setIsOnline(true))
        .catch(() => setIsOnline(false));
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check every 30s
    const interval = setInterval(handleOnline, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return isOnline;
}

// Mutation Queue
export async function queueMutation(mutation: Mutation) {
  await db.mutationQueue.add({
    type: mutation.type,
    data: mutation.data,
    timestamp: Date.now(),
    status: 'pending',
  });
}

export async function replayQueue() {
  const pending = await db.mutationQueue
    .where('status')
    .equals('pending')
    .sortBy('timestamp');

  for (const mutation of pending) {
    try {
      await executeMutation(mutation);
      await db.mutationQueue.update(mutation.id!, { status: 'success' });
    } catch (error) {
      await db.mutationQueue.update(mutation.id!, {
        status: 'error',
        error: error.message
      });
      throw error; // Stop replay on error
    }
  }
}
```

---

## 🎯 SPRINT 2 - P1 HAUTE PRIORITÉ

### US-S2-01: Virtual Scrolling pour Listes Longues

```
ID: US-S2-01
TITRE: Scroll fluide pour tables avec milliers de lignes
PRIORITÉ: P1 - HAUTE
COMPLEXITÉ: 🟡 MODÉRÉ
ESTIMATION: 4-5 jours
```

**EN TANT QUE** médecin avec une base de 10,000+ patients
**JE VEUX** que ma liste de patients scrolle de manière fluide sans lag
**AFIN DE** trouver rapidement un patient et ne pas attendre le chargement

**CONTEXTE MÉTIER:**
Les grandes cliniques ont des milliers de patients. Afficher 5000 lignes DOM fait planter le navigateur (lag, freeze). Le virtual scrolling rend seulement 20-30 lignes visibles, gardant la fluidité même avec 100,000 patients.

**CRITÈRES D'ACCEPTATION MÉTIERS:**

✅ **CAM-01:** Scroll fluide à 60 FPS même avec 10,000+ patients
✅ **CAM-02:** Temps de chargement initial <1s peu importe le nombre total
✅ **CAM-03:** La recherche et le tri fonctionnent normalement
✅ **CAM-04:** Keyboard navigation (↑↓) fonctionne
✅ **CAM-05:** Le scroll bar reflète la taille réelle de la liste
✅ **CAM-06:** Pas de "saut" ou glitch visible lors du scroll

**CRITÈRES D'ACCEPTATION TECHNIQUES:**

✅ **CAT-01:** React-window ou react-virtualized pour virtual scrolling
✅ **CAT-02:** Infinite scroll avec chargement par batch (50 items)
✅ **CAT-03:** Memoization des items (React.memo)
✅ **CAT-04:** Hauteur de ligne fixe (60px) pour calcul précis
✅ **CAT-05:** Overscan de 5 items (render 5 avant + 5 après viewport)
✅ **CAT-06:** Integration avec search/filter/sort existants
✅ **CAT-07:** Accessibilité maintenue (ARIA attributes)
✅ **CAT-08:** Tests performance: 60 FPS avec 50k items
✅ **CAT-09:** Memory usage constant (<100 MB peu importe total)
✅ **CAT-10:** Support keyboard navigation

**SCÉNARIOS DE TEST:**

**Scenario 1: Scroll fluide avec 10,000 patients**
```gherkin
GIVEN j'ai 10,000 patients dans ma base
WHEN j'ouvre la page Patients
THEN la page charge en <1s
AND je vois les 20 premiers patients
AND je peux scroller vers le bas
AND le scroll est fluide (60 FPS)
AND de nouveaux patients apparaissent au fur et à mesure
AND les patients hors viewport sont unmounted (économie mémoire)
```

**Scenario 2: Infinite scroll avec loading**
```gherkin
GIVEN je suis sur la liste patients (50 chargés)
WHEN je scroll jusqu'au patient 45 (proche de la fin)
THEN un loading skeleton apparaît en bas
AND 50 nouveaux patients se chargent automatiquement
AND le scroll continue sans interruption
AND le total affiché devient "Affichage 1-100 sur 10,000"
```

**Scenario 3: Recherche maintient virtual scroll**
```gherkin
GIVEN j'ai 10,000 patients
WHEN je tape "Jean" dans la recherche
THEN la liste filtre en temps réel
AND je vois "250 résultats sur 10,000"
AND les 250 résultats utilisent toujours virtual scroll
AND le scroll reste fluide
```

**Scenario 4: Keyboard navigation**
```gherkin
GIVEN je suis sur la liste patients (virtual scroll)
WHEN j'appuie sur ↓ (flèche bas)
THEN la sélection descend au patient suivant
AND si nécessaire, la liste scroll automatiquement
WHEN j'appuie sur Page Down
THEN la liste scroll de 10 items
AND la sélection suit
```

**Scenario 5: Memory usage constant**
```gherkin
GIVEN je charge la page avec 50,000 patients
WHEN je mesure l'usage mémoire (Chrome DevTools)
THEN la mémoire est ~80 MB
WHEN je scroll jusqu'au patient 25,000
AND je remesure la mémoire
THEN la mémoire est toujours ~80 MB (± 10 MB)
AND pas de memory leak
```

**DÉPENDANCES:**
- Dépend de: Aucune
- Bloque: Aucune

**NOTES TECHNIQUES:**
```typescript
// VirtualTable Component
import { FixedSizeList } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';

export function VirtualTable({ data, loadMore, hasMore }: Props) {
  const itemCount = hasMore ? data.length + 1 : data.length;

  const isItemLoaded = (index: number) => !hasMore || index < data.length;

  const Row = memo(({ index, style }: { index: number; style: React.CSSProperties }) => {
    if (!isItemLoaded(index)) {
      return <LoadingSkeleton variant="table-row" style={style} />;
    }

    const patient = data[index];
    return (
      <PatientRow
        patient={patient}
        style={style}
        onClick={() => handleClick(patient)}
      />
    );
  });

  return (
    <InfiniteLoader
      isItemLoaded={isItemLoaded}
      itemCount={itemCount}
      loadMoreItems={loadMore}
    >
      {({ onItemsRendered, ref }) => (
        <FixedSizeList
          height={800}
          itemCount={itemCount}
          itemSize={60}
          width="100%"
          onItemsRendered={onItemsRendered}
          ref={ref}
          overscanCount={5}
        >
          {Row}
        </FixedSizeList>
      )}
    </InfiniteLoader>
  );
}

// Performance measurement
function measureScrollPerformance() {
  let frameCount = 0;
  let lastTime = performance.now();

  function countFrame() {
    frameCount++;
    const now = performance.now();

    if (now - lastTime >= 1000) {
      console.log(`FPS: ${frameCount}`);
      frameCount = 0;
      lastTime = now;
    }

    requestAnimationFrame(countFrame);
  }

  requestAnimationFrame(countFrame);
}
```

---

## 📊 RÉSUMÉ DES USER STORIES

### Sprint 1 - P0 Critiques (5 user stories)

| ID | Titre | Estimation | Complexité |
|----|-------|-----------|------------|
| US-S1-01 | Validation Formulaires | 8-10j | 🔴 |
| US-S1-02 | Gestion Erreurs | 4-5j | 🟡 |
| US-S1-03 | Auth Guards | 3-4j | 🟡 |
| US-S1-04 | Loading States | 2-3j | 🟢 |
| US-S1-05 | Offline Mode | 10-12j | 🔴 |
| **TOTAL** | **Sprint 1** | **27-34j** | |

### Sprints Suivants (User stories à documenter)

**Sprint 2 - P1 (5 stories):**
- US-S2-01: Virtual Scrolling ✅ (documenté)
- US-S2-02: Dark Mode (à documenter)
- US-S2-03: React Query Cache (à documenter)
- US-S2-04: Keyboard Shortcuts (à documenter)
- US-S2-05: Notifications Push (à documenter)

**Sprint 3 - P2 (5 stories):**
- US-S3-01: Export CSV/PDF
- US-S3-02: Bulk Actions
- US-S3-03: Saved Filters
- US-S3-04: Dashboard Customizable
- US-S3-05: Rich Text Editor

**Sprint 4 - P3 (5 stories):**
- US-S4-01: Animations Polish
- US-S4-02: Onboarding Flow
- US-S4-03: Advanced Analytics
- US-S4-04: Multi-language i18n
- US-S4-05: Print Styles

**TOTAL PROJET: 20 user stories sur 4 sprints**

---

**Dernière mise à jour:** 2025-11-02
**Version:** 1.0
**Status:** ✅ Sprint 1 complet, Sprint 2 partiel (1/5)
