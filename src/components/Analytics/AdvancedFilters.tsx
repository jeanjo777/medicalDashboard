import React from 'react';
import { X, Calendar, Users, Activity, AlertCircle, Sliders } from 'lucide-react';

interface Filters {
  dateRange: { start: string; end: string };
  department: string;
  medic: string;
  pathology: string;
  severity: string;
  ageRange: [number, number];
}

interface AdvancedFiltersProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  onClose: () => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ filters, setFilters, onClose }) => {
  const handleReset = () => {
    setFilters({
      dateRange: { start: '', end: '' },
      department: '',
      medic: '',
      pathology: '',
      severity: '',
      ageRange: [0, 100]
    });
  };

  const departments = ['Cardiologie', 'Neurologie', 'Pédiatrie', 'Orthopédie', 'Dermatologie'];
  const medics = ['Dr. Anderson', 'Dr. Chen', 'Dr. Martin', 'Dr. Rodriguez'];
  const pathologies = ['Hypertension', 'Diabète', 'Asthme', 'Arthrite', 'Migraine'];
  const severities = ['Faible', 'Modérée', 'Élevée', 'Critique'];

  const activeBadges = [];
  if (filters.dateRange.start) activeBadges.push({ label: `Du ${filters.dateRange.start}`, key: 'dateStart' });
  if (filters.dateRange.end) activeBadges.push({ label: `Au ${filters.dateRange.end}`, key: 'dateEnd' });
  if (filters.department) activeBadges.push({ label: filters.department, key: 'department' });
  if (filters.medic) activeBadges.push({ label: filters.medic, key: 'medic' });
  if (filters.pathology) activeBadges.push({ label: filters.pathology, key: 'pathology' });
  if (filters.severity) activeBadges.push({ label: `Sévérité: ${filters.severity}`, key: 'severity' });

  return (
    <div className="bg-[#1e293b] border-b border-[#334155] p-6 animate-in slide-in-from-top-2 duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sliders size={20} className="text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Filtres Avancés</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#334155] rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Calendar size={16} className="inline mr-2" />
              Date de début
            </label>
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => setFilters({ ...filters, dateRange: { ...filters.dateRange, start: e.target.value } })}
              className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Calendar size={16} className="inline mr-2" />
              Date de fin
            </label>
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => setFilters({ ...filters, dateRange: { ...filters.dateRange, end: e.target.value } })}
              className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Activity size={16} className="inline mr-2" />
              Département
            </label>
            <select
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les départements</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Users size={16} className="inline mr-2" />
              Médecin
            </label>
            <select
              value={filters.medic}
              onChange={(e) => setFilters({ ...filters, medic: e.target.value })}
              className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les médecins</option>
              {medics.map((medic) => (
                <option key={medic} value={medic}>{medic}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Activity size={16} className="inline mr-2" />
              Pathologie
            </label>
            <select
              value={filters.pathology}
              onChange={(e) => setFilters({ ...filters, pathology: e.target.value })}
              className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes les pathologies</option>
              {pathologies.map((path) => (
                <option key={path} value={path}>{path}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <AlertCircle size={16} className="inline mr-2" />
              Sévérité
            </label>
            <select
              value={filters.severity}
              onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
              className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes les sévérités</option>
              {severities.map((sev) => (
                <option key={sev} value={sev}>{sev}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            <Sliders size={16} className="inline mr-2" />
            Tranche d'âge: {filters.ageRange[0]} - {filters.ageRange[1]} ans
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              value={filters.ageRange[0]}
              onChange={(e) => setFilters({ ...filters, ageRange: [parseInt(e.target.value), filters.ageRange[1]] })}
              className="flex-1"
            />
            <input
              type="range"
              min="0"
              max="100"
              value={filters.ageRange[1]}
              onChange={(e) => setFilters({ ...filters, ageRange: [filters.ageRange[0], parseInt(e.target.value)] })}
              className="flex-1"
            />
          </div>
        </div>

        {activeBadges.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-2">Filtres actifs:</p>
            <div className="flex flex-wrap gap-2">
              {activeBadges.map((badge) => (
                <span
                  key={badge.key}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-full text-sm"
                >
                  {badge.label}
                  <button
                    onClick={() => {
                      if (badge.key === 'dateStart') setFilters({ ...filters, dateRange: { ...filters.dateRange, start: '' } });
                      if (badge.key === 'dateEnd') setFilters({ ...filters, dateRange: { ...filters.dateRange, end: '' } });
                      if (badge.key === 'department') setFilters({ ...filters, department: '' });
                      if (badge.key === 'medic') setFilters({ ...filters, medic: '' });
                      if (badge.key === 'pathology') setFilters({ ...filters, pathology: '' });
                      if (badge.key === 'severity') setFilters({ ...filters, severity: '' });
                    }}
                    className="hover:bg-blue-500/30 rounded-full p-0.5"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={handleReset}
            className="px-6 py-2 bg-[#334155] hover:bg-[#475569] text-white rounded-lg transition-colors"
          >
            Réinitialiser
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Appliquer
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilters;
