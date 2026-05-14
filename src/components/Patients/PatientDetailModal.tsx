import React, { useState, useEffect, useRef } from 'react';
import {
  X,
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
  Thermometer,
  Scale,
  Ruler,
  Droplets,
  FlaskConical,
  Printer,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { generateSifcaDocument, generateSifcaDocumentBase64, SIFCA_DOC_TYPES, type SifcaDocType } from '../../utils/sifcaPdfGenerator';
import { getCurrentMedicId } from '../../utils/auth';
import { useToast } from '../Common/Toast';
import ConfirmDialog from '../Common/ConfirmDialog';
import ErrorState from '../ErrorState';
import logger from '../../utils/logger';
import { getCurrentMedicId } from '../../utils/auth';

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
  first_name?: string;
  last_name?: string;
  visit_type?: string;
  filiale?: string;
  temperature?: number;
  pouls?: number;
  tension_arterielle?: string;
  poids?: number;
  taille?: number;
  glycemie?: number;
  test_palu?: string;
  test_typhoide?: string;
  test_dengue?: string;
  urines_albumine?: string;
  urines_sucre?: string;
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
  const [showSifcaDialog, setShowSifcaDialog] = useState(false);
  const [sifcaDocType, setSifcaDocType] = useState<SifcaDocType>('fiche-cms');
  const [sifcaVisitType, setSifcaVisitType] = useState<'consultation' | 'systematique' | 'embauche' | ''>('');
  const [sifcaFiliale, setSifcaFiliale] = useState('');
  const [sifcaMedecin, setSifcaMedecin] = useState('');
  const [sifcaSendEmail, setSifcaSendEmail] = useState(false);
  const [sifcaDoctors, setSifcaDoctors] = useState<{ id: string; nom: string; prenom: string; email: string; specialite: string }[]>([]);
  const [sifcaTargetDoctor, setSifcaTargetDoctor] = useState('');
  const [sifcaSending, setSifcaSending] = useState(false);

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
        .eq('medic_id', getCurrentMedicId()!)
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
          temperature: editedPatient.temperature ?? null,
          pouls: editedPatient.pouls ?? null,
          tension_arterielle: editedPatient.tension_arterielle || null,
          poids: editedPatient.poids ?? null,
          taille: editedPatient.taille ?? null,
          glycemie: editedPatient.glycemie ?? null,
          test_palu: editedPatient.test_palu || null,
          test_typhoide: editedPatient.test_typhoide || null,
          test_dengue: editedPatient.test_dengue || null,
          urines_albumine: editedPatient.urines_albumine || null,
          urines_sucre: editedPatient.urines_sucre || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', patient.id)
        .eq('medic_id', getCurrentMedicId()!);

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
        .eq('id', patient.id)
        .eq('medic_id', getCurrentMedicId()!);

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
        label: 'Actif',
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
                      className="text-lg sm:text-xl md:text-2xl font-bold theme-text-primary truncate"
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
                        placeholder="+225 07 00 00 00 00"
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
                        <option value="active">Actif</option>
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

                {/* Signes Vitaux */}
                <div className={`bg-[#0f172a] rounded-xl border p-3 sm:p-3.5 transition-all duration-200 ${
                  isEditing ? 'border-rose-500/50 shadow-[0_0_0_1px_rgba(244,63,94,0.15)]' : 'border-[#334155]'
                }`}>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
                        isEditing ? 'bg-rose-500/20' : 'bg-rose-500/10'
                      }`}>
                        <Activity size={14} className="text-rose-400 sm:w-4 sm:h-4" />
                      </div>
                      <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Signes vitaux</span>
                    </div>
                    {isEditing && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-medium">
                        <Edit size={9} />
                        Modifiable
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {/* Température */}
                    <div className={`rounded-lg p-3 transition-colors duration-150 ${isEditing ? 'bg-[#1e293b] ring-1 ring-orange-400/20' : 'bg-[#1e293b]'}`}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Thermometer size={12} className="text-orange-400 flex-shrink-0" />
                        <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wide">Température</p>
                      </div>
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            step="0.1"
                            min="30"
                            max="45"
                            value={editedPatient.temperature ?? ''}
                            onChange={(e) => setEditedPatient({ ...editedPatient, temperature: e.target.value ? parseFloat(e.target.value) : undefined })}
                            placeholder="37.0"
                            aria-label="Température en degrés Celsius"
                            className="w-full min-h-[36px] bg-[#0f172a] border border-[#475569] rounded-lg px-2.5 py-1.5 text-sm font-semibold text-white placeholder-gray-600 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all duration-150"
                          />
                          <span className="text-orange-400/70 text-xs font-medium flex-shrink-0 bg-orange-400/10 px-1.5 py-1 rounded">°C</span>
                        </div>
                      ) : (
                        <p className={`text-sm font-semibold ${patient.temperature != null ? 'text-white' : 'text-gray-600'}`}>
                          {patient.temperature != null ? `${patient.temperature} °C` : '—'}
                        </p>
                      )}
                    </div>

                    {/* Pouls */}
                    <div className={`rounded-lg p-3 transition-colors duration-150 ${isEditing ? 'bg-[#1e293b] ring-1 ring-pink-400/20' : 'bg-[#1e293b]'}`}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Heart size={12} className="text-pink-400 flex-shrink-0" />
                        <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wide">Pouls</p>
                      </div>
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="20"
                            max="250"
                            value={editedPatient.pouls ?? ''}
                            onChange={(e) => setEditedPatient({ ...editedPatient, pouls: e.target.value ? parseInt(e.target.value) : undefined })}
                            placeholder="70"
                            aria-label="Pouls en battements par minute"
                            className="w-full min-h-[36px] bg-[#0f172a] border border-[#475569] rounded-lg px-2.5 py-1.5 text-sm font-semibold text-white placeholder-gray-600 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-150"
                          />
                          <span className="text-pink-400/70 text-xs font-medium flex-shrink-0 bg-pink-400/10 px-1.5 py-1 rounded">bpm</span>
                        </div>
                      ) : (
                        <p className={`text-sm font-semibold ${patient.pouls != null ? 'text-white' : 'text-gray-600'}`}>
                          {patient.pouls != null ? `${patient.pouls} bpm` : '—'}
                        </p>
                      )}
                    </div>

                    {/* Tension */}
                    <div className={`rounded-lg p-3 transition-colors duration-150 ${isEditing ? 'bg-[#1e293b] ring-1 ring-red-400/20' : 'bg-[#1e293b]'}`}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Activity size={12} className="text-red-400 flex-shrink-0" />
                        <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wide">Tension</p>
                      </div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedPatient.tension_arterielle || ''}
                          onChange={(e) => setEditedPatient({ ...editedPatient, tension_arterielle: e.target.value })}
                          placeholder="12/8"
                          aria-label="Tension artérielle (systolique/diastolique)"
                          className="w-full min-h-[36px] bg-[#0f172a] border border-[#475569] rounded-lg px-2.5 py-1.5 text-sm font-semibold text-white placeholder-gray-600 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition-all duration-150"
                        />
                      ) : (
                        <p className={`text-sm font-semibold ${patient.tension_arterielle ? 'text-white' : 'text-gray-600'}`}>
                          {patient.tension_arterielle || '—'}
                        </p>
                      )}
                    </div>

                    {/* Poids */}
                    <div className={`rounded-lg p-3 transition-colors duration-150 ${isEditing ? 'bg-[#1e293b] ring-1 ring-green-400/20' : 'bg-[#1e293b]'}`}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Scale size={12} className="text-green-400 flex-shrink-0" />
                        <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wide">Poids</p>
                      </div>
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            step="0.1"
                            min="1"
                            max="300"
                            value={editedPatient.poids ?? ''}
                            onChange={(e) => setEditedPatient({ ...editedPatient, poids: e.target.value ? parseFloat(e.target.value) : undefined })}
                            placeholder="70"
                            aria-label="Poids en kilogrammes"
                            className="w-full min-h-[36px] bg-[#0f172a] border border-[#475569] rounded-lg px-2.5 py-1.5 text-sm font-semibold text-white placeholder-gray-600 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all duration-150"
                          />
                          <span className="text-green-400/70 text-xs font-medium flex-shrink-0 bg-green-400/10 px-1.5 py-1 rounded">kg</span>
                        </div>
                      ) : (
                        <p className={`text-sm font-semibold ${patient.poids != null ? 'text-white' : 'text-gray-600'}`}>
                          {patient.poids != null ? `${patient.poids} kg` : '—'}
                        </p>
                      )}
                    </div>

                    {/* Taille */}
                    <div className={`rounded-lg p-3 transition-colors duration-150 ${isEditing ? 'bg-[#1e293b] ring-1 ring-blue-400/20' : 'bg-[#1e293b]'}`}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Ruler size={12} className="text-blue-400 flex-shrink-0" />
                        <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wide">Taille</p>
                      </div>
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="50"
                            max="250"
                            value={editedPatient.taille ?? ''}
                            onChange={(e) => setEditedPatient({ ...editedPatient, taille: e.target.value ? parseInt(e.target.value) : undefined })}
                            placeholder="170"
                            aria-label="Taille en centimètres"
                            className="w-full min-h-[36px] bg-[#0f172a] border border-[#475569] rounded-lg px-2.5 py-1.5 text-sm font-semibold text-white placeholder-gray-600 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-150"
                          />
                          <span className="text-blue-400/70 text-xs font-medium flex-shrink-0 bg-blue-400/10 px-1.5 py-1 rounded">cm</span>
                        </div>
                      ) : (
                        <p className={`text-sm font-semibold ${patient.taille != null ? 'text-white' : 'text-gray-600'}`}>
                          {patient.taille != null ? `${patient.taille} cm` : '—'}
                        </p>
                      )}
                    </div>

                    {/* Glycémie */}
                    <div className={`rounded-lg p-3 transition-colors duration-150 ${isEditing ? 'bg-[#1e293b] ring-1 ring-cyan-400/20' : 'bg-[#1e293b]'}`}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Droplets size={12} className="text-cyan-400 flex-shrink-0" />
                        <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wide">Glycémie</p>
                      </div>
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="10"
                            value={editedPatient.glycemie ?? ''}
                            onChange={(e) => setEditedPatient({ ...editedPatient, glycemie: e.target.value ? parseFloat(e.target.value) : undefined })}
                            placeholder="0.90"
                            aria-label="Glycémie en grammes par litre"
                            className="w-full min-h-[36px] bg-[#0f172a] border border-[#475569] rounded-lg px-2.5 py-1.5 text-sm font-semibold text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-150"
                          />
                          <span className="text-cyan-400/70 text-xs font-medium flex-shrink-0 bg-cyan-400/10 px-1.5 py-1 rounded">g/L</span>
                        </div>
                      ) : (
                        <p className={`text-sm font-semibold ${patient.glycemie != null ? 'text-white' : 'text-gray-600'}`}>
                          {patient.glycemie != null ? `${patient.glycemie} g/L` : '—'}
                        </p>
                      )}
                    </div>

                    {/* Test Palu */}
                    <div className={`rounded-lg p-3 col-span-2 sm:col-span-1 transition-colors duration-150 ${isEditing ? 'bg-[#1e293b] ring-1 ring-yellow-400/20' : 'bg-[#1e293b]'}`}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <FlaskConical size={12} className="text-yellow-400 flex-shrink-0" />
                        <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wide">Test Palu</p>
                      </div>
                      {isEditing ? (
                        <select
                          value={editedPatient.test_palu || ''}
                          onChange={(e) => setEditedPatient({ ...editedPatient, test_palu: e.target.value })}
                          aria-label="Résultat du test paludisme"
                          className="w-full min-h-[36px] bg-[#0f172a] border border-[#475569] rounded-lg px-2.5 py-1.5 text-sm font-semibold text-white focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-150 cursor-pointer"
                        >
                          <option value="">— Non fait</option>
                          <option value="negatif">Négatif</option>
                          <option value="positif">Positif</option>
                        </select>
                      ) : (
                        <p className={`text-sm font-semibold ${
                          patient.test_palu === 'positif' ? 'text-red-400' :
                          patient.test_palu ? 'text-green-400' : 'text-gray-600'
                        }`}>
                          {patient.test_palu
                            ? patient.test_palu.charAt(0).toUpperCase() + patient.test_palu.slice(1)
                            : '—'}
                        </p>
                      )}
                    </div>

                    {/* Test Typhoïde */}
                    <div className={`rounded-lg p-3 col-span-2 sm:col-span-1 transition-colors duration-150 ${isEditing ? 'bg-[#1e293b] ring-1 ring-orange-400/20' : 'bg-[#1e293b]'}`}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <FlaskConical size={12} className="text-orange-400 flex-shrink-0" />
                        <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wide">Test Typhoïde</p>
                      </div>
                      {isEditing ? (
                        <select
                          value={editedPatient.test_typhoide || ''}
                          onChange={(e) => setEditedPatient({ ...editedPatient, test_typhoide: e.target.value })}
                          aria-label="Résultat du test typhoïde"
                          className="w-full min-h-[36px] bg-[#0f172a] border border-[#475569] rounded-lg px-2.5 py-1.5 text-sm font-semibold text-white focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all duration-150 cursor-pointer"
                        >
                          <option value="">— Non fait</option>
                          <option value="negatif">Négatif</option>
                          <option value="positif">Positif</option>
                        </select>
                      ) : (
                        <p className={`text-sm font-semibold ${
                          patient.test_typhoide === 'positif' ? 'text-red-400' :
                          patient.test_typhoide ? 'text-green-400' : 'text-gray-600'
                        }`}>
                          {patient.test_typhoide
                            ? patient.test_typhoide.charAt(0).toUpperCase() + patient.test_typhoide.slice(1)
                            : '—'}
                        </p>
                      )}
                    </div>

                    {/* Test Dengue */}
                    <div className={`rounded-lg p-3 col-span-2 sm:col-span-1 transition-colors duration-150 ${isEditing ? 'bg-[#1e293b] ring-1 ring-pink-400/20' : 'bg-[#1e293b]'}`}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <FlaskConical size={12} className="text-pink-400 flex-shrink-0" />
                        <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wide">Test Dengue</p>
                      </div>
                      {isEditing ? (
                        <select
                          value={editedPatient.test_dengue || ''}
                          onChange={(e) => setEditedPatient({ ...editedPatient, test_dengue: e.target.value })}
                          aria-label="Résultat du test dengue"
                          className="w-full min-h-[36px] bg-[#0f172a] border border-[#475569] rounded-lg px-2.5 py-1.5 text-sm font-semibold text-white focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-150 cursor-pointer"
                        >
                          <option value="">— Non fait</option>
                          <option value="negatif">Négatif</option>
                          <option value="positif">Positif</option>
                        </select>
                      ) : (
                        <p className={`text-sm font-semibold ${
                          patient.test_dengue === 'positif' ? 'text-red-400' :
                          patient.test_dengue ? 'text-green-400' : 'text-gray-600'
                        }`}>
                          {patient.test_dengue
                            ? patient.test_dengue.charAt(0).toUpperCase() + patient.test_dengue.slice(1)
                            : '—'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* URINES */}
                <div className="bg-[#0f172a] rounded-xl border border-[#334155] p-3 sm:p-3.5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                      <Droplets size={14} className="text-teal-400" />
                    </div>
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Urines</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Albumine */}
                    <div className={`rounded-lg p-3 transition-colors duration-150 ${isEditing ? 'bg-[#1e293b] ring-1 ring-teal-400/20' : 'bg-[#1e293b]'}`}>
                      <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wide mb-2">Albumine</p>
                      {isEditing ? (
                        <select
                          value={editedPatient.urines_albumine || ''}
                          onChange={(e) => setEditedPatient({ ...editedPatient, urines_albumine: e.target.value })}
                          aria-label="Résultat albumine"
                          className="w-full min-h-[36px] bg-[#0f172a] border border-[#475569] rounded-lg px-2.5 py-1.5 text-sm font-semibold text-white focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-150 cursor-pointer"
                        >
                          <option value="">— Non fait</option>
                          <option value="negatif">Négatif</option>
                          <option value="positif">Positif</option>
                        </select>
                      ) : (
                        <p className={`text-sm font-semibold ${patient.urines_albumine === 'positif' ? 'text-red-400' : patient.urines_albumine === 'negatif' ? 'text-green-400' : 'text-gray-600'}`}>
                          {patient.urines_albumine === 'positif' ? '+ Positif' : patient.urines_albumine === 'negatif' ? '- Négatif' : '—'}
                        </p>
                      )}
                    </div>
                    {/* Sucre */}
                    <div className={`rounded-lg p-3 transition-colors duration-150 ${isEditing ? 'bg-[#1e293b] ring-1 ring-teal-400/20' : 'bg-[#1e293b]'}`}>
                      <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wide mb-2">Sucre</p>
                      {isEditing ? (
                        <select
                          value={editedPatient.urines_sucre || ''}
                          onChange={(e) => setEditedPatient({ ...editedPatient, urines_sucre: e.target.value })}
                          aria-label="Résultat sucre"
                          className="w-full min-h-[36px] bg-[#0f172a] border border-[#475569] rounded-lg px-2.5 py-1.5 text-sm font-semibold text-white focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-150 cursor-pointer"
                        >
                          <option value="">— Non fait</option>
                          <option value="negatif">Négatif</option>
                          <option value="positif">Positif</option>
                        </select>
                      ) : (
                        <p className={`text-sm font-semibold ${patient.urines_sucre === 'positif' ? 'text-red-400' : patient.urines_sucre === 'negatif' ? 'text-green-400' : 'text-gray-600'}`}>
                          {patient.urines_sucre === 'positif' ? '+ Positif' : patient.urines_sucre === 'negatif' ? '- Négatif' : '—'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="group bg-[#0f172a] rounded-xl border border-[#334155] p-3 sm:p-3.5 hover:border-cyan-500/30 transition-colors">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                      <FileText size={14} className="text-cyan-400 sm:w-4 sm:h-4" />
                    </div>
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Notes interrogatoires</span>
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
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSifcaVisitType((patient.visit_type as any) || '');
                          setSifcaFiliale(patient.filiale || '');
                          setShowSifcaDialog(true);
                        }}
                        className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 text-sm font-medium text-emerald-400 hover:text-white hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl transition-all cursor-pointer"
                        title="Générer rapport SIFCA PDF"
                      >
                        <Printer size={16} />
                        <span className="hidden sm:inline">Rapport SIFCA</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleEdit}
                        className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all shadow-lg shadow-blue-500/25 cursor-pointer"
                      >
                        <Edit size={16} />
                        Modifier
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* SIFCA Report Dialog */}
      {showSifcaDialog && patient && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#334155]">
              <div className="flex items-center gap-2">
                <Printer size={18} className="text-emerald-400" />
                <h3 className="text-white font-semibold text-sm">Rapport SIFCA</h3>
              </div>
              <button type="button" aria-label="Fermer" onClick={() => setShowSifcaDialog(false)} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Type de document */}
              <div>
                <label className="block text-gray-400 text-xs font-medium uppercase tracking-wide mb-1.5">Type de document</label>
                <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
                  {SIFCA_DOC_TYPES.map((dt) => (
                    <label
                      key={dt.id}
                      className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-all ${
                        sifcaDocType === dt.id
                          ? 'bg-emerald-500/20 border border-emerald-500/50'
                          : 'hover:bg-[#334155]/50 border border-transparent'
                      }`}
                    >
                      <input
                        type="radio"
                        name="sifcaDocType"
                        value={dt.id}
                        checked={sifcaDocType === dt.id}
                        onChange={() => setSifcaDocType(dt.id)}
                        className="accent-emerald-500 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <span className={`text-sm font-medium block ${sifcaDocType === dt.id ? 'text-emerald-400' : 'text-gray-300'}`}>{dt.label}</span>
                        <span className="text-xs text-gray-500 block truncate">{dt.description}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Médecin */}
              <div>
                <label className="block text-gray-400 text-xs font-medium uppercase tracking-wide mb-1.5">Médecin</label>
                <input
                  type="text"
                  value={sifcaMedecin}
                  onChange={(e) => setSifcaMedecin(e.target.value)}
                  placeholder="Nom du médecin"
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Type de visite (only for Fiche CMS) */}
              {sifcaDocType === 'fiche-cms' && (
                <div>
                  <label className="block text-gray-400 text-xs font-medium uppercase tracking-wide mb-1.5">Type de visite</label>
                  <div className="space-y-2">
                    {[
                      { value: 'consultation', label: 'Consultation' },
                      { value: 'systematique', label: 'Visite Systématique' },
                      { value: 'embauche', label: "Visite d'embauche" },
                    ].map((v) => (
                      <label key={v.value} className="flex items-center gap-2.5 cursor-pointer group">
                        <div
                          onClick={() => setSifcaVisitType(v.value as any)}
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
                            sifcaVisitType === v.value
                              ? 'bg-emerald-500 border-emerald-500'
                              : 'border-[#475569] group-hover:border-emerald-500/50'
                          }`}
                        >
                          {sifcaVisitType === v.value && <div className="w-2 h-2 bg-white rounded-sm" />}
                        </div>
                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{v.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Filiale (only for Fiche CMS) */}
              {sifcaDocType === 'fiche-cms' && (
                <div>
                  <label className="block text-gray-400 text-xs font-medium uppercase tracking-wide mb-1.5">Filiale</label>
                  <select
                    value={sifcaFiliale}
                    onChange={(e) => setSifcaFiliale(e.target.value)}
                    aria-label="Filiale SIFCA"
                    title="Filiale SIFCA"
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                  >
                    <option value="">— Sélectionner</option>
                    {['AUTRES', 'SIFCA', 'SAPH', 'PALMCI', 'SANIA', 'SUCRIVOIRE', 'SIFCOMASSUR'].map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Option envoyer par email */}
              <div className="mt-2 pt-3 border-t border-[#334155]">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sifcaSendEmail}
                    onChange={(e) => {
                      setSifcaSendEmail(e.target.checked);
                      if (e.target.checked && sifcaDoctors.length === 0) {
                        supabase.from('medics').select('id, nom, prenom, email, specialite').neq('id', getCurrentMedicId()!).then(({ data }) => {
                          setSifcaDoctors((data || []).filter((d: any) => d.email));
                        });
                      }
                    }}
                    className="accent-blue-500"
                  />
                  <span className="text-sm text-gray-300">Envoyer aussi par email</span>
                </label>

                {sifcaSendEmail && (
                  <div className="mt-2 space-y-1.5 max-h-[120px] overflow-y-auto">
                    {sifcaDoctors.map((doc) => (
                      <label
                        key={doc.id}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                          sifcaTargetDoctor === doc.email ? 'bg-blue-500/20 border border-blue-500/50' : 'hover:bg-[#334155]/50 border border-transparent'
                        }`}
                      >
                        <input type="radio" name="sifcaEmailTarget" value={doc.email} checked={sifcaTargetDoctor === doc.email} onChange={() => setSifcaTargetDoctor(doc.email)} className="accent-blue-500" />
                        <div>
                          <span className={`text-sm font-medium ${sifcaTargetDoctor === doc.email ? 'text-blue-400' : 'text-gray-300'}`}>{doc.prenom} {doc.nom}</span>
                          <span className="text-xs text-gray-500 block">{doc.email}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[#334155]">
              <button
                type="button"
                onClick={() => { setShowSifcaDialog(false); setSifcaSendEmail(false); setSifcaTargetDoctor(''); }}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#334155] rounded-xl transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={sifcaSending}
                onClick={async () => {
                  const docData = {
                    name: patient.name,
                    first_name: patient.first_name,
                    last_name: patient.last_name,
                    date_of_birth: patient.date_of_birth,
                    gender: patient.gender,
                    temperature: patient.temperature,
                    poids: patient.poids,
                    taille: patient.taille,
                    tension_arterielle: patient.tension_arterielle,
                    glycemie: patient.glycemie,
                    urines_albumine: patient.urines_albumine,
                    urines_sucre: patient.urines_sucre,
                    visitType: sifcaVisitType || undefined,
                    filiale: sifcaFiliale || undefined,
                    medecin: sifcaMedecin || undefined,
                  };

                  // Generate and download PDF
                  generateSifcaDocument(sifcaDocType, docData);

                  // Send by email if checked
                  if (sifcaSendEmail && sifcaTargetDoctor) {
                    setSifcaSending(true);
                    const result = generateSifcaDocumentBase64(sifcaDocType, docData);
                    if (result) {
                      const docLabel = SIFCA_DOC_TYPES.find(d => d.id === sifcaDocType)?.label || sifcaDocType;
                      const token = localStorage.getItem('auth_token');
                      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`;
                      try {
                        await fetch(apiUrl, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                          body: JSON.stringify({
                            to: sifcaTargetDoctor,
                            subject: `${docLabel} — ${patient.name}`,
                            html: `<p>Veuillez trouver ci-joint le document <strong>${docLabel}</strong> pour le patient <strong>${patient.name}</strong>.</p><p>Document généré le ${new Date().toLocaleDateString('fr-FR')}.</p><p><em>MediCare Pro</em></p>`,
                            attachments: [{ filename: result.filename, content: result.base64.split(',')[1] }],
                          }),
                        });
                        showToast('Document envoyé par email', 'success');
                      } catch {
                        showToast('Erreur envoi email', 'error');
                      }
                    }
                    setSifcaSending(false);
                  }

                  setShowSifcaDialog(false);
                  setSifcaDocType('fiche-cms');
                  setSifcaVisitType('');
                  setSifcaFiliale('');
                  setSifcaMedecin('');
                  setSifcaSendEmail(false);
                  setSifcaTargetDoctor('');
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                {sifcaSending ? (
                  <><Mail size={15} className="animate-pulse" /> Envoi...</>
                ) : sifcaSendEmail ? (
                  <><Mail size={15} /> Générer &amp; Envoyer</>
                ) : (
                  <><Printer size={15} /> Générer PDF</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
