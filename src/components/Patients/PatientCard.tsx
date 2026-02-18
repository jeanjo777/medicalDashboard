import React from 'react';
import {
  User,
  Mail,
  Calendar,
  Activity,
  AlertTriangle,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
} from 'lucide-react';

interface PatientCardProps {
  patient: {
    id: string;
    email: string;
    name: string;
    age: number | null;
    gender: string | null;
    profile_pic: string | null;
    registered_at: string;
    totalConsultations?: number;
    pendingConsultations?: number;
    riskScore?: number;
    tags?: string[];
  };
  onView: (id: string) => void;
  onEdit: (patient: any) => void;
  onDelete: (id: string) => void;
}

const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  onView,
  onEdit,
  onDelete,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRiskColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
    if (score >= 70) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    if (score >= 40) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  };

  const getRiskLabel = (score?: number) => {
    if (!score) return 'Normal';
    if (score >= 70) return 'Critique';
    if (score >= 40) return 'Élevé';
    return 'Faible';
  };

  return (
    <div className="glass backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-lg border border-white/50 dark:border-gray-700/50 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          {patient.profile_pic ? (
            <img
              src={patient.profile_pic}
              alt={patient.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-xl">
              {getInitials(patient.name)}
            </div>
          )}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {patient.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <Mail size={14} />
              {patient.email}
            </p>
          </div>
        </div>

        {patient.riskScore !== undefined && patient.riskScore > 50 && (
          <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${getRiskColor(patient.riskScore)}`}>
            <AlertTriangle size={14} />
            {getRiskLabel(patient.riskScore)}
          </div>
        )}
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <User size={16} />
            Informations
          </span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {patient.age ? `${patient.age} ans` : 'N/A'} •{' '}
            {patient.gender === 'male' ? 'H' : patient.gender === 'female' ? 'F' : 'Autre'}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <Calendar size={16} />
            Inscrit le
          </span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {new Date(patient.registered_at).toLocaleDateString('fr-FR')}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <Activity size={16} />
            Consultations
          </span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {patient.totalConsultations || 0} totales
          </span>
        </div>

        {patient.pendingConsultations ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-2 flex items-center gap-2">
            <TrendingUp size={16} className="text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
              {patient.pendingConsultations} consultation(s) en attente
            </span>
          </div>
        ) : null}
      </div>

      {patient.tags && patient.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {patient.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full border border-blue-200 dark:border-blue-800"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => onView(patient.id)}
          className="flex-1 bg-gradient-to-r from-primary to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Eye size={16} />
          Voir détail
        </button>
        <button
          onClick={() => onEdit(patient)}
          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200"
          title="Modifier"
        >
          <Edit size={18} />
        </button>
        <button
          onClick={() => onDelete(patient.id)}
          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200"
          title="Supprimer"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default PatientCard;
