---
name: Sprint 1 Task 01 - Form Validation
about: Implement complete form validation with Zod
title: '[S1-01] Implement Complete Form Validation with Zod'
labels: sprint-1, p0-critical, validation, forms
assignees: ''
---

## 📋 Task Information

**Sprint:** Sprint 1
**Priority:** P0 - CRITICAL
**Complexity:** 🔴 ÉLEVÉ
**Estimation:** 8-10 days
**Dependencies:** None

## 📝 Description

Implement robust validation for all forms using Zod schema validation and React Hook Form. This is a production blocker as forms currently lack proper validation, leading to potential data integrity issues.

## 🎯 Objectives

- [ ] Add Zod + React Hook Form to project
- [ ] Create validation schemas for all entities
- [ ] Update all forms to use validation
- [ ] Implement user-friendly error messages in French
- [ ] Ensure accessibility (WCAG AA) for error states

## 🔧 Technical Tasks

### 1. Setup Dependencies
- [ ] Install `zod` v3.22+
- [ ] Install `react-hook-form` v7.48+
- [ ] Install `@hookform/resolvers` v3.3+
- [ ] Configure TypeScript for Zod

### 2. Create Validation Schemas
- [ ] Create `src/schemas/patient.schema.ts`
  - Name validation (min 2 chars, max 100)
  - Email validation (RFC 5322)
  - Phone validation (French format)
  - Birth date validation (not in future, < 150 years ago)
  - Address validation (optional, max 200 chars)
  
- [ ] Create `src/schemas/appointment.schema.ts`
  - Patient ID (UUID)
  - Date validation (not in past for new appointments)
  - Time validation (business hours 8am-8pm)
  - Reason validation (min 5 chars, max 500)
  
- [ ] Create `src/schemas/consultation.schema.ts`
  - Diagnosis validation (min 10 chars)
  - Notes validation (optional, max 5000 chars)
  - Prescription validation
  
- [ ] Create `src/schemas/auth.schema.ts`
  - Email validation
  - Password validation (min 8 chars, 1 uppercase, 1 number, 1 special)
  - Confirmation password matching

### 3. Create Form Wrapper Hook
- [ ] Create `src/hooks/useFormValidation.ts`
- [ ] Integrate Zod resolver with React Hook Form
- [ ] Handle i18n error messages
- [ ] Provide `register`, `handleSubmit`, `errors` helpers
- [ ] Add `isSubmitting`, `isValid` states

### 4. Update Forms
- [ ] Update `src/pages/PatientRegisterPage.tsx`
- [ ] Update `src/pages/MedicRegisterPage.tsx`
- [ ] Update `src/components/AddPatientModal.tsx`
- [ ] Update `src/components/EditPatientModal.tsx`
- [ ] Update `src/pages/LoginPage.tsx`
- [ ] Update `src/pages/ResetPasswordPage.tsx`
- [ ] Update `src/pages/ConsultationPage.tsx`

### 5. Error Messages
- [ ] Create `src/constants/errorMessages.ts`
- [ ] French translations for all Zod errors
- [ ] Map server errors to user-friendly messages
- [ ] Inline error display under each field
- [ ] Summary error box (optional)

### 6. Accessibility
- [ ] Add `aria-invalid` when field has error
- [ ] Add `aria-describedby` linking to error message
- [ ] Ensure error messages have `role="alert"`
- [ ] Test with screen reader
- [ ] Keyboard navigation maintained

## 🔗 Dependencies

- **Depends on:** None
- **Blocks:** S1-02 (Error Handling)
- **Related to:** S2-03 (React Query mutations)

## ✅ Acceptance Criteria

```
✅ All forms validate input before submission
✅ Invalid data cannot be submitted
✅ Error messages are clear and in French
✅ Real-time validation on blur
✅ Server errors are caught and displayed
✅ WCAG AA accessibility maintained
✅ TypeScript types inferred from schemas
✅ No console errors
✅ Form UX smooth and responsive
```

## 🧪 Testing Checklist

- [ ] Unit tests for each Zod schema
- [ ] Test all validation rules (valid/invalid cases)
- [ ] Test error message display
- [ ] Test form submission (success/error)
- [ ] Test keyboard navigation
- [ ] Test screen reader announcements
- [ ] Test on mobile (touch)
- [ ] Cross-browser testing

## 📚 Documentation

- [ ] JSDoc for all schemas
- [ ] Usage examples in code comments
- [ ] Update README with validation approach
- [ ] Document custom validators (if any)

## 🔍 Code Review Checklist

- [ ] Schemas are DRY (no duplication)
- [ ] Error messages are user-friendly
- [ ] No hardcoded strings
- [ ] TypeScript strict mode passes
- [ ] Accessibility attributes present
- [ ] Performance is acceptable (<100ms validation)
- [ ] Edge cases handled (empty, null, undefined)

## 📸 Screenshots/Videos

### Before
- Forms accept invalid data
- No error feedback
- Console errors on invalid submit

### After (Expected)
- Real-time validation
- Clear error messages in French
- Accessible error states
- Smooth UX

## 💬 Notes

### Validation Rules Details

**Email Format:**
```typescript
z.string().email("Email invalide")
```

**Phone Format (French):**
```typescript
z.string().regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, 
  "Numéro de téléphone invalide")
```

**Password Strength:**
```typescript
z.string()
  .min(8, "Au moins 8 caractères")
  .regex(/[A-Z]/, "Au moins 1 majuscule")
  .regex(/[0-9]/, "Au moins 1 chiffre")
  .regex(/[^A-Za-z0-9]/, "Au moins 1 caractère spécial")
```

### Performance Considerations
- Debounce async validations (e.g., email uniqueness check)
- Use `mode: "onBlur"` for non-critical fields
- Use `mode: "onChange"` only for password strength meter

### Accessibility Notes
- Error messages must be announced to screen readers
- Use `aria-live="polite"` for non-critical errors
- Use `aria-live="assertive"` for critical errors (e.g., security)

### References
- [Zod Documentation](https://zod.dev)
- [React Hook Form Documentation](https://react-hook-form.com)
- [WCAG 2.1 Form Validation](https://www.w3.org/WAI/WCAG21/Understanding/error-identification.html)
