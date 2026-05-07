import React from 'react';
import { X, Calendar, Clock, User, Phone, Mail, FileText, Tag, Edit2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import logger from '../../utils/logger';

interface Appointment {
  id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  appointment_date: string;
  appointment_time: string;
  motif?: string;
  type_consultation?: string;
  notes?: string;
  status: string;
  duration?: number;
  created_at: string;
  updated_at?: string;
  cancelled_at?: string;
  cancelled_reason?: string;
}

interface AppointmentDetailModalProps {
  appointment: Appointment;
  onClose: () => void;
  onEdit: () => void;
}

const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  appointment,
  onClose,
  onEdit
}) => {
  logger.info('[AppointmentDetailModal] Showing details for:', appointment.id);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'a_venir':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/10 text-green-400 border border-green-500/20">
            À venir
          </span>
        );
      case 'termine':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Terminé
          </span>
        );
      case 'annule':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20">
            Annulé
          </span>
        );
      case 'en_cours':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            En cours
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd MMMM yyyy', { locale: fr });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy à HH:mm', { locale: fr });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="theme-bg-secondary rounded-t-xl sm:rounded-xl border theme-border w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 theme-bg-secondary border-b theme-border px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold theme-text-primary truncate">Détails du Rendez-vous</h2>
              <p className="text-xs sm:text-sm theme-text-muted mt-0.5 sm:mt-1">Informations complètes</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onEdit}
                className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
                title="Modifier"
              >
                <Edit2 size={20} />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} className="theme-text-muted" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold theme-text-primary">Statut</h3>
            {getStatusBadge(appointment.status)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium theme-text-muted mb-2">
                  <User size={16} />
                  Patient
                </label>
                <p className="theme-text-primary text-lg font-medium">{appointment.patient_name}</p>
              </div>

              {appointment.patient_email && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium theme-text-muted mb-2">
                    <Mail size={16} />
                    Email
                  </label>
                  <p className="theme-text-primary">{appointment.patient_email}</p>
                </div>
              )}

              {appointment.patient_phone && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium theme-text-muted mb-2">
                    <Phone size={16} />
                    Téléphone
                  </label>
                  <p className="theme-text-primary">{appointment.patient_phone}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium theme-text-muted mb-2">
                  <Calendar size={16} />
                  Date
                </label>
                <p className="theme-text-primary text-lg font-medium">
                  {formatDate(appointment.appointment_date)}
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium theme-text-muted mb-2">
                  <Clock size={16} />
                  Heure
                </label>
                <p className="theme-text-primary text-lg font-medium">{appointment.appointment_time.slice(0, 5)}</p>
              </div>

              {appointment.duration && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium theme-text-muted mb-2">
                    <Clock size={16} />
                    Durée
                  </label>
                  <p className="theme-text-primary">{appointment.duration} minutes</p>
                </div>
              )}
            </div>
          </div>

          {appointment.motif && (
            <div>
              <label className="flex items-center gap-2 text-sm font-medium theme-text-muted mb-2">
                <FileText size={16} />
                Motif
              </label>
              <p className="theme-text-primary">{appointment.motif}</p>
            </div>
          )}

          {appointment.type_consultation && (
            <div>
              <label className="flex items-center gap-2 text-sm font-medium theme-text-muted mb-2">
                <Tag size={16} />
                Type de consultation
              </label>
              <p className="theme-text-primary">{appointment.type_consultation}</p>
            </div>
          )}

          {appointment.notes && (
            <div>
              <label className="flex items-center gap-2 text-sm font-medium theme-text-muted mb-2">
                <FileText size={16} />
                Notes privées
              </label>
              <div className="p-4 theme-bg-input border theme-border rounded-lg">
                <p className="theme-text-primary whitespace-pre-wrap">{appointment.notes}</p>
              </div>
            </div>
          )}

          {appointment.status === 'annule' && appointment.cancelled_reason && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <label className="text-sm font-medium text-red-400 mb-2 block">
                Raison de l'annulation
              </label>
              <p className="text-red-300">{appointment.cancelled_reason}</p>
              {appointment.cancelled_at && (
                <p className="text-sm text-red-400 mt-2">
                  Annulé le {formatDateTime(appointment.cancelled_at)}
                </p>
              )}
            </div>
          )}

          <div className="pt-4 border-t theme-border">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="theme-text-muted">Créé le</label>
                <p className="theme-text-secondary mt-1">{formatDateTime(appointment.created_at)}</p>
              </div>
              {appointment.updated_at && appointment.updated_at !== appointment.created_at && (
                <div>
                  <label className="theme-text-muted">Modifié le</label>
                  <p className="theme-text-secondary mt-1">{formatDateTime(appointment.updated_at)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 theme-bg-secondary border-t theme-border px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 theme-text-muted hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors cursor-pointer"
          >
            Fermer
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
          >
            Modifier
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailModal;
