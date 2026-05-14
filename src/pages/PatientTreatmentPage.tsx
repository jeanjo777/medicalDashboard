import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Activity, FileText, Clock, AlertCircle, Save, Pill, Stethoscope } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/Common/ToastNotification';
import logger from '../utils/logger';
import { getCurrentMedicId } from '../utils/auth';

interface Patient {
  id: string;
  email: string;
  name: string;
  age: number | null;
  gender: string | null;
  profile_pic: string | null;
  registered_at: string;
}

interface Consultation {
  id: string;
  symptoms: string;
  duration: string | null;
  intensity: string | null;
  other_signs: string | null;
  ai_response: string | null;
  diagnosis_summary: string | null;
  recommendations: string | null;
  status: string;
  urgency_level?: string | null;
  created_at: string;
  medic_notes?: string | null;
  prescription?: string | null;
  follow_up_date?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
}

type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

const urgencyConfig: Record<UrgencyLevel, { label: string; color: string; bgColor: string }> = {
  low: { label: 'Faible', color: 'text-green-700', bgColor: 'bg-green-100 border-green-300' },
  medium: { label: 'Modere', color: 'text-yellow-700', bgColor: 'bg-yellow-100 border-yellow-300' },
  high: { label: 'Eleve', color: 'text-orange-700', bgColor: 'bg-orange-100 border-orange-300' },
  critical: { label: 'Critique', color: 'text-red-700', bgColor: 'bg-red-100 border-red-300' },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  ai_analyzed: { label: 'Analyse IA', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  doctor_reviewing: { label: 'En cours', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  completed: { label: 'Complete', color: 'bg-teal-100 text-teal-800 border-teal-300' },
  reviewed: { label: 'Traite', color: 'bg-green-100 text-green-800 border-green-300' },
  patient_notified: { label: 'Patient notifie', color: 'bg-gray-100 text-gray-800 border-gray-300' },
};

const isValidUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const PatientTreatmentPage = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [treatmentForm, setTreatmentForm] = useState({
    medicNotes: '',
    prescription: '',
    followUpDate: '',
    status: 'reviewed',
  });

  useEffect(() => {
    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);

      if (!patientId || !isValidUUID(patientId)) {
        setError('Identifiant patient invalide');
        return;
      }

      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .eq('medic_id', getCurrentMedicId()!)
        .single();

      if (patientError) throw patientError;
      setPatient(patientData);

      const { data: consultationsData, error: consultationsError } = await supabase
        .from('consultations')
        .select('*')
        .eq('patient_id', patientId)
        .eq('medic_id', getCurrentMedicId()!)
        .order('created_at', { ascending: false });

      if (consultationsError) throw consultationsError;
      setConsultations(consultationsData || []);
    } catch (err: unknown) {
      logger.error('Error:', err instanceof Error ? err : undefined);
      setError('Impossible de charger les données du patient');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConsultation = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setTreatmentForm({
      medicNotes: consultation.medic_notes || '',
      prescription: consultation.prescription || '',
      followUpDate: consultation.follow_up_date || '',
      status: consultation.status,
    });
  };

  const handleSaveTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConsultation) return;

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const isReviewing = treatmentForm.status === 'reviewed' && selectedConsultation.status !== 'reviewed';

      const updateData: Record<string, any> = {
        medic_notes: treatmentForm.medicNotes,
        prescription: treatmentForm.prescription,
        follow_up_date: treatmentForm.followUpDate || null,
        status: treatmentForm.status,
        updated_at: new Date().toISOString(),
      };

      // Add reviewer info when marking as reviewed
      if (isReviewing && user.id) {
        updateData.reviewed_by = user.id;
        updateData.reviewed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('consultations')
        .update(updateData)
        .eq('id', selectedConsultation.id)
        .eq('medic_id', getCurrentMedicId()!);

      if (error) throw error;

      showToast('Traitement enregistré avec succès');
      fetchPatientData();
    } catch (err: unknown) {
      logger.error('Error:', err instanceof Error ? err : undefined);
      showToast('Erreur lors de la sauvegarde du traitement', 'error');
    }
  };

  const handleQuickStatusChange = async (consultationId: string, newStatus: string) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const updateData: Record<string, any> = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (newStatus === 'reviewed' && user.id) {
        updateData.reviewed_by = user.id;
        updateData.reviewed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('consultations')
        .update(updateData)
        .eq('id', consultationId)
        .eq('medic_id', getCurrentMedicId()!);

      if (error) throw error;
      fetchPatientData();
    } catch (err) {
      logger.error('Quick status change error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <p className="text-gray-900 font-semibold text-lg mb-2">Erreur</p>
          <p className="text-gray-600">{error || 'Patient introuvable'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 text-primary hover:underline"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center text-gray-600 hover:text-primary transition-all duration-300 mb-6 group"
        >
          <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium">Retour au tableau de bord</span>
        </button>

        <div className="glass backdrop-blur-xl bg-white/60 rounded-2xl shadow-xl border border-white/50 p-6 mb-6">
          <div className="flex items-start gap-6">
            <img
              src={patient.profile_pic || `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}&size=100&background=3b82f6&color=fff`}
              alt={patient.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <User className="text-primary" size={32} />
                {patient.name}
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar size={18} className="text-primary" />
                  <span className="text-sm">
                    <strong>Âge:</strong> {patient.age || 'N/A'} ans
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <User size={18} className="text-primary" />
                  <span className="text-sm">
                    <strong>Sexe:</strong> {patient.gender === 'male' ? 'Homme' : patient.gender === 'female' ? 'Femme' : patient.gender === 'child_boy' ? 'Enfant (Garçon)' : patient.gender === 'child_girl' ? 'Enfant (Fille)' : 'Autre'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Activity size={18} className="text-primary" />
                  <span className="text-sm">
                    <strong>Email:</strong> {patient.email}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-gray-600 text-sm">
                <Clock size={16} />
                Inscrit le {new Date(patient.registered_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="glass backdrop-blur-xl bg-white/60 rounded-2xl shadow-xl border border-white/50 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="text-primary" size={24} />
                Historique des consultations
              </h2>
              {consultations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Activity size={48} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Aucune consultation</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {consultations.map((consultation) => {
                    const status = statusConfig[consultation.status] || statusConfig.pending;
                    const urgency = consultation.urgency_level as UrgencyLevel | undefined;
                    const urgencyStyle = urgency ? urgencyConfig[urgency] : null;

                    return (
                      <div
                        key={consultation.id}
                        onClick={() => handleSelectConsultation(consultation)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                          selectedConsultation?.id === consultation.id
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 bg-white/50 hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2 gap-2 flex-wrap">
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold border ${status.color}`}>
                            {status.label}
                          </span>
                          {urgencyStyle && (
                            <span className={`text-xs px-2 py-1 rounded-full font-semibold border ${urgencyStyle.bgColor} ${urgencyStyle.color}`}>
                              {urgencyStyle.label}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-900 font-medium mb-1 line-clamp-2">{consultation.symptoms}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(consultation.created_at).toLocaleDateString('fr-FR')}
                          </p>
                          {consultation.status !== 'reviewed' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickStatusChange(consultation.id, 'reviewed');
                              }}
                              className="text-xs text-primary hover:text-blue-700 font-medium"
                              title="Marquer comme traite"
                            >
                              Traiter
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {!selectedConsultation ? (
              <div className="glass backdrop-blur-xl bg-white/60 rounded-2xl shadow-xl border border-white/50 p-12 text-center">
                <Stethoscope size={64} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 text-lg font-medium">Sélectionnez une consultation pour voir les détails</p>
                <p className="text-gray-400 text-sm mt-2">Les informations et le formulaire de traitement apparaîtront ici</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="glass backdrop-blur-xl bg-white/60 rounded-2xl shadow-xl border border-white/50 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Activity className="text-primary" size={28} />
                    Détails de la consultation
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-1">Symptômes</h3>
                      <p className="text-gray-900 bg-white/50 p-3 rounded-lg">{selectedConsultation.symptoms}</p>
                    </div>
                    {selectedConsultation.duration && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-1">Durée</h3>
                        <p className="text-gray-900 bg-white/50 p-3 rounded-lg">{selectedConsultation.duration}</p>
                      </div>
                    )}
                    {selectedConsultation.intensity && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-1">Intensité</h3>
                        <p className="text-gray-900 bg-white/50 p-3 rounded-lg capitalize">{selectedConsultation.intensity}</p>
                      </div>
                    )}
                    {selectedConsultation.other_signs && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-1">Autres signes</h3>
                        <p className="text-gray-900 bg-white/50 p-3 rounded-lg">{selectedConsultation.other_signs}</p>
                      </div>
                    )}
                    {selectedConsultation.diagnosis_summary && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-1">Résumé du diagnostic (IA)</h3>
                        <p className="text-gray-900 bg-blue-50/50 p-3 rounded-lg border border-blue-200">{selectedConsultation.diagnosis_summary}</p>
                      </div>
                    )}
                    {selectedConsultation.recommendations && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-1">Recommandations (IA)</h3>
                        <p className="text-gray-900 bg-blue-50/50 p-3 rounded-lg border border-blue-200">{selectedConsultation.recommendations}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="glass backdrop-blur-xl bg-white/60 rounded-2xl shadow-xl border border-white/50 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Pill className="text-primary" size={28} />
                    Traitement médical
                  </h2>
                  <form onSubmit={handleSaveTreatment} className="space-y-4">
                    <div>
                      <label className="block mb-2 text-sm font-semibold text-gray-700">
                        Notes médicales
                      </label>
                      <textarea
                        value={treatmentForm.medicNotes}
                        onChange={(e) => setTreatmentForm({ ...treatmentForm, medicNotes: e.target.value })}
                        className="w-full px-4 py-3 bg-white/60 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 resize-none"
                        rows={4}
                        placeholder="Observations, diagnostic médical, plan de traitement..."
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-semibold text-gray-700">
                        Prescription
                      </label>
                      <textarea
                        value={treatmentForm.prescription}
                        onChange={(e) => setTreatmentForm({ ...treatmentForm, prescription: e.target.value })}
                        className="w-full px-4 py-3 bg-white/60 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 resize-none"
                        rows={4}
                        placeholder="Médicaments, dosages, durée du traitement..."
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-semibold text-gray-700">
                        Date de suivi
                      </label>
                      <input
                        type="date"
                        value={treatmentForm.followUpDate}
                        onChange={(e) => setTreatmentForm({ ...treatmentForm, followUpDate: e.target.value })}
                        className="w-full px-4 py-3 bg-white/60 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-semibold text-gray-700">
                        Statut
                      </label>
                      <select
                        value={treatmentForm.status}
                        onChange={(e) => setTreatmentForm({ ...treatmentForm, status: e.target.value })}
                        className="w-full px-4 py-3 bg-white/60 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
                      >
                        <option value="pending">En attente</option>
                        <option value="ai_analyzed">Analyse IA terminee</option>
                        <option value="doctor_reviewing">En cours d'examen</option>
                        <option value="completed">Complete</option>
                        <option value="reviewed">Traite</option>
                        <option value="patient_notified">Patient notifie</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-primary to-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Save size={20} />
                      Enregistrer le traitement
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientTreatmentPage;
