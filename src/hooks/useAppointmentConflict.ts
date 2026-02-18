/**
 * useAppointmentConflict - Hook for detecting appointment conflicts
 *
 * Checks if a proposed appointment time slot conflicts with existing appointments.
 * Prevents double-booking by validating against the database.
 *
 * @features
 * - Check for overlapping appointments
 * - Support for appointment duration
 * - Excludes cancelled appointments
 * - Returns conflicting appointments for display
 */

import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import logger from '../utils/logger';
import { parseISO, addMinutes, isWithinInterval, parse, format } from 'date-fns';

export interface ConflictingAppointment {
  id: string;
  patient_name: string;
  appointment_time: string;
  duration: number;
  end_time: string;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflicts: ConflictingAppointment[];
  message: string | null;
}

interface AppointmentRecord {
  id: string;
  patient_name: string;
  appointment_time: string;
  duration: number;
  status: string;
}

/**
 * Parse time string to Date object for a given date
 */
const parseTimeToDate = (dateStr: string, timeStr: string): Date => {
  return parse(`${dateStr} ${timeStr}`, 'yyyy-MM-dd HH:mm', new Date());
};

/**
 * Calculate end time based on start time and duration
 */
const calculateEndTime = (startTime: Date, durationMinutes: number): Date => {
  return addMinutes(startTime, durationMinutes);
};

/**
 * Check if two time ranges overlap
 */
const doRangesOverlap = (
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean => {
  return start1 < end2 && end1 > start2;
};

export const useAppointmentConflict = () => {
  const [checking, setChecking] = useState(false);
  const [lastResult, setLastResult] = useState<ConflictCheckResult | null>(null);

  /**
   * Check for conflicts with a proposed appointment
   * @param date - The appointment date (YYYY-MM-DD)
   * @param time - The appointment time (HH:mm)
   * @param duration - Duration in minutes
   * @param excludeId - Optional appointment ID to exclude (for editing)
   */
  const checkConflict = useCallback(async (
    date: string,
    time: string,
    duration: number = 30,
    excludeId?: string
  ): Promise<ConflictCheckResult> => {
    if (!date || !time) {
      return { hasConflict: false, conflicts: [], message: null };
    }

    setChecking(true);
    logger.info('[useAppointmentConflict] Checking for conflicts:', { date, time, duration, excludeId });

    try {
      // Fetch all appointments for the given date (excluding cancelled)
      const { data, error } = await supabase
        .from('appointments')
        .select('id, patient_name, appointment_time, duration, status')
        .eq('appointment_date', date)
        .neq('status', 'annule');

      if (error) {
        logger.error('[useAppointmentConflict] Error fetching appointments:', error);
        return { hasConflict: false, conflicts: [], message: 'Erreur lors de la vérification' };
      }

      const appointments: AppointmentRecord[] = data || [];

      // Filter out the appointment being edited (if any)
      const relevantAppointments = excludeId
        ? appointments.filter(apt => apt.id !== excludeId)
        : appointments;

      // Calculate the proposed appointment time range
      const proposedStart = parseTimeToDate(date, time);
      const proposedEnd = calculateEndTime(proposedStart, duration);

      // Find conflicting appointments
      const conflicts: ConflictingAppointment[] = [];

      for (const apt of relevantAppointments) {
        const aptStart = parseTimeToDate(date, apt.appointment_time);
        const aptDuration = apt.duration || 30;
        const aptEnd = calculateEndTime(aptStart, aptDuration);

        if (doRangesOverlap(proposedStart, proposedEnd, aptStart, aptEnd)) {
          conflicts.push({
            id: apt.id,
            patient_name: apt.patient_name,
            appointment_time: apt.appointment_time,
            duration: aptDuration,
            end_time: format(aptEnd, 'HH:mm'),
          });
        }
      }

      const hasConflict = conflicts.length > 0;
      let message: string | null = null;

      if (hasConflict) {
        const conflictNames = conflicts.map(c => c.patient_name).join(', ');
        message = `Conflit avec ${conflicts.length} rendez-vous: ${conflictNames}`;
        logger.warn('[useAppointmentConflict] Conflicts found:', conflicts);
      } else {
        logger.info('[useAppointmentConflict] No conflicts found');
      }

      const result: ConflictCheckResult = { hasConflict, conflicts, message };
      setLastResult(result);
      return result;

    } catch (err) {
      logger.error('[useAppointmentConflict] Unexpected error:', err);
      return { hasConflict: false, conflicts: [], message: 'Erreur inattendue' };
    } finally {
      setChecking(false);
    }
  }, []);

  /**
   * Suggest available time slots for a given date
   */
  const suggestAvailableSlots = useCallback(async (
    date: string,
    duration: number = 30,
    startHour: number = 8,
    endHour: number = 20
  ): Promise<string[]> => {
    logger.info('[useAppointmentConflict] Finding available slots for:', date);

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('appointment_time, duration')
        .eq('appointment_date', date)
        .neq('status', 'annule')
        .order('appointment_time', { ascending: true });

      if (error) {
        logger.error('[useAppointmentConflict] Error fetching appointments:', error);
        return [];
      }

      const appointments = data || [];
      const availableSlots: string[] = [];

      // Generate all possible slots
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
          const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          const slotStart = parseTimeToDate(date, timeStr);
          const slotEnd = calculateEndTime(slotStart, duration);

          // Check if slot ends before closing time
          const closingTime = parseTimeToDate(date, `${endHour}:00`);
          if (slotEnd > closingTime) continue;

          // Check if slot conflicts with any appointment
          let hasConflict = false;
          for (const apt of appointments) {
            const aptStart = parseTimeToDate(date, apt.appointment_time);
            const aptEnd = calculateEndTime(aptStart, apt.duration || 30);

            if (doRangesOverlap(slotStart, slotEnd, aptStart, aptEnd)) {
              hasConflict = true;
              break;
            }
          }

          if (!hasConflict) {
            availableSlots.push(timeStr);
          }
        }
      }

      logger.info('[useAppointmentConflict] Available slots found:', availableSlots.length);
      return availableSlots;

    } catch (err) {
      logger.error('[useAppointmentConflict] Error finding available slots:', err);
      return [];
    }
  }, []);

  return {
    checkConflict,
    suggestAvailableSlots,
    checking,
    lastResult,
  };
};

export default useAppointmentConflict;
