import React from 'react';
import { Eye } from 'lucide-react';
import { formatAge } from '../../utils/dateHelpers';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  status: string;
  created_at: string;
  gender?: string;
  primary_pathology?: string;
  riskScore?: number;
  age?: number;
}

interface PatientCardMobileProps {
  patient: Patient;
  onView: (id: string) => void;
  getStatusBadge: (status: string) => string;
  getStatusLabel: (status: string) => string;
  getRiskScoreColor?: (score: number | undefined | null) => string;
}

const defaultGetRiskScoreColor = (score: number | undefined | null): string => {
  if (score == null) return 'bg-gray-100 text-gray-500 border-gray-200';
  if (score <= 30) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (score <= 60) return 'bg-amber-100 text-amber-700 border-amber-200';
  if (score <= 80) return 'bg-orange-100 text-orange-700 border-orange-200';
  return 'bg-red-100 text-red-700 border-red-200';
};

const getGenderLabel = (gender: string | undefined): string => {
  if (!gender) return '—';
  const labels: Record<string, string> = {
    male: 'Homme',
    female: 'Femme',
    M: 'Homme',
    F: 'Femme',
    other: 'Autre',
  };
  return labels[gender] || gender;
};

const PatientCardMobile: React.FC<PatientCardMobileProps> = ({
  patient,
  onView,
  getStatusBadge,
  getStatusLabel,
  getRiskScoreColor = defaultGetRiskScoreColor,
}) => {
  return (
    <div
      className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md hover:border-emerald-200 transition-all duration-200 group"
      role="article"
      aria-label={`Patient ${patient.name}`}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
          <span className="text-white text-sm font-bold">
            {patient.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-gray-800 font-semibold text-base mb-0.5 truncate">
            {patient.name}
          </h3>
          <p className="text-gray-400 text-xs">
            {formatAge(patient.date_of_birth, patient.age ? `${patient.age} ans` : '—')} · {getGenderLabel(patient.gender)}
          </p>
        </div>

        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
            patient.status
          )} whitespace-nowrap flex-shrink-0`}
          role="status"
          aria-label={`Statut: ${getStatusLabel(patient.status)}`}
        >
          {getStatusLabel(patient.status)}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        {patient.primary_pathology && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Pathologie</span>
            <span className="text-gray-700 font-medium truncate ml-2 max-w-[200px]">
              {patient.primary_pathology}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Score de risque</span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getRiskScoreColor(patient.riskScore)}`}>
            {patient.riskScore != null ? `${patient.riskScore}%` : '—'}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Email</span>
          <span className="text-gray-700 font-medium truncate ml-2 max-w-[200px]">
            {patient.email}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Téléphone</span>
          <span className="text-gray-700 font-medium">
            {patient.phone || '—'}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Ajouté le</span>
          <span className="text-gray-700 font-medium">
            {new Date(patient.created_at).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })}
          </span>
        </div>
      </div>

      <button
        onClick={() => onView(patient.id)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-emerald-600 hover:text-white hover:bg-emerald-500 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 border border-emerald-200 hover:border-emerald-500"
        aria-label={`Voir les détails de ${patient.name}`}
      >
        <Eye size={18} strokeWidth={2} />
        <span>Voir les détails</span>
      </button>
    </div>
  );
};

export default PatientCardMobile;
