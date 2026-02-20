import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileText,
  Activity,
  Edit,
  Trash2,
  Save,
  RotateCcw,
  Shield,
  Clock,
  Heart,
  AlertTriangle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../Common/Toast';
import ConfirmDialog from '../Common/ConfirmDialog';
import ErrorState from '../ErrorState';
import logger from '../../utils/logger';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  address: string;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
  emergency_contact?: string;
  last_visit?: string;
}

interface PatientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  onPatientUpdated?: () => void;
  onPatientDeleted?: () => void;
}

const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  isOpen,
  onClose,
  patientId,
  onPatientUpdated,
  onPatientDeleted,
}) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPatient, setEditedPatient] = useState<Partial<Patient>>({});
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchPatient();
      document.body.style.overflow = 'hidden';

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !isEditing && !showDeleteDialog) {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, patientId, isEditing, showDeleteDialog]);

  const fetchPatient = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (fetchError) throw fetchError;

      setPatient(data);
      setEditedPatient(data);
    } catch (err: any) {
      logger.error('Error fetching patient:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedPatient(patient || {});
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedPatient(patient || {});
  };

  const handleSave = async () => {
    if (!patient) return;

    try {
      setSaving(true);

      const { error: updateError } = await supabase
        .from('patients')
        .update({
          name: editedPatient.name,
          email: editedPatient.email,
          phone: editedPatient.phone,
          address: editedPatient.address,
          status: editedPatient.status,
          notes: editedPatient.notes,
          emergency_contact: (editedPatient as any).emergency_contact || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', patient.id);

      if (updateError) throw updateError;

      setPatient({ ...patient, ...editedPatient });
      setIsEditing(false);

      showToast({
        type: 'success',
        title: 'Patient mis à jour',
        message: 'Les modifications ont été enregistrées avec succès',
      });

      if (onPatientUpdated) {
        onPatientUpdated();
      }
    } catch (err: any) {
      logger.error('Error updating patient:', err);
      showToast({
        type: 'error',
        title: 'Erreur',
        message: "Impossible de mettre à jour le patient: " + err.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!patient) return;

    try {
      setDeleting(true);

      const { error: deleteError } = await supabase
        .from('patients')
        .delete()
        .eq('id', patient.id);

      if (deleteError) throw deleteError;

      showToast({
        type: 'success',
        title: 'Patient supprimé',
        message: 'Le patient a été supprimé avec succès',
      });

      if (onPatientDeleted) {
        onPatientDeleted();
      }

      onClose();
    } catch (err: any) {
      logger.error('Error deleting patient:', err);
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de supprimer le patient: ' + err.message,
      });
      setDeleting(false);
    }
  };

  const calculateAge = (birthDate: string): number => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarGradient = (name: string): string => {
    const gradients = [
      'from-blue-500 to-indigo-600',
      'from-emerald-500 to-teal-600',
      'from-violet-500 to-purple-600',
      'from-rose-500 to-pink-600',
      'from-amber-500 to-orange-600',
      'from-cyan-500 to-blue-600',
    ];
    const index = name.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; classes: string; icon: React.ElementType }> = {
      active: {
        label: 'En consultation',
        classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        icon: Heart,
      },
      'in_treatment': {
        label: 'En traitement',
        classes: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
        icon: Activity,
      },
      recovered: {
        label: 'Rétabli',
        classes: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
        icon: Shield,
      },
      inactive: {
        label: 'Sorti',
        classes: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
        icon: Clock,
      },
    };
    return configs[status] || configs.inactive;
  };

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  if (!isOpen) return null;

  const statusConfig = patient ? getStatusConfig(patient.status) : null;
  const StatusIcon = statusConfig?.icon || Activity;

  return (
    <>
      <div
        className="fixed inset-0 z-[9997] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget && !isEditing) {
            onClose();
          }
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="patient-modal-title"
      >
        <div
          ref={modalRef}
          className="bg-[#1e293b] border border-[#334155] w-full sm:max-w-lg md:max-w-2xl sm:rounded-2xl rounded-t-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl shadow-black/40 flex flex-col"
        >
          {/* Loading State */}
          {loading && (
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-[#334155] rounded-2xl animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-[#334155] rounded-lg w-2/3 animate-pulse" />
                  <div className="h-4 bg-[#334155] rounded-lg w-1/3 animate-pulse" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 bg-[#0f172a] rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          )}

          {/* Error State */}
          {error && <div className="p-6"><ErrorState type="network" message={error} onRetry={fetchPatient} /></div>}

          {/* Patient Content */}
          {!loading && !error && patient && (
            <>
              {/* Header with Avatar */}
              <div className="relative bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-purple-600/10 px-4 py-5 sm:px-6 sm:py-6 border-b border-[#334155]">
                {/* Close Button */}
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isEditing || saving}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                  aria-label="Fermer"
                >
                  <X size={20} />
                </button>

                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Avatar */}
                  <div className={`w-14 h-14 sm:w-[4.5rem] sm:h-[4.5rem] bg-gradient-to-br ${getAvatarGradient(patient.name)} rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                    <span className="text-white font-bold text-lg sm:text-xl">{getInitials(patient.name)}</span>
                  </div>

                  {/* Name & Status */}
                  <div className="flex-1 min-w-0 pr-8">
                    <h2
                      id="patient-modal-title"
                      className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate"
                    >
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedPatient.name || ''}
                          onChange={(e) => setEditedPatient({ ...editedPatient, name: e.target.value })}
                          aria-label="Nom complet"
                          placeholder="Nom complet"
                          className="w-full bg-[#0f172a] border border-[#475569] rounded-lg px-3 py-1.5 text-lg sm:text-xl font-bold text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                      ) : (
                        patient.name
                      )}
                    </h2>
                    <div className="flex items-center gap-2 sm:gap-3 mt-1.5 sm:mt-2 flex-wrap">
                      {statusConfig && (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig.classes}`}>
                          <StatusIcon size={12} />
                          {statusConfig.label}
                        </span>
                      )}
                      {patient.date_of_birth && (
                        <span className="text-gray-400 text-xs sm:text-sm">
                          {calculateAge(patient.date_of_birth)} ans
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto flex-1 px-4 py-4 sm:px-6 sm:py-5 space-y-3 sm:space-y-4">
                {/* Contact Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  {/* Email */}
                  <div className="group bg-[#0f172a] rounded-xl border border-[#334155] p-3 sm:p-3.5 hover:border-blue-500/30 transition-colors">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <Mail size={14} className="text-blue-400 sm:w-4 sm:h-4" />
                      </div>
                      <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Email</span>
                    </div>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editedPatient.email || ''}
                        onChange={(e) => setEditedPatient({ ...editedPatient, email: e.target.value })}
                        aria-label="Email"
                        placeholder="email@exemple.com"
                        className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    ) : (
                      <p className="text-white text-sm sm:text-base font-medium truncate pl-9 sm:pl-10">
                        {patient.email || 'Non renseigné'}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="group bg-[#0f172a] rounded-xl border border-[#334155] p-3 sm:p-3.5 hover:border-emerald-500/30 transition-colors">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <Phone size={14} className="text-emerald-400 sm:w-4 sm:h-4" />
                      </div>
                      <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Téléphone</span>
                    </div>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editedPatient.phone || ''}
                        onChange={(e) => setEditedPatient({ ...editedPatient, phone: e.target.value })}
                        aria-label="Téléphone"
                        placeholder="+33 6 00 00 00 00"
                        className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    ) : (
                      <p className="text-white text-sm sm:text-base font-medium pl-9 sm:pl-10">
                        {patient.phone || 'Non renseigné'}
                      </p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div className="group bg-[#0f172a] rounded-xl border border-[#334155] p-3 sm:p-3.5 hover:border-violet-500/30 transition-colors">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                        <Calendar size={14} className="text-violet-400 sm:w-4 sm:h-4" />
                      </div>
                      <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Date de naissance</span>
                    </div>
                    <p className="text-white text-sm sm:text-base font-medium pl-9 sm:pl-10">
                      {patient.date_of_birth ? (
                        <>
                          {formatDate(patient.date_of_birth)}
                          <span className="text-gray-400 text-xs ml-2">({calculateAge(patient.date_of_birth)} ans)</span>
                        </>
                      ) : 'Non renseigné'}
                    </p>
                  </div>

                  {/* Status (editing) */}
                  {isEditing && (
                    <div className="group bg-[#0f172a] rounded-xl border border-[#334155] p-3 sm:p-3.5">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                          <Activity size={14} className="text-amber-400 sm:w-4 sm:h-4" />
                        </div>
                        <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Statut</span>
                      </div>
                      <select
                        value={editedPatient.status || 'active'}
                        onChange={(e) => setEditedPatient({ ...editedPatient, status: e.target.value })}
                        aria-label="Statut du patient"
                        title="Statut du patient"
                        className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                      >
                        <option value="active">En consultation</option>
                        <option value="in_treatment">En traitement</option>
                        <option value="recovered">Rétabli</option>
                        <option value="inactive">Sorti</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Address */}
                <div className="group bg-[#0f172a] rounded-xl border border-[#334155] p-3 sm:p-3.5 hover:border-orange-500/30 transition-colors">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                      <MapPin size={14} className="text-orange-400 sm:w-4 sm:h-4" />
                    </div>
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Adresse</span>
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedPatient.address || ''}
                      onChange={(e) => setEditedPatient({ ...editedPatient, address: e.target.value })}
                      aria-label="Adresse"
                      placeholder="Adresse du patient"
                      className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  ) : (
                    <p className="text-white text-sm sm:text-base font-medium pl-9 sm:pl-10">
                      {patient.address || 'Adresse non renseignée'}
                    </p>
                  )}
                </div>

                {/* Emergency Contact */}
                {(patient.emergency_contact || isEditing) && (
                  <div className="group bg-[#0f172a] rounded-xl border border-[#334155] p-3 sm:p-3.5 hover:border-red-500/30 transition-colors">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle size={14} className="text-red-400 sm:w-4 sm:h-4" />
                      </div>
                      <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Contact d'urgence</span>
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={(editedPatient as any).emergency_contact || ''}
                        onChange={(e) => setEditedPatient({ ...editedPatient, emergency_contact: e.target.value } as any)}
                        aria-label="Contact d'urgence"
                        placeholder="Nom et numéro du contact d'urgence"
                        className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    ) : (
                      <p className="text-white text-sm sm:text-base font-medium pl-9 sm:pl-10">
                        {patient.emergency_contact || 'Non renseigné'}
                      </p>
                    )}
                  </div>
                )}

                {/* Last Visit */}
                {patient.last_visit && (
                  <div className="group bg-[#0f172a] rounded-xl border border-[#334155] p-3 sm:p-3.5 hover:border-green-500/30 transition-colors">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                        <Calendar size={14} className="text-green-400 sm:w-4 sm:h-4" />
                      </div>
                      <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Dernière visite</span>
                    </div>
                    <p className="text-white text-sm sm:text-base font-medium pl-9 sm:pl-10">
                      {new Date(patient.last_visit).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                )}

                {/* Notes */}
                <div className="group bg-[#0f172a] rounded-xl border border-[#334155] p-3 sm:p-3.5 hover:border-cyan-500/30 transition-colors">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                      <FileText size={14} className="text-cyan-400 sm:w-4 sm:h-4" />
                    </div>
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Notes médicales</span>
                  </div>
                  {isEditing ? (
                    <textarea
                      value={editedPatient.notes || ''}
                      onChange={(e) => setEditedPatient({ ...editedPatient, notes: e.target.value })}
                      rows={3}
                      placeholder="Ajouter des notes..."
                      className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors resize-none placeholder-gray-600"
                    />
                  ) : (
                    <p className="text-gray-300 text-sm sm:text-base pl-9 sm:pl-10 whitespace-pre-wrap leading-relaxed">
                      {patient.notes || (
                        <span className="text-gray-500 italic">Aucune note</span>
                      )}
                    </p>
                  )}
                </div>

                {/* Patient Since */}
                {patient.created_at && (
                  <div className="flex items-center justify-center gap-2 py-2 text-xs text-gray-500">
                    <Clock size={12} />
                    <span>Patient depuis {formatDate(patient.created_at)}</span>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 border-t border-[#334155] bg-[#0f172a]/80">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-[#334155] rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <RotateCcw size={16} />
                      <span className="hidden xs:inline">Annuler</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 cursor-pointer"
                    >
                      {saving ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span className="hidden sm:inline">Enregistrement...</span>
                          <span className="sm:hidden">Sauvegarde...</span>
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Enregistrer
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowDeleteDialog(true)}
                      className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                    >
                      <Trash2 size={16} />
                      Supprimer
                    </button>
                    <button
                      type="button"
                      onClick={handleEdit}
                      className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all shadow-lg shadow-blue-500/25 cursor-pointer"
                    >
                      <Edit size={16} />
                      Modifier
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Supprimer le patient"
        message="Êtes-vous sûr de vouloir supprimer ce patient ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
        loading={deleting}
      />
    </>
  );
};

export default PatientDetailModal;
