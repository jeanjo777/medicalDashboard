/**
 * Validation Utility
 *
 * Provides form validation with:
 * - Type-safe validation rules
 * - Custom error messages
 * - Composable validators
 * - Support for async validation
 */

// Types
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

export interface ValidationRule<T = unknown> {
  validate: (value: T, allValues?: Record<string, unknown>) => boolean | Promise<boolean>;
  message: string | ((value: T) => string);
}

export type ValidatorFn<T = unknown> = (value: T, allValues?: Record<string, unknown>) => string | null;

// Built-in validators
export const validators = {
  /**
   * Required field validator
   */
  required: (message = 'Ce champ est requis'): ValidatorFn<unknown> => {
    return (value) => {
      if (value === null || value === undefined || value === '') {
        return message;
      }
      if (Array.isArray(value) && value.length === 0) {
        return message;
      }
      return null;
    };
  },

  /**
   * Email validator
   */
  email: (message = 'Email invalide'): ValidatorFn<string> => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (value) => {
      if (!value) return null; // Let required handle empty
      return emailRegex.test(value) ? null : message;
    };
  },

  /**
   * Minimum length validator
   */
  minLength: (min: number, message?: string): ValidatorFn<string> => {
    return (value) => {
      if (!value) return null;
      const msg = message || `Minimum ${min} caractères requis`;
      return value.length >= min ? null : msg;
    };
  },

  /**
   * Maximum length validator
   */
  maxLength: (max: number, message?: string): ValidatorFn<string> => {
    return (value) => {
      if (!value) return null;
      const msg = message || `Maximum ${max} caractères autorisés`;
      return value.length <= max ? null : msg;
    };
  },

  /**
   * Pattern validator (regex)
   */
  pattern: (regex: RegExp, message = 'Format invalide'): ValidatorFn<string> => {
    return (value) => {
      if (!value) return null;
      return regex.test(value) ? null : message;
    };
  },

  /**
   * Minimum value validator (numbers)
   */
  min: (minValue: number, message?: string): ValidatorFn<number> => {
    return (value) => {
      if (value === null || value === undefined) return null;
      const msg = message || `La valeur doit être au moins ${minValue}`;
      return value >= minValue ? null : msg;
    };
  },

  /**
   * Maximum value validator (numbers)
   */
  max: (maxValue: number, message?: string): ValidatorFn<number> => {
    return (value) => {
      if (value === null || value === undefined) return null;
      const msg = message || `La valeur doit être au maximum ${maxValue}`;
      return value <= maxValue ? null : msg;
    };
  },

  /**
   * Phone number validator (French format)
   */
  phone: (message = 'Numéro de téléphone invalide'): ValidatorFn<string> => {
    const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
    return (value) => {
      if (!value) return null;
      const cleaned = value.replace(/\s/g, '');
      return phoneRegex.test(cleaned) ? null : message;
    };
  },

  /**
   * Date validator
   */
  date: (message = 'Date invalide'): ValidatorFn<string> => {
    return (value) => {
      if (!value) return null;
      const date = new Date(value);
      return isNaN(date.getTime()) ? message : null;
    };
  },

  /**
   * Future date validator
   */
  futureDate: (message = 'La date doit être dans le futur'): ValidatorFn<string> => {
    return (value) => {
      if (!value) return null;
      const date = new Date(value);
      if (isNaN(date.getTime())) return 'Date invalide';
      return date > new Date() ? null : message;
    };
  },

  /**
   * Past date validator
   */
  pastDate: (message = 'La date doit être dans le passé'): ValidatorFn<string> => {
    return (value) => {
      if (!value) return null;
      const date = new Date(value);
      if (isNaN(date.getTime())) return 'Date invalide';
      return date < new Date() ? null : message;
    };
  },

  /**
   * Age validator (from birth date)
   */
  minAge: (minAge: number, message?: string): ValidatorFn<string> => {
    return (value) => {
      if (!value) return null;
      const birthDate = new Date(value);
      if (isNaN(birthDate.getTime())) return 'Date invalide';

      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      const msg = message || `Vous devez avoir au moins ${minAge} ans`;
      return age >= minAge ? null : msg;
    };
  },

  /**
   * Password strength validator
   */
  password: (options?: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumber?: boolean;
    requireSpecial?: boolean;
  }): ValidatorFn<string> => {
    const {
      minLength = 8,
      requireUppercase = true,
      requireLowercase = true,
      requireNumber = true,
      requireSpecial = false,
    } = options || {};

    return (value) => {
      if (!value) return null;

      const errors: string[] = [];

      if (value.length < minLength) {
        errors.push(`Au moins ${minLength} caractères`);
      }
      if (requireUppercase && !/[A-Z]/.test(value)) {
        errors.push('Au moins une majuscule');
      }
      if (requireLowercase && !/[a-z]/.test(value)) {
        errors.push('Au moins une minuscule');
      }
      if (requireNumber && !/\d/.test(value)) {
        errors.push('Au moins un chiffre');
      }
      if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
        errors.push('Au moins un caractère spécial');
      }

      return errors.length > 0 ? errors.join(', ') : null;
    };
  },

  /**
   * Confirm field validator (e.g., password confirmation)
   */
  confirm: (fieldName: string, message?: string): ValidatorFn<string> => {
    return (value, allValues) => {
      if (!value || !allValues) return null;
      const msg = message || 'Les valeurs ne correspondent pas';
      return value === allValues[fieldName] ? null : msg;
    };
  },

  /**
   * Custom validator
   */
  custom: <T>(
    validateFn: (value: T, allValues?: Record<string, unknown>) => boolean,
    message: string
  ): ValidatorFn<T> => {
    return (value, allValues) => {
      if (!value) return null;
      return validateFn(value, allValues) ? null : message;
    };
  },
};

/**
 * Compose multiple validators into one
 */
export const compose = <T>(...fns: ValidatorFn<T>[]): ValidatorFn<T> => {
  return (value, allValues) => {
    for (const fn of fns) {
      const error = fn(value, allValues);
      if (error) return error;
    }
    return null;
  };
};

/**
 * Validate a single field with multiple validators
 */
export const validateField = <T>(
  value: T,
  validators: ValidatorFn<T>[],
  allValues?: Record<string, unknown>
): string[] => {
  const errors: string[] = [];

  for (const validator of validators) {
    const error = validator(value, allValues);
    if (error) {
      errors.push(error);
    }
  }

  return errors;
};

/**
 * Validate an entire form
 */
export const validateForm = <T extends Record<string, unknown>>(
  values: T,
  schema: Partial<Record<keyof T, ValidatorFn<unknown>[]>>
): ValidationResult => {
  const errors: Record<string, string[]> = {};
  let isValid = true;

  for (const [field, fieldValidators] of Object.entries(schema)) {
    if (!fieldValidators) continue;

    const fieldErrors = validateField(
      values[field],
      fieldValidators as ValidatorFn<unknown>[],
      values as Record<string, unknown>
    );

    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
      isValid = false;
    }
  }

  return { isValid, errors };
};

/**
 * Create a form validator with predefined schema
 */
export const createFormValidator = <T extends Record<string, unknown>>(
  schema: Partial<Record<keyof T, ValidatorFn<unknown>[]>>
) => {
  return (values: T): ValidationResult => validateForm(values, schema);
};

// Common validation schemas
export const commonSchemas = {
  /**
   * Login form schema
   */
  login: {
    email: [validators.required(), validators.email()],
    password: [validators.required(), validators.minLength(6)],
  },

  /**
   * Registration form schema
   */
  registration: {
    username: [validators.required(), validators.minLength(3), validators.maxLength(50)],
    email: [validators.required(), validators.email()],
    password: [validators.required(), validators.password()],
    confirmPassword: [validators.required(), validators.confirm('password')],
  },

  /**
   * Patient form schema
   */
  patient: {
    name: [validators.required(), validators.minLength(2), validators.maxLength(100)],
    email: [validators.required(), validators.email()],
    phone: [validators.phone()],
    birthDate: [validators.date()],
  },

  /**
   * Appointment form schema
   */
  appointment: {
    patientName: [validators.required()],
    patientEmail: [validators.required(), validators.email()],
    patientPhone: [validators.phone()],
    appointmentDate: [validators.required(), validators.futureDate()],
    motif: [validators.required(), validators.minLength(10)],
  },
};

export default validators;
