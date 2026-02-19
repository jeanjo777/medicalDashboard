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
  if (score == null) return 'bg-[var(--bg-tertiary)] theme-text-muted border-[var(--border-color)]';
  if (score <= 30) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
  if (score <= 60) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
  if (score <= 80) return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
  return 'bg-red-500/10 text-red-500 border-red-500/20';
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
      className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] p-4 hover:shadow-md hover:border-emerald-500/30 transition-all duration-200 group"
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
          <h3 className="theme-text-primary font-semibold text-base mb-0.5 truncate">
            {patient.name}
          </h3>
          <p className="theme-text-muted text-xs">
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
            <span className="theme-text-muted">Pathologie</span>
            <span className="theme-text-secondary font-medium truncate ml-2 max-w-[200px]">
              {patient.primary_pathology}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="theme-text-muted">Score de risque</span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getRiskScoreColor(patient.riskScore)}`}>
            {patient.riskScore != null ? `${patient.riskScore}%` : '—'}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="theme-text-muted">Email</span>
          <span className="theme-text-secondary font-medium truncate ml-2 max-w-[200px]">
            {patient.email}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="theme-text-muted">Téléphone</span>
          <span className="theme-text-secondary font-medium">
            {patient.phone || '—'}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="theme-text-muted">Ajouté le</span>
          <span className="theme-text-secondary font-medium">
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
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-emerald-500 hover:text-white hover:bg-emerald-500 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 border border-emerald-500/20 hover:border-emerald-500"
        aria-label={`Voir les détails de ${patient.name}`}
      >
        <Eye size={18} strokeWidth={2} />
        <span>Voir les détails</span>
      </button>
    </div>
  );
};

export default PatientCardMobile;
