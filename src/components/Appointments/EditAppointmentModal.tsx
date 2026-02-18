import React, { useState, useEffect, useCallback } from 'react';
import { X, Calendar, Clock, FileText, Tag, AlertCircle, AlertTriangle, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import logger from '../../utils/logger';
import { useAppointmentConflict, ConflictingAppointment } from '../../hooks/useAppointmentConflict';

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
}

interface EditAppointmentModalProps {
  appointment: Appointment;
  isDemoMode?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EditAppointmentModal: React.FC<EditAppointmentModalProps> = ({
  appointment,
  isDemoMode = false,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<ConflictingAppointment[]>([]);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');

  const { checkConflict, checking: checkingConflict } = useAppointmentConflict();

  const [formData, setFormData] = useState({
    appointment_date: appointment.appointment_date,
    appointment_time: appointment.appointment_time,
    motif: appointment.motif || '',
    type_consultation: appointment.type_consultation || 'Consultation',
    notes: appointment.notes || '',
    duration: appointment.duration || 30,
    status: appointment.status
  });

  logger.info('[EditAppointmentModal] Editing appointment:', appointment.id);

  // Check for conflicts when date, time, or duration changes
  const validateTimeSlot = useCallback(async () => {
    if (formData.appointment_date && formData.appointment_time) {
      const result = await checkConflict(
        formData.appointment_date,
        formData.appointment_time,
        formData.duration,
        appointment.id // Exclude current appointment
      );
      setConflicts(result.conflicts);
      setConflictWarning(result.message);
    } else {
      setConflicts([]);
      setConflictWarning(null);
    }
  }, [formData.appointment_date, formData.appointment_time, formData.duration, appointment.id, checkConflict]);

  useEffect(() => {
    validateTimeSlot();
  }, [validateTimeSlot]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    logger.info('[EditAppointmentModal] Submitting form...');

    if (!formData.appointment_date || !formData.appointment_time) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Require cancellation reason when cancelling
    if (formData.status === 'annule' && !cancellationReason.trim()) {
      setError('Veuillez indiquer la raison de l\'annulation');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // In demo mode, simulate success without hitting database
      if (isDemoMode) {
        logger.info('[EditAppointmentModal] Demo mode - simulating update');
        await new Promise(resolve => setTimeout(resolve, 300));
        onSuccess();
        return;
      }

      const updateData: Record<string, unknown> = {
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        motif: formData.motif,
        type_consultation: formData.type_consultation,
        notes: formData.notes,
        duration: formData.duration,
        status: formData.status,
        updated_at: new Date().toISOString()
      };

      // Add cancellation data if status is cancelled
      if (formData.status === 'annule') {
        updateData.cancelled_at = new Date().toISOString();
        updateData.cancelled_reason = cancellationReason;
      }

      const { error: updateError } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', appointment.id);

      if (updateError) {
        logger.error('[EditAppointmentModal] Error updating appointment:', updateError);
        setError(`Erreur lors de la modification: ${updateError.message}`);
        return;
      }

      logger.info('[EditAppointmentModal] Appointment updated successfully');
      onSuccess();
    } catch (err) {
      logger.error('[EditAppointmentModal] Unexpected error:', err);
      setError('Erreur inattendue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="theme-bg-secondary rounded-xl border theme-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 theme-bg-secondary border-b theme-border px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold theme-text-primary">Modifier le Rendez-vous</h2>
            <p className="text-sm theme-text-muted mt-1">{appointment.patient_name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors cursor-pointer"
            title="Fermer"
            aria-label="Fermer le formulaire"
          >
            <X size={20} className="theme-text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle size={20} className="text-red-400" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}

          {conflictWarning && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={20} className="text-amber-400" />
                <span className="text-sm font-medium text-amber-400">Conflit de créneau détecté</span>
              </div>
              <p className="text-sm text-amber-300 mb-2">{conflictWarning}</p>
              <div className="space-y-1">
                {conflicts.map((c) => (
                  <div key={c.id} className="text-xs text-amber-200/80 pl-4">
                    • {c.patient_name} : {c.appointment_time} - {c.end_time} ({c.duration} min)
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="edit_status" className="block text-sm font-medium theme-text-secondary mb-2">
              Statut
            </label>
            <select
              id="edit_status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              title="Statut du rendez-vous"
              className="w-full px-4 py-2 theme-bg-input border theme-border rounded-lg theme-text-primary focus:outline-none focus:border-primary"
            >
              <option value="a_venir">À venir</option>
              <option value="en_cours">En cours</option>
              <option value="termine">Terminé</option>
              <option value="annule">Annulé</option>
            </select>
          </div>

          {formData.status === 'annule' && (
            <div>
              <label htmlFor="cancellation_reason" className="block text-sm font-medium theme-text-secondary mb-2">
                <AlertCircle size={16} className="inline mr-2" />
                Raison de l'annulation *
              </label>
              <textarea
                id="cancellation_reason"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows={2}
                required
                placeholder="Indiquez la raison de l'annulation..."
                className="w-full px-4 py-2 theme-bg-input border border-red-500/30 rounded-lg theme-text-primary placeholder-[var(--text-muted)] focus:outline-none focus:border-red-500"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit_date" className="block text-sm font-medium theme-text-secondary mb-2">
                <Calendar size={16} className="inline mr-2" />
                Date *
              </label>
              <input
                id="edit_date"
                type="date"
                value={formData.appointment_date}
                onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                required
                title="Date du rendez-vous"
                className="w-full px-4 py-2 theme-bg-input border theme-border rounded-lg theme-text-primary focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="edit_time" className="block text-sm font-medium theme-text-secondary mb-2">
                <Clock size={16} className="inline mr-2" />
                Heure *
              </label>
              <input
                id="edit_time"
                type="time"
                value={formData.appointment_time}
                onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                required
                title="Heure du rendez-vous"
                className="w-full px-4 py-2 theme-bg-input border theme-border rounded-lg theme-text-primary focus:outline-none focus:border-primary"
              />
              {checkingConflict && (
                <p className="text-xs theme-text-muted mt-1">Vérification des conflits...</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="edit_motif" className="block text-sm font-medium theme-text-secondary mb-2">
              <FileText size={16} className="inline mr-2" />
              Motif
            </label>
            <input
              id="edit_motif"
              type="text"
              value={formData.motif}
              onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
              placeholder="Raison de la consultation"
              className="w-full px-4 py-2 theme-bg-input border theme-border rounded-lg theme-text-primary placeholder-[var(--text-muted)] focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit_type" className="block text-sm font-medium theme-text-secondary mb-2">
                <Tag size={16} className="inline mr-2" />
                Type de consultation
              </label>
              <select
                id="edit_type"
                value={formData.type_consultation}
                onChange={(e) => setFormData({ ...formData, type_consultation: e.target.value })}
                title="Type de consultation"
                className="w-full px-4 py-2 theme-bg-input border theme-border rounded-lg theme-text-primary focus:outline-none focus:border-primary"
              >
                <option value="Consultation">Consultation</option>
                <option value="Contrôle">Contrôle</option>
                <option value="Suivi">Suivi</option>
                <option value="Urgence">Urgence</option>
                <option value="Téléconsultation">Téléconsultation</option>
              </select>
            </div>

            <div>
              <label htmlFor="edit_duration" className="block text-sm font-medium theme-text-secondary mb-2">
                <Clock size={16} className="inline mr-2" />
                Durée (minutes)
              </label>
              <input
                id="edit_duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
                min="15"
                step="15"
                title="Durée en minutes"
                className="w-full px-4 py-2 theme-bg-input border theme-border rounded-lg theme-text-primary focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label htmlFor="edit_notes" className="block text-sm font-medium theme-text-secondary mb-2">
              Notes privées
            </label>
            <textarea
              id="edit_notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              placeholder="Notes internes (non visibles par le patient)"
              className="w-full px-4 py-2 theme-bg-input border theme-border rounded-lg theme-text-primary placeholder-[var(--text-muted)] focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t theme-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 theme-text-muted hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Save size={16} />
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAppointmentModal;
