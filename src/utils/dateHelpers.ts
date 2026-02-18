/**
 * Date and Age Calculation Utilities
 *
 * Provides robust functions for calculating age from date of birth
 * with proper error handling and fallback values.
 */
import logger from './logger';


/**
 * Calculate age from date of birth
 *
 * @param dateOfBirth - Date string in format YYYY-MM-DD or Date object
 * @returns Age in years, or null if invalid
 *
 * @example
 * calculateAge('1995-02-05') // returns 30
 * calculateAge('invalid') // returns null
 * calculateAge(null) // returns null
 */
export function calculateAge(dateOfBirth: string | Date | null | undefined): number | null {
  if (!dateOfBirth) {
    return null;
  }

  try {
    const birthDate = typeof dateOfBirth === 'string'
      ? new Date(dateOfBirth)
      : dateOfBirth;

    if (isNaN(birthDate.getTime())) {
      return null;
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age >= 0 ? age : null;
  } catch (error) {
    logger.error('Error calculating age:', error);
    return null;
  }
}

/**
 * Format age for display with fallback
 *
 * @param dateOfBirth - Date string or Date object
 * @param fallback - Fallback string (default: "Non renseigné")
 * @returns Formatted age string like "30 ans" or fallback
 *
 * @example
 * formatAge('1995-02-05') // returns "30 ans"
 * formatAge(null) // returns "Non renseigné"
 * formatAge(null, 'N/A') // returns "N/A"
 */
export function formatAge(
  dateOfBirth: string | Date | null | undefined,
  fallback: string = 'Non renseigné'
): string {
  const age = calculateAge(dateOfBirth);

  if (age === null) {
    return fallback;
  }

  return `${age} an${age > 1 ? 's' : ''}`;
}

/**
 * Get age for display (number only with fallback)
 *
 * @param dateOfBirth - Date string or Date object
 * @param fallback - Fallback string (default: "—")
 * @returns Age as string or fallback
 *
 * @example
 * getAgeDisplay('1995-02-05') // returns "30"
 * getAgeDisplay(null) // returns "—"
 * getAgeDisplay(null, 'N/A') // returns "N/A"
 */
export function getAgeDisplay(
  dateOfBirth: string | Date | null | undefined,
  fallback: string = '—'
): string {
  const age = calculateAge(dateOfBirth);
  return age !== null ? age.toString() : fallback;
}

/**
 * Validate date of birth
 *
 * @param dateOfBirth - Date string or Date object
 * @returns true if valid date of birth, false otherwise
 *
 * @example
 * isValidDateOfBirth('1995-02-05') // returns true
 * isValidDateOfBirth('2050-01-01') // returns false (future date)
 * isValidDateOfBirth('invalid') // returns false
 */
export function isValidDateOfBirth(dateOfBirth: string | Date | null | undefined): boolean {
  if (!dateOfBirth) {
    return false;
  }

  try {
    const birthDate = typeof dateOfBirth === 'string'
      ? new Date(dateOfBirth)
      : dateOfBirth;

    if (isNaN(birthDate.getTime())) {
      return false;
    }

    const today = new Date();
    return birthDate <= today;
  } catch {
    return false;
  }
}

/**
 * Get age category
 *
 * @param dateOfBirth - Date string or Date object
 * @returns Age category string or null
 *
 * @example
 * getAgeCategory('2015-01-01') // returns "0-18"
 * getAgeCategory('2000-01-01') // returns "19-35"
 * getAgeCategory('1980-01-01') // returns "36-50"
 */
export function getAgeCategory(dateOfBirth: string | Date | null | undefined): string | null {
  const age = calculateAge(dateOfBirth);

  if (age === null) {
    return null;
  }

  if (age <= 18) return '0-18';
  if (age <= 35) return '19-35';
  if (age <= 50) return '36-50';
  if (age <= 65) return '51-65';
  return '65+';
}
