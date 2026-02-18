# 📚 DOCUMENTATION TECHNIQUE & PLAN DE TESTS

Documentation exhaustive du dataflow, logique métier, tests, et déploiement pour chaque amélioration.

**Date:** 2025-11-02
**Version:** 1.0

---

## 📋 TABLE DES MATIÈRES

1. [Structure Générale](#structure-générale)
2. [Sprint 1 - P0 Critiques](#sprint-1---p0-critiques)
3. [Sprint 2 - P1 Haute Priorité](#sprint-2---p1-haute-priorité)
4. [Plan de Tests Global](#plan-de-tests-global)
5. [Stratégie de Déploiement](#stratégie-de-déploiement)

---

## 🏗️ STRUCTURE GÉNÉRALE

### Architecture Technique

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   UI Layer   │  │  State Mgmt  │  │  Validation  │ │
│  │              │  │              │  │              │ │
│  │ - Components │  │ - Context    │  │ - Zod        │ │
│  │ - Pages      │  │ - Hooks      │  │ - RHF        │ │
│  │ - Layouts    │  │ - Cache      │  │ - Custom     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Offline    │  │    Auth      │  │   Routing    │ │
│  │              │  │              │  │              │ │
│  │ - IndexedDB  │  │ - JWT        │  │ - Protected  │ │
│  │ - Sync       │  │ - Guards     │  │ - Lazy       │ │
│  │ - Queue      │  │ - Refresh    │  │ - Suspense   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                    API LAYER                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Supabase    │  │  Edge Funcs  │  │    Cache     │ │
│  │  Client      │  │              │  │              │ │
│  │              │  │ - Auth       │  │ - React      │ │
│  │ - Auth       │  │ - CRUD       │  │   Query      │ │
│  │ - Database   │  │ - Business   │  │ - IndexedDB  │ │
│  │ - Realtime   │  │   Logic      │  │ - Service    │ │
│  │              │  │              │  │   Worker     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                    BACKEND (Supabase)                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  PostgreSQL  │  │     RLS      │  │   Storage    │ │
│  │              │  │              │  │              │ │
│  │ - Tables     │  │ - Policies   │  │ - Files      │ │
│  │ - Views      │  │ - Row Level  │  │ - Images     │ │
│  │ - Functions  │  │ - Security   │  │ - Documents  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 SPRINT 1 - P0 CRITIQUES

### US-S1-01: Validation des Formulaires

#### Dataflow Technique

```
┌─────────────────────────────────────────────────────────────┐
│                  FORM VALIDATION DATAFLOW                   │
└─────────────────────────────────────────────────────────────┘

USER INPUT
    ↓
┌───────────────┐
│ React Hook    │  1. User types in form field
│ Form (RHF)    │  2. onChange event triggered
└───────────────┘
    ↓
┌───────────────┐
│ Zod Schema    │  3. Validation schema applied (sync)
│ Validation    │  4. Check: required, format, length, etc.
└───────────────┘
    ↓
┌───────────────┐
│ Async Check   │  5. If needed: check DB (email unique)
│ (Optional)    │  6. Debounced 500ms to avoid spam
└───────────────┘
    ↓
┌───────────────┐
│ Error State   │  7. Set field error state
│ Update        │  8. Display error message
│               │  9. Disable submit button
└───────────────┘
    ↓
┌───────────────┐
│ User Corrects │  10. User fixes error
│ Input         │  11. Re-validate
└───────────────┘
    ↓
┌───────────────┐
│ Valid State   │  12. Remove error message
│               │  13. Enable submit button
│               │  14. Show success indicator (green border)
└───────────────┘
    ↓
┌───────────────┐
│ Form Submit   │  15. User clicks submit
│               │  16. Final validation
│               │  17. If valid → API call
│               │  18. If invalid → scroll to first error
└───────────────┘
```

#### Logique Métier

**Règles de Validation:**

```typescript
// 1. NOM COMPLET
- Required: Oui
- Min length: 2 caractères
- Max length: 100 caractères
- Format: Lettres, espaces, tirets, apostrophes
- Regex: /^[a-zA-ZÀ-ÿ\s'-]+$/
- Exemple valide: "Jean-Pierre O'Brien"
- Exemple invalide: "J0hn123"

// 2. EMAIL
- Required: Oui
- Format: RFC 5322 standard
- Async check: Unique dans DB (patients.email)
- Debounce: 500ms
- Exemple valide: "jean.dupont@email.fr"
- Exemple invalide: "jean@invalid"

// 3. TÉLÉPHONE (France)
- Required: Oui
- Format: 06/07 XX XX XX XX ou +33 6/7 XX XX XX XX
- Regex: /^(?:(?:\+|00)33|0)\s*[67](?:[\s.-]*\d{2}){4}$/
- Exemple valide: "06 12 34 56 78", "+33 6 12 34 56 78"
- Exemple invalide: "123", "06123456"

// 4. DATE DE NAISSANCE
- Required: Oui
- Format: Date ISO (YYYY-MM-DD)
- Min: 1900-01-01
- Max: Today
- Âge réaliste: < 150 ans
- Exemple valide: "1979-03-15"
- Exemple invalide: "2030-01-01", "1800-01-01"

// 5. ADRESSE
- Required: Non
- Max length: 200 caractères
- Format: Texte libre
- Exemple valide: "123 Rue de la Paix, 75001 Paris"

// 6. GROUPE SANGUIN
- Required: Non
- Options: A+, A-, B+, B-, AB+, AB-, O+, O-
- Exemple valide: "O+"
- Exemple invalide: "Z+"
```

#### Implémentation Technique

```typescript
// schemas/patient.schema.ts
import { z } from 'zod';

export const patientSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .regex(
      /^[a-zA-ZÀ-ÿ\s'-]+$/,
      "Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes"
    ),

  email: z
    .string()
    .email("Email invalide")
    .refine(
      async (email) => {
        const { data } = await supabase
          .from('patients')
          .select('id')
          .eq('email', email)
          .maybeSingle();
        return !data;
      },
      { message: "Cet email est déjà utilisé" }
    ),

  phone: z
    .string()
    .regex(
      /^(?:(?:\+|00)33|0)\s*[67](?:[\s.-]*\d{2}){4}$/,
      "Format invalide. Exemple: 06 12 34 56 78"
    ),

  birthDate: z
    .date()
    .max(new Date(), "La date de naissance ne peut pas être dans le futur")
    .refine(
      (date) => {
        const age = (new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365);
        return age < 150;
      },
      { message: "Âge non réaliste (maximum 150 ans)" }
    ),

  address: z.string().max(200).optional(),

  bloodType: z
    .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .optional(),
});

export type PatientInput = z.infer<typeof patientSchema>;

// components/AddPatientModal.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function AddPatientModal() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid }
  } = useForm<PatientInput>({
    resolver: zodResolver(patientSchema),
    mode: 'onBlur', // Validate on blur
  });

  const onSubmit = async (data: PatientInput) => {
    try {
      const { error } = await supabase
        .from('patients')
        .insert(data);

      if (error) throw error;

      toast.success("Patient créé avec succès");
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField
        label="Nom complet"
        required
        error={errors.name?.message}
      >
        <input
          {...register('name')}
          className={cn(
            'input',
            errors.name && 'border-red-500',
            !errors.name && 'border-green-500'
          )}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <p id="name-error" role="alert" className="text-red-500">
            {errors.name.message}
          </p>
        )}
      </FormField>

      {/* ... autres champs ... */}

      <button
        type="submit"
        disabled={!isValid || isSubmitting}
        className="btn-primary"
      >
        {isSubmitting ? 'Création...' : 'Créer le patient'}
      </button>
    </form>
  );
}
```

#### Plan de Tests

**1. Tests Unitaires (Vitest + Testing Library)**

```typescript
// __tests__/schemas/patient.schema.test.ts
import { describe, it, expect } from 'vitest';
import { patientSchema } from '@/schemas/patient.schema';

describe('Patient Schema Validation', () => {
  describe('Name validation', () => {
    it('should accept valid name', async () => {
      const result = await patientSchema.parseAsync({
        name: 'Jean Dupont',
        email: 'jean@test.fr',
        phone: '06 12 34 56 78',
        birthDate: new Date('1979-03-15'),
      });
      expect(result.name).toBe('Jean Dupont');
    });

    it('should reject name with numbers', async () => {
      await expect(
        patientSchema.parseAsync({
          name: 'Jean123',
          email: 'jean@test.fr',
          phone: '06 12 34 56 78',
          birthDate: new Date('1979-03-15'),
        })
      ).rejects.toThrow();
    });

    it('should reject name too short', async () => {
      await expect(
        patientSchema.parseAsync({
          name: 'J',
          email: 'jean@test.fr',
          phone: '06 12 34 56 78',
          birthDate: new Date('1979-03-15'),
        })
      ).rejects.toThrow();
    });
  });

  describe('Email validation', () => {
    it('should accept valid email', async () => {
      const result = await patientSchema.parseAsync({
        name: 'Jean Dupont',
        email: 'jean.dupont@email.fr',
        phone: '06 12 34 56 78',
        birthDate: new Date('1979-03-15'),
      });
      expect(result.email).toBe('jean.dupont@email.fr');
    });

    it('should reject invalid email format', async () => {
      await expect(
        patientSchema.parseAsync({
          name: 'Jean Dupont',
          email: 'invalid-email',
          phone: '06 12 34 56 78',
          birthDate: new Date('1979-03-15'),
        })
      ).rejects.toThrow();
    });
  });

  describe('Phone validation', () => {
    it('should accept valid French mobile', async () => {
      const validPhones = [
        '06 12 34 56 78',
        '07 12 34 56 78',
        '+33 6 12 34 56 78',
        '0612345678',
      ];

      for (const phone of validPhones) {
        const result = await patientSchema.parseAsync({
          name: 'Jean Dupont',
          email: 'jean@test.fr',
          phone,
          birthDate: new Date('1979-03-15'),
        });
        expect(result.phone).toBe(phone);
      }
    });

    it('should reject invalid phone formats', async () => {
      const invalidPhones = [
        '123',
        '06123456',
        '09 12 34 56 78', // landline
        '+1 555 555 5555', // US number
      ];

      for (const phone of invalidPhones) {
        await expect(
          patientSchema.parseAsync({
            name: 'Jean Dupont',
            email: 'jean@test.fr',
            phone,
            birthDate: new Date('1979-03-15'),
          })
        ).rejects.toThrow();
      }
    });
  });
});

// __tests__/components/AddPatientModal.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddPatientModal } from '@/components/AddPatientModal';

describe('AddPatientModal', () => {
  it('should show validation errors on invalid input', async () => {
    const user = userEvent.setup();
    render(<AddPatientModal isOpen onClose={vi.fn()} />);

    // Type invalid name
    const nameInput = screen.getByLabelText(/nom complet/i);
    await user.type(nameInput, 'J');
    await user.tab(); // Blur

    // Should show error
    await waitFor(() => {
      expect(
        screen.getByText(/au moins 2 caractères/i)
      ).toBeInTheDocument();
    });
  });

  it('should disable submit when form is invalid', async () => {
    render(<AddPatientModal isOpen onClose={vi.fn()} />);

    const submitButton = screen.getByRole('button', { name: /créer/i });
    expect(submitButton).toBeDisabled();
  });

  it('should submit form when all fields are valid', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<AddPatientModal isOpen onClose={onClose} />);

    // Fill valid data
    await user.type(screen.getByLabelText(/nom/i), 'Jean Dupont');
    await user.type(screen.getByLabelText(/email/i), 'jean@test.fr');
    await user.type(screen.getByLabelText(/téléphone/i), '06 12 34 56 78');
    // ... autres champs

    const submitButton = screen.getByRole('button', { name: /créer/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });
});
```

**2. Tests Edge Cases**

```typescript
describe('Edge Cases', () => {
  it('should handle special characters in name', async () => {
    const specialNames = [
      "Jean-Pierre O'Brien",
      "Marie-José D'Alembert",
      "François-Xavier",
    ];

    for (const name of specialNames) {
      const result = await patientSchema.parseAsync({
        name,
        email: 'test@test.fr',
        phone: '06 12 34 56 78',
        birthDate: new Date('1979-03-15'),
      });
      expect(result.name).toBe(name);
    }
  });

  it('should handle max age (150 years)', async () => {
    const date150YearsAgo = new Date();
    date150YearsAgo.setFullYear(date150YearsAgo.getFullYear() - 150);

    await expect(
      patientSchema.parseAsync({
        name: 'Jean Dupont',
        email: 'jean@test.fr',
        phone: '06 12 34 56 78',
        birthDate: date150YearsAgo,
      })
    ).rejects.toThrow();
  });

  it('should handle concurrent validation requests', async () => {
    // Simulate multiple users typing same email
    const promises = Array(5).fill(null).map(() =>
      patientSchema.parseAsync({
        name: 'Jean Dupont',
        email: 'duplicate@test.fr',
        phone: '06 12 34 56 78',
        birthDate: new Date('1979-03-15'),
      })
    );

    const results = await Promise.allSettled(promises);
    // At least one should succeed, others should fail with "already used"
    expect(results.some(r => r.status === 'fulfilled')).toBe(true);
  });
});
```

**3. Tests Accessibilité (WCAG AA)**

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('should have no WCAG violations', async () => {
    const { container } = render(<AddPatientModal isOpen onClose={vi.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper ARIA attributes on errors', async () => {
    const user = userEvent.setup();
    render(<AddPatientModal isOpen onClose={vi.fn()} />);

    const nameInput = screen.getByLabelText(/nom/i);
    await user.type(nameInput, 'J');
    await user.tab();

    await waitFor(() => {
      expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      expect(nameInput).toHaveAttribute('aria-describedby', 'name-error');
    });
  });

  it('should be keyboard navigable', async () => {
    const user = userEvent.setup();
    render(<AddPatientModal isOpen onClose={vi.fn()} />);

    // Tab through all fields
    await user.tab(); // Name
    expect(screen.getByLabelText(/nom/i)).toHaveFocus();

    await user.tab(); // Email
    expect(screen.getByLabelText(/email/i)).toHaveFocus();

    await user.tab(); // Phone
    expect(screen.getByLabelText(/téléphone/i)).toHaveFocus();
  });
});
```

**4. Tests Responsive**

```typescript
describe('Responsive Design', () => {
  it('should adapt to mobile viewport', () => {
    global.innerWidth = 375;
    global.innerHeight = 667;
    global.dispatchEvent(new Event('resize'));

    render(<AddPatientModal isOpen onClose={vi.fn()} />);

    const modal = screen.getByRole('dialog');
    expect(modal).toHaveClass('modal-mobile');
  });

  it('should show mobile-optimized error messages', async () => {
    global.innerWidth = 375;
    const user = userEvent.setup();
    render(<AddPatientModal isOpen onClose={vi.fn()} />);

    await user.type(screen.getByLabelText(/nom/i), 'J');
    await user.tab();

    // Mobile should show shorter error
    await waitFor(() => {
      expect(screen.getByText(/min 2 car./i)).toBeInTheDocument();
    });
  });
});
```

#### Changements Base de Données

```sql
-- Aucun changement DB nécessaire
-- Validation côté client + edge functions

-- Optionnel: Ajouter contraintes DB pour double sécurité
ALTER TABLE patients
ADD CONSTRAINT email_format_check
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE patients
ADD CONSTRAINT phone_format_check
CHECK (phone ~ '^(?:(?:\+|00)33|0)\s*[67](?:[\s.-]*\d{2}){4}$');
```

#### Plan de Merge

```bash
# 1. Feature branch
git checkout -b feature/US-S1-01-form-validation

# 2. Commits atomiques
git commit -m "feat: add Zod schemas for patient validation"
git commit -m "feat: integrate React Hook Form with validation"
git commit -m "feat: add async email uniqueness check"
git commit -m "style: add error states and success indicators"
git commit -m "test: add unit tests for validation schemas"
git commit -m "test: add component tests for AddPatientModal"
git commit -m "test: add accessibility tests"
git commit -m "docs: update validation documentation"

# 3. Pull Request
gh pr create \
  --title "feat: Form validation with Zod + React Hook Form (US-S1-01)" \
  --body "
  ## Changes
  - Added Zod validation schemas
  - Integrated React Hook Form
  - Async email uniqueness check
  - Error states and feedback
  - Accessibility improvements

  ## Tests
  - ✅ Unit tests (23 passing)
  - ✅ Component tests (12 passing)
  - ✅ Accessibility tests (4 passing)
  - ✅ Edge cases (8 passing)

  ## KPIs
  - Target: <10% error rate
  - Target: <5 min form completion
  "

# 4. Code Review
# - Review par 2+ développeurs
# - CI/CD checks pass
# - Lighthouse score >90

# 5. Merge
git checkout main
git merge --no-ff feature/US-S1-01-form-validation
git push origin main
```

---

### US-S1-02: Gestion des Erreurs Globale

#### Dataflow Technique

```
┌─────────────────────────────────────────────────────────────┐
│                  ERROR HANDLING DATAFLOW                    │
└─────────────────────────────────────────────────────────────┘

USER ACTION
    ↓
┌───────────────┐
│ API Call      │  1. User triggers action (submit form, etc)
│               │  2. Fetch request initiated
└───────────────┘
    ↓
┌───────────────┐
│ Request       │  3. Try request
│ Execution     │  4. Add timeout (30s)
└───────────────┘
    ↓
    ├─ SUCCESS ────────────────────┐
    │                              ↓
    │                         ┌────────────┐
    │                         │ Success    │
    │                         │ Handler    │
    │                         └────────────┘
    │
    ├─ ERROR ──────────────────────┐
    │                              ↓
    │                         ┌────────────┐
    │                         │ Error      │
    │                         │ Classifier │
    │                         └────────────┘
    │                              ↓
    │                         ┌────────────┐
    │                         │ Error Type?│
    │                         └────────────┘
    │                              ↓
    │        ┌─────────────────────┼─────────────────────┐
    │        ↓                     ↓                     ↓
    │   ┌─────────┐          ┌─────────┐          ┌─────────┐
    │   │ Network │          │  Auth   │          │ Server  │
    │   │ Error   │          │  Error  │          │  Error  │
    │   └─────────┘          └─────────┘          └─────────┘
    │        ↓                     ↓                     ↓
    │   ┌─────────┐          ┌─────────┐          ┌─────────┐
    │   │ Retry?  │          │Redirect │          │  Log    │
    │   │Yes: 3x  │          │ Login   │          │ Error   │
    │   └─────────┘          └─────────┘          └─────────┘
    │        ↓                     ↓                     ↓
    │   ┌─────────┐          ┌─────────┐          ┌─────────┐
    │   │Backoff: │          │ Save    │          │ Show    │
    │   │1s,2s,4s │          │ State   │          │ Toast   │
    │   └─────────┘          └─────────┘          └─────────┘
    │        ↓                     ↓                     ↓
    │   SUCCESS?              SUCCESS?              [Retry]
    │   Yes → Done            Yes → Done             Button
    │   No → Toast            No → Toast
    │
    └────────────────────────────────────────────────────────
```

#### Logique Métier

**Classification des Erreurs:**

```typescript
enum ErrorType {
  NETWORK = 'network',        // Pas de connexion, timeout
  AUTH = 'auth',             // 401, 403, token expiré
  VALIDATION = 'validation', // 400, données invalides
  SERVER = 'server',         // 500, 502, 503
  UNKNOWN = 'unknown'        // Autre
}

// Stratégie par type:
const strategies = {
  network: {
    retry: true,
    maxRetries: 3,
    backoff: 'exponential', // 1s, 2s, 4s
    userMessage: 'Problème de connexion. Nouvelle tentative...',
    fallback: 'offline-mode',
  },

  auth: {
    retry: false,
    redirect: '/login',
    saveState: true,
    userMessage: 'Votre session a expiré. Reconnexion requise.',
  },

  validation: {
    retry: false,
    showErrors: true,
    userMessage: 'Certaines données sont invalides.',
  },

  server: {
    retry: true,
    maxRetries: 1,
    delay: 5000, // 5s
    userMessage: 'Le serveur rencontre un problème. Réessayez dans quelques instants.',
  },

  unknown: {
    retry: false,
    log: true,
    userMessage: 'Une erreur inattendue s\'est produite.',
    action: 'report-bug',
  },
};
```

#### Implémentation Technique

```typescript
// services/errorHandler.ts
export class ErrorHandler {
  static classify(error: any): ErrorType {
    // Network errors
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      return ErrorType.NETWORK;
    }
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return ErrorType.NETWORK;
    }

    // HTTP errors
    if (error.response) {
      const status = error.response.status;
      if (status === 401 || status === 403) return ErrorType.AUTH;
      if (status === 400) return ErrorType.VALIDATION;
      if (status >= 500) return ErrorType.SERVER;
    }

    return ErrorType.UNKNOWN;
  }

  static async handle(
    error: any,
    context: ErrorContext
  ): Promise<void> {
    const type = this.classify(error);
    const strategy = strategies[type];

    // Log error
    console.error('[ErrorHandler]', {
      type,
      error,
      context,
      timestamp: new Date().toISOString(),
    });

    // Send to monitoring
    if (config.monitoring) {
      Sentry.captureException(error, {
        contexts: { custom: context },
        tags: { errorType: type },
      });
    }

    // User feedback
    const message = this.getUserMessage(type, error);

    if (this.isCritical(type)) {
      showModal({
        title: 'Erreur',
        message,
        actions: this.getSuggestedActions(type),
      });
    } else {
      showToast({
        type: 'error',
        message,
        duration: strategy.duration || 5000,
      });
    }

    // Retry logic
    if (strategy.retry && context.retryCount < strategy.maxRetries) {
      return this.retry(context, strategy);
    }

    // Fallback actions
    if (strategy.redirect) {
      if (strategy.saveState) {
        this.saveCurrentState();
      }
      router.push(strategy.redirect);
    }
  }

  static async retry(
    context: ErrorContext,
    strategy: ErrorStrategy
  ): Promise<any> {
    const delay = strategy.backoff === 'exponential'
      ? Math.pow(2, context.retryCount) * 1000
      : strategy.delay;

    showToast({
      type: 'info',
      message: `Nouvelle tentative dans ${delay / 1000}s...`,
    });

    await sleep(delay);

    try {
      return await context.request();
    } catch (error) {
      return this.handle(error, {
        ...context,
        retryCount: context.retryCount + 1,
      });
    }
  }

  static getUserMessage(type: ErrorType, error: any): string {
    const messages = {
      [ErrorType.NETWORK]: 'Problème de connexion internet. Vérifiez votre réseau.',
      [ErrorType.AUTH]: 'Votre session a expiré. Veuillez vous reconnecter.',
      [ErrorType.VALIDATION]: 'Certaines données sont invalides. Veuillez corriger.',
      [ErrorType.SERVER]: 'Le serveur rencontre un problème. Réessayez plus tard.',
      [ErrorType.UNKNOWN]: 'Une erreur inattendue s\'est produite.',
    };

    return messages[type] || messages[ErrorType.UNKNOWN];
  }
}

// components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    ErrorHandler.handle(error, {
      type: 'component-error',
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h1>Oups, quelque chose s'est mal passé</h1>
          <p>Nous sommes désolés pour ce désagrément.</p>
          <button onClick={() => window.location.reload()}>
            Recharger la page
          </button>
          <button onClick={() => router.push('/dashboard')}>
            Retour au dashboard
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// hooks/useApi.ts
export function useApi<T>(fn: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fn();
      setData(result);
      return result;
    } catch (err) {
      await ErrorHandler.handle(err, {
        request: fn,
        retryCount: 0,
      });
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fn]);

  return { data, error, loading, execute };
}
```

#### Plan de Tests

```typescript
describe('ErrorHandler', () => {
  describe('Error Classification', () => {
    it('should classify network errors', () => {
      const error = new TypeError('Failed to fetch');
      expect(ErrorHandler.classify(error)).toBe(ErrorType.NETWORK);
    });

    it('should classify auth errors', () => {
      const error = { response: { status: 401 } };
      expect(ErrorHandler.classify(error)).toBe(ErrorType.AUTH);
    });

    it('should classify server errors', () => {
      const error = { response: { status: 500 } };
      expect(ErrorHandler.classify(error)).toBe(ErrorType.SERVER);
    });
  });

  describe('Retry Logic', () => {
    it('should retry network errors with exponential backoff', async () => {
      let attempts = 0;
      const mockFn = vi.fn(() => {
        attempts++;
        if (attempts < 3) throw new TypeError('Failed to fetch');
        return Promise.resolve('success');
      });

      const result = await ErrorHandler.handle(
        new TypeError('Failed to fetch'),
        { request: mockFn, retryCount: 0 }
      );

      expect(attempts).toBe(3);
      expect(result).toBe('success');
    });

    it('should not retry auth errors', async () => {
      const mockFn = vi.fn(() => Promise.reject({ response: { status: 401 } }));

      await ErrorHandler.handle(
        { response: { status: 401 } },
        { request: mockFn, retryCount: 0 }
      );

      expect(mockFn).toHaveBeenCalledTimes(0); // No retry
    });
  });

  describe('Error Messages', () => {
    it('should show user-friendly messages', () => {
      const networkError = new TypeError('Failed to fetch');
      const message = ErrorHandler.getUserMessage(
        ErrorType.NETWORK,
        networkError
      );

      expect(message).not.toContain('Failed to fetch'); // Technical term
      expect(message).toContain('connexion'); // User-friendly
    });
  });
});

describe('ErrorBoundary', () => {
  it('should catch errors and show fallback', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/quelque chose s'est mal passé/i)).toBeInTheDocument();
  });

  it('should allow retry', async () => {
    const user = userEvent.setup();
    const mockReload = vi.spyOn(window.location, 'reload');

    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    await user.click(screen.getByText(/recharger/i));
    expect(mockReload).toHaveBeenCalled();
  });
});
```

---

## 📊 PLAN DE TESTS GLOBAL

### Pyramide de Tests

```
            ┌─────────────┐
           /  E2E Tests   \     10%  (Critiques, user flows)
          /───────────────\
         /  Integration    \    20%  (API, DB, composants)
        /───────────────────\
       /   Unit Tests       \   70%  (Fonctions, utils, hooks)
      /─────────────────────\
```

### Couverture Cible

```
Overall:           > 80% coverage
Critical paths:    > 95% coverage
Utils/helpers:     > 90% coverage
Components:        > 80% coverage
Hooks:             > 85% coverage
```

### Outils

```
Unit:           Vitest + Testing Library
Integration:    Vitest + MSW (Mock Service Worker)
E2E:            Playwright
Accessibility:  jest-axe + Lighthouse CI
Visual:         Chromatic (Storybook snapshots)
Performance:    Lighthouse + WebPageTest
```

---

## 🚀 STRATÉGIE DE DÉPLOIEMENT

### Environnements

```
┌──────────────────────────────────────────────────────┐
│                    ENVIRONNEMENTS                    │
├──────────────────────────────────────────────────────┤
│                                                      │
│  1. DEV (local)                                      │
│     - Branch: feature/*                              │
│     - DB: Local Supabase                             │
│     - CI: Linting + Tests unitaires                  │
│                                                      │
│  2. STAGING (staging.app.medcare.fr)                 │
│     - Branch: develop                                │
│     - DB: Supabase staging                           │
│     - CI: Tests complets + Lighthouse                │
│     - Démo pour stakeholders                         │
│                                                      │
│  3. PRODUCTION (app.medcare.fr)                      │
│     - Branch: main                                   │
│     - DB: Supabase production                        │
│     - CI: Tests complets + smoke tests               │
│     - Déploiement progressif (canary)                │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Pipeline CI/CD

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  pull_request:
    branches: [develop, main]
  push:
    branches: [develop, main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint

  test-unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3

  test-e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npx playwright install
      - run: npm run test:e2e

  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/dashboard
          budgetPath: ./lighthouse-budget.json

  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    needs: [lint, test-unit, test-e2e, lighthouse]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: staging

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: [lint, test-unit, test-e2e, lighthouse]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Déploiement Progressif

```
ÉTAPE 1: Canary (5% trafic)
- 5% des utilisateurs → nouvelle version
- 95% des utilisateurs → version actuelle
- Monitoring: KPIs, erreurs, performance
- Durée: 2 heures

ÉTAPE 2: Rollout (25% trafic)
- Si aucun problème détecté
- 25% → nouvelle version
- Monitoring renforcé
- Durée: 4 heures

ÉTAPE 3: Rollout (50% trafic)
- 50% → nouvelle version
- Validation KPIs
- Durée: 8 heures

ÉTAPE 4: Rollout (100% trafic)
- Tous les utilisateurs → nouvelle version
- Monitoring continu pendant 24h
```

---

**Dernière mise à jour:** 2025-11-02
**Version:** 1.0
**Status:** ✅ Documentation complète Sprint 1
