import React, { useState, useEffect, useCallback } from 'react';
import { X, Calendar, Clock, User, FileText, Tag, AlertCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import logger from '../../utils/logger';
import { useAppointmentConflict, ConflictingAppointment } from '../../hooks/useAppointmentConflict';

interface AddAppointmentModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
}

const AddAppointmentModal: React.FC<AddAppointmentModalProps> = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [conflicts, setConflicts] = useState<ConflictingAppointment[]>([]);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const { checkConflict, checking: checkingConflict } = useAppointmentConflict();

  const [formData, setFormData] = useState({
    patient_id: '',
    patient_name: '',
    patient_email: '',
    patient_phone: '',
    appointment_date: '',
    appointment_time: '',
    motif: '',
    type_consultation: 'Consultation',
    notes: '',
    duration: 30,
    status: 'a_venir'
  });

  logger.info('[AddAppointmentModal] Component mounted');

  // Check for conflicts when date, time, or duration changes
  const validateTimeSlot = useCallback(async () => {
    if (formData.appointment_date && formData.appointment_time) {
      const result = await checkConflict(
        formData.appointment_date,
        formData.appointment_time,
        formData.duration
      );
      setConflicts(result.conflicts);
      setConflictWarning(result.message);
    } else {
      setConflicts([]);
      setConflictWarning(null);
    }
  }, [formData.appointment_date, formData.appointment_time, formData.duration, checkConflict]);

  useEffect(() => {
    validateTimeSlot();
  }, [validateTimeSlot]);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = patients.filter(p =>
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone?.includes(searchTerm) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patients);
    }
  }, [searchTerm, patients]);

  const fetchPatients = async () => {
    logger.info('[AddAppointmentModal] Fetching patients...');

    try {
      const { data, error: fetchError } = await supabase
        .from('patients')
        .select('id, first_name, last_name, phone, email')
        .order('last_name', { ascending: true });

      if (fetchError) {
        logger.error('[AddAppointmentModal] Error fetching patients:', fetchError);
        return;
      }

      logger.info('[AddAppointmentModal] Patients fetched:', data?.length || 0);
      setPatients(data || []);
      setFilteredPatients(data || []);
    } catch (err) {
      logger.error('[AddAppointmentModal] Unexpected error:', err);
    }
  };

  const handleSelectPatient = (patient: Patient) => {
    logger.info('[AddAppointmentModal] Patient selected:', patient.id);
    setFormData({
      ...formData,
      patient_id: patient.id,
      patient_name: `${patient.first_name} ${patient.last_name}`,
      patient_email: patient.email || '',
      patient_phone: patient.phone || ''
    });
    setSearchTerm('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    logger.info('[AddAppointmentModal] Submitting form...');

    if (!formData.patient_name || !formData.appointment_date || !formData.appointment_time) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('appointments')
        .insert([{
          patient_id: formData.patient_id || null,
          patient_name: formData.patient_name,
          patient_email: formData.patient_email,
          patient_phone: formData.patient_phone,
          appointment_date: formData.appointment_date,
          appointment_time: formData.appointment_time,
          motif: formData.motif,
          type_consultation: formData.type_consultation,
          notes: formData.notes,
          duration: formData.duration,
          status: formData.status
        }]);

      if (insertError) {
        logger.error('[AddAppointmentModal] Error inserting appointment:', insertError);
        setError(`Erreur lors de la création du rendez-vous: ${insertError.message}`);
        return;
      }

      logger.info('[AddAppointmentModal] Appointment created successfully');
      onSuccess();
    } catch (err) {
      logger.error('[AddAppointmentModal] Unexpected error:', err);
      setError('Erreur inattendue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="theme-bg-secondary rounded-xl border theme-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 theme-bg-secondary border-b theme-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold theme-text-primary">Nouveau Rendez-vous</h2>
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
              <p className="text-xs text-amber-400/70 mt-2">
                Vous pouvez continuer, mais ce créneau chevauche un rendez-vous existant.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">
              <User size={16} className="inline mr-2" />
              Patient *
            </label>
            {formData.patient_id ? (
              <div className="flex items-center justify-between p-3 theme-bg-input border theme-border rounded-lg">
                <span className="theme-text-primary">{formData.patient_name}</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, patient_id: '', patient_name: '', patient_email: '', patient_phone: '' })}
                  className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer"
                >
                  Changer
                </button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher un patient..."
                  className="w-full px-4 py-2 theme-bg-input border theme-border rounded-lg theme-text-primary placeholder-[var(--text-muted)] focus:outline-none focus:border-primary"
                />
                {searchTerm && (
                  <div className="mt-2 max-h-48 overflow-y-auto theme-bg-input border theme-border rounded-lg">
                    {filteredPatients.length === 0 ? (
                      <div className="p-4 text-center theme-text-muted text-sm">
                        Aucun patient trouvé
                      </div>
                    ) : (
                      filteredPatients.map((patient) => (
                        <button
                          key={patient.id}
                          type="button"
                          onClick={() => handleSelectPatient(patient)}
                          className="w-full px-4 py-3 text-left hover:bg-[var(--bg-secondary)] transition-colors border-b theme-border last:border-b-0 cursor-pointer"
                        >
                          <div className="theme-text-primary font-medium">
                            {patient.first_name} {patient.last_name}
                          </div>
                          {patient.phone && (
                            <div className="text-sm theme-text-muted mt-1">
                              {patient.phone}
                            </div>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
            {!formData.patient_id && (
              <div className="mt-2">
                <input
                  type="text"
                  value={formData.patient_name}
                  onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                  placeholder="Ou entrez le nom manuellement"
                  className="w-full px-4 py-2 theme-bg-input border theme-border rounded-lg theme-text-primary placeholder-[var(--text-muted)] focus:outline-none focus:border-primary"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.patient_email}
                onChange={(e) => setFormData({ ...formData, patient_email: e.target.value })}
                className="w-full px-4 py-2 theme-bg-input border theme-border rounded-lg theme-text-primary placeholder-[var(--text-muted)] focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                value={formData.patient_phone}
                onChange={(e) => setFormData({ ...formData, patient_phone: e.target.value })}
                className="w-full px-4 py-2 theme-bg-input border theme-border rounded-lg theme-text-primary placeholder-[var(--text-muted)] focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="appointment_date" className="block text-sm font-medium theme-text-secondary mb-2">
                <Calendar size={16} className="inline mr-2" />
                Date *
              </label>
              <input
                id="appointment_date"
                type="date"
                value={formData.appointment_date}
                onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                required
                title="Date du rendez-vous"
                className="w-full px-4 py-2 theme-bg-input border theme-border rounded-lg theme-text-primary focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="appointment_time" className="block text-sm font-medium theme-text-secondary mb-2">
                <Clock size={16} className="inline mr-2" />
                Heure *
              </label>
              <input
                id="appointment_time"
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
            <label className="block text-sm font-medium theme-text-secondary mb-2">
              <FileText size={16} className="inline mr-2" />
              Motif
            </label>
            <input
              type="text"
              value={formData.motif}
              onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
              placeholder="Raison de la consultation"
              className="w-full px-4 py-2 theme-bg-input border theme-border rounded-lg theme-text-primary placeholder-[var(--text-muted)] focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="type_consultation" className="block text-sm font-medium theme-text-secondary mb-2">
                <Tag size={16} className="inline mr-2" />
                Type de consultation
              </label>
              <select
                id="type_consultation"
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
              <label htmlFor="duration" className="block text-sm font-medium theme-text-secondary mb-2">
                <Clock size={16} className="inline mr-2" />
                Durée (minutes)
              </label>
              <input
                id="duration"
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
            <label className="block text-sm font-medium theme-text-secondary mb-2">
              Notes privées
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
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
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? 'Création...' : 'Créer le rendez-vous'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAppointmentModal;
