/**
 * Appointment Detail Modal Component
 *
 * Full-featured modal for viewing and managing appointment details.
 * Features:
 * - View full appointment details
 * - Contextual actions (reschedule, cancel, contact)
 * - Contact patient (email, phone)
 * - Reschedule functionality
 * - Cancel with confirmation
 * - Keyboard navigation (Esc to close)
 * - Click outside to close
 * - Accessible (ARIA labels, focus management)
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MessageCircle,
  Edit,
  Trash2,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import logger from '../utils/logger';

interface Appointment {
  id: string;
  patient_name: string;
  patient_email?: string;
  patient_phone?: string;
  appointment_date: string;
  appointment_time: string;
  message?: string;
  status: string;
}

// Demo appointments for fallback when API is unavailable
const DEMO_APPOINTMENTS_DATA: Record<string, Appointment> = {
  'demo-1': {
    id: 'demo-1',
    patient_name: 'Marie Dupont',
    patient_email: 'marie.dupont@email.com',
    patient_phone: '+33 6 12 34 56 78',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '09:00',
    message: 'Consultation de routine - Cardiologie',
    status: 'confirmed',
  },
  'demo-2': {
    id: 'demo-2',
    patient_name: 'Jean Leroy',
    patient_email: 'jean.leroy@email.com',
    patient_phone: '+33 6 23 45 67 89',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '10:30',
    message: 'Suivi dermatologique',
    status: 'confirmed',
  },
  'demo-3': {
    id: 'demo-3',
    patient_name: 'Sophie Martin',
    patient_email: 'sophie.martin@email.com',
    patient_phone: '+33 6 34 56 78 90',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '11:00',
    message: 'Consultation générale',
    status: 'confirmed',
  },
  'demo-4': {
    id: 'demo-4',
    patient_name: 'Pierre Dubois',
    patient_email: 'pierre.dubois@email.com',
    patient_phone: '+33 6 45 67 89 01',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '14:00',
    message: 'Contrôle neurologique',
    status: 'confirmed',
  },
  'demo-5': {
    id: 'demo-5',
    patient_name: 'Claire Moreau',
    patient_email: 'claire.moreau@email.com',
    patient_phone: '+33 6 56 78 90 12',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '15:30',
    message: 'Suivi pédiatrique',
    status: 'confirmed',
  },
};

interface AppointmentDetailModalProps {
  appointmentId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  appointmentId,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  // Fetch appointment details
  useEffect(() => {
    if (isOpen && appointmentId) {
      fetchAppointment();
    }
  }, [isOpen, appointmentId]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';

      // Focus first focusable element
      setTimeout(() => {
        firstFocusableRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const fetchAppointment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if it's a demo appointment
      if (appointmentId && appointmentId.startsWith('demo-')) {
        const demoAppointment = DEMO_APPOINTMENTS_DATA[appointmentId];
        if (demoAppointment) {
          setAppointment(demoAppointment);
          setLoading(false);
          return;
        }
      }

      const { data, error: fetchError } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .single();

      if (fetchError) throw fetchError;

      setAppointment(data);
    } catch (err: any) {
      logger.error('[AppointmentDetailModal] Error:', err);
      setError(err.message || 'Failed to load appointment');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cancel appointment
   */
  const handleCancel = async () => {
    setActionLoading('cancel');
    setError(null);

    try {
      // Handle demo appointments
      if (appointmentId && appointmentId.startsWith('demo-')) {
        setShowSuccess('Rendez-vous annulé avec succès (Mode démo)');
        setTimeout(() => {
          onUpdate?.();
          onClose();
        }, 1500);
        setActionLoading(null);
        setShowCancelConfirm(false);
        return;
      }

      const { error: updateError } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId);

      if (updateError) throw updateError;

      setShowSuccess('Rendez-vous annulé avec succès');
      setTimeout(() => {
        onUpdate?.();
        onClose();
      }, 1500);

    } catch (err: any) {
      logger.error('[AppointmentDetailModal] Cancel error:', err);
      setError(err.message || 'Failed to cancel appointment');
    } finally {
      setActionLoading(null);
      setShowCancelConfirm(false);
    }
  };

  /**
   * Mark as completed
   */
  const handleComplete = async () => {
    setActionLoading('complete');
    setError(null);

    try {
      // Handle demo appointments
      if (appointmentId && appointmentId.startsWith('demo-')) {
        setShowSuccess('Rendez-vous marqué comme complété (Mode démo)');
        setTimeout(() => {
          onUpdate?.();
          onClose();
        }, 1500);
        setActionLoading(null);
        return;
      }

      const { error: updateError } = await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('id', appointmentId);

      if (updateError) throw updateError;

      setShowSuccess('Rendez-vous marqué comme complété');
      setTimeout(() => {
        onUpdate?.();
        onClose();
      }, 1500);

    } catch (err: any) {
      logger.error('[AppointmentDetailModal] Complete error:', err);
      setError(err.message || 'Failed to complete appointment');
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * Contact patient (open email/phone)
   */
  const handleContactEmail = () => {
    if (appointment?.patient_email) {
      window.location.href = `mailto:${appointment.patient_email}?subject=Rendez-vous du ${appointment.appointment_date}`;
    }
  };

  const handleContactPhone = () => {
    if (appointment?.patient_phone) {
      window.location.href = `tel:${appointment.patient_phone}`;
    }
  };

  const handleContactSMS = () => {
    if (appointment?.patient_phone) {
      window.location.href = `sms:${appointment.patient_phone}`;
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  /**
   * Get status badge color
   */
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'confirmed':
        return 'Confirmé';
      case 'completed':
        return 'Complété';
      case 'cancelled':
        return 'Annulé';
      default:
        return 'En attente';
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="bg-[#1e293b] rounded-xl border border-[#334155] shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#334155]">
          <h2 id="modal-title" className="text-xl font-semibold text-white">
            Détails du rendez-vous
          </h2>
          <button
            ref={firstFocusableRef}
            onClick={onClose}
            className="p-2 hover:bg-[#334155] rounded-lg transition-colors text-gray-400 hover:text-white"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={40} className="animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchAppointment}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Réessayer
              </button>
            </div>
          ) : appointment ? (
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                  {getStatusLabel(appointment.status)}
                </span>
                <span className="text-xs text-gray-500">ID: {appointment.id.substring(0, 8)}</span>
              </div>

              {/* Patient Info */}
              <div className="bg-[#0f172a] rounded-lg p-4 border border-[#334155]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <User size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{appointment.patient_name}</h3>
                    <p className="text-gray-400 text-sm">Patient</p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2">
                  {appointment.patient_email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail size={16} className="text-gray-500" />
                      <span className="text-gray-300">{appointment.patient_email}</span>
                    </div>
                  )}
                  {appointment.patient_phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={16} className="text-gray-500" />
                      <span className="text-gray-300">{appointment.patient_phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Appointment Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0f172a] rounded-lg p-4 border border-[#334155]">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={18} className="text-blue-500" />
                    <span className="text-gray-400 text-sm">Date</span>
                  </div>
                  <p className="text-white font-medium">{formatDate(appointment.appointment_date)}</p>
                </div>

                <div className="bg-[#0f172a] rounded-lg p-4 border border-[#334155]">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={18} className="text-purple-500" />
                    <span className="text-gray-400 text-sm">Heure</span>
                  </div>
                  <p className="text-white font-medium">{appointment.appointment_time}</p>
                </div>
              </div>

              {/* Message */}
              {appointment.message && (
                <div className="bg-[#0f172a] rounded-lg p-4 border border-[#334155]">
                  <h4 className="text-white font-medium mb-2">Notes</h4>
                  <p className="text-gray-300 text-sm">{appointment.message}</p>
                </div>
              )}

              {/* Success Message */}
              {showSuccess && (
                <div className="bg-green-600/20 border border-green-500/50 rounded-lg p-4 flex items-center gap-3">
                  <Check size={20} className="text-green-400" />
                  <span className="text-green-400">{showSuccess}</span>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-600/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
                  <AlertCircle size={20} className="text-red-400" />
                  <span className="text-red-400">{error}</span>
                </div>
              )}

              {/* Cancel Confirmation */}
              {showCancelConfirm && (
                <div className="bg-red-600/20 border border-red-500/50 rounded-lg p-4">
                  <p className="text-red-400 mb-4">Êtes-vous sûr de vouloir annuler ce rendez-vous?</p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancel}
                      disabled={actionLoading === 'cancel'}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading === 'cancel' ? (
                        <Loader2 size={18} className="animate-spin mx-auto" />
                      ) : (
                        'Oui, annuler'
                      )}
                    </button>
                    <button
                      onClick={() => setShowCancelConfirm(false)}
                      className="flex-1 px-4 py-2 bg-[#334155] text-white rounded-lg hover:bg-[#475569]"
                    >
                      Non, garder
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Actions Footer */}
        {appointment && appointment.status !== 'cancelled' && appointment.status !== 'completed' && !showSuccess && (
          <div className="p-6 border-t border-[#334155] bg-[#0f172a]/50">
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Contact Actions */}
              <button
                onClick={handleContactEmail}
                disabled={!appointment.patient_email || !!actionLoading}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Mail size={18} />
                <span>Email</span>
              </button>

              <button
                onClick={handleContactPhone}
                disabled={!appointment.patient_phone || !!actionLoading}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Phone size={18} />
                <span>Appeler</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Complete Action */}
              <button
                onClick={handleComplete}
                disabled={!!actionLoading}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {actionLoading === 'complete' ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Check size={18} />
                    <span>Compléter</span>
                  </>
                )}
              </button>

              {/* Cancel Action */}
              <button
                onClick={() => setShowCancelConfirm(true)}
                disabled={!!actionLoading || showCancelConfirm}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Trash2 size={18} />
                <span>Annuler RDV</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentDetailModal;
