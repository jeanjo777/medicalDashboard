import React, { useEffect, useState } from 'react';
import {
  X,
  User,
  Mail,
  Calendar,
  Activity,
  FileText,
  Clock,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Phone,
  Stethoscope,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import logger from '../../utils/logger';

interface Consultation {
  id: string;
  symptoms: string;
  diagnosis: string | null;
  status: string;
  created_at: string;
  reviewed_at: string | null;
}

interface PatientDetailPanelProps {
  patientId: string;
  onClose: () => void;
}

const PatientDetailPanel: React.FC<PatientDetailPanelProps> = ({
  patientId,
  onClose,
}) => {
  const [patient, setPatient] = useState<any>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const token = localStorage.getItem('auth_token') || '';
        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-patient-summary`;

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ patientId }),
        });

        if (response.ok) {
          const data = await response.json();
          setPatient(data.patient);
          setConsultations(data.consultations || []);
        }
      } catch (error) {
        logger.error('Error fetching patient details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientDetails();
  }, [patientId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reviewed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'reviewed':
        return 'Traitée';
      case 'pending':
        return 'En attente';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-y-auto">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-y-auto p-6">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X size={24} />
        </button>
        <div className="text-center mt-20">
          <p className="text-gray-600 dark:text-gray-400">Patient introuvable</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-y-auto animate-slide-in-right">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dossier patient
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="glass backdrop-blur-xl bg-gradient-to-br from-primary/10 to-blue-600/10 rounded-2xl p-6">
            <div className="flex items-start gap-4 mb-4">
              {patient.profile_pic ? (
                <img
                  src={patient.profile_pic}
                  alt={patient.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {patient.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {patient.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Mail size={16} />
                  {patient.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/50 dark:bg-gray-700/50 rounded-lg p-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Âge</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {patient.age !== null && patient.age !== undefined ? `${patient.age} ans` : 'Non renseigné'}
                </p>
              </div>
              <div className="bg-white/50 dark:bg-gray-700/50 rounded-lg p-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Sexe</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {patient.gender === 'male' ? 'Homme' : patient.gender === 'female' ? 'Femme' : 'Autre'}
                </p>
              </div>
            </div>
          </div>

          <div className="glass backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-2xl p-6 border border-white/50 dark:border-gray-700/50">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity size={20} />
              Statistiques
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total consultations</p>
                <p className="text-3xl font-bold text-primary dark:text-blue-400">
                  {patient.totalConsultations || 0}
                </p>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">En attente</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {patient.pendingConsultations || 0}
                </p>
              </div>
              {patient.riskScore !== undefined && (
                <div className="col-span-2 text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Score de risque</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {patient.riskScore}%
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="glass backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-2xl p-6 border border-white/50 dark:border-gray-700/50">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText size={20} />
              Historique des consultations ({consultations.length})
            </h3>

            {consultations.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Stethoscope size={48} className="mx-auto mb-3 opacity-30" />
                <p>Aucune consultation enregistrée</p>
              </div>
            ) : (
              <div className="space-y-4">
                {consultations.map((consultation) => (
                  <div
                    key={consultation.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {format(new Date(consultation.created_at), 'PPP à HH:mm', { locale: fr })}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(consultation.status)}`}>
                        {getStatusLabel(consultation.status)}
                      </span>
                    </div>

                    <div className="mb-2">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Symptômes:</p>
                      <p className="text-sm text-gray-900 dark:text-white">{consultation.symptoms}</p>
                    </div>

                    {consultation.diagnosis && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Diagnostic:</p>
                        <p className="text-sm text-gray-900 dark:text-white">{consultation.diagnosis}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientDetailPanel;
