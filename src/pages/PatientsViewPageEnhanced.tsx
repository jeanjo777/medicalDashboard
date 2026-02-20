import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MedicalSidebarRefined from '../components/MedicalSidebarRefined';
import SearchFilters from '../components/Common/SearchFilters';
import Pagination from '../components/Common/Pagination';
import PatientDetailModal from '../components/Patients/PatientDetailModal';
import PatientCardMobile from '../components/Patients/PatientCardMobile';
import AddPatientModal from '../components/AddPatientModal';
import { useAdvancedSearch } from '../hooks/useAdvancedSearch';
import {
  Bell, Plus, Eye, Users, Activity, Clock,
  RefreshCw, WifiOff, Download, AlertTriangle, LayoutGrid, List,
  Phone, Calendar,
} from 'lucide-react';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorBoundary from '../components/ErrorBoundary';
import { formatAge } from '../utils/dateHelpers';

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  status: string;
  created_at: string;
  first_name?: string;
  last_name?: string;
  age?: number;
  gender?: string;
  primary_pathology?: string;
  riskScore?: number;
  address?: string;
  notes?: string;
  profile_pic?: string;
  updated_at?: string;
  registered_at?: string;
  emergency_contact?: string;
  last_visit?: string;
}

// Couleurs d'avatar dynamiques basées sur le nom
const getAvatarColor = (name: string): string => {
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-cyan-500',
    'bg-indigo-500',
    'bg-rose-500',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

// Risk score color helpers
const getRiskScoreColor = (score: number | undefined | null): string => {
  if (score == null) return 'bg-[var(--bg-tertiary)] theme-text-muted border-[var(--border-color)]';
  if (score <= 30) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
  if (score <= 60) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
  if (score <= 80) return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
  return 'bg-red-500/10 text-red-500 border-red-500/20';
};

const getRiskScoreLabel = (score: number | undefined | null): string => {
  if (score == null) return 'N/A';
  if (score <= 30) return 'Faible';
  if (score <= 60) return 'Modéré';
  if (score <= 80) return 'Élevé';
  return 'Critique';
};

const getGenderLabel = (gender: string | undefined): string => {
  if (!gender) return '—';
  const labels: Record<string, string> = {
    male: 'Homme',
    female: 'Femme',
    child_boy: 'Enfant (Garçon)',
    child_girl: 'Enfant (Fille)',
    M: 'Homme',
    F: 'Femme',
    other: 'Autre',
  };
  return labels[gender] || gender;
};

const PatientsViewPageEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('patients');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const {
    results: patients,
    total,
    page,
    totalPages,
    loading,
    error,
    filters,
    setFilters,
    resetFilters,
    nextPage,
    prevPage,
    goToPage,
    search,
  } = useAdvancedSearch<Patient>({
    table: 'patients',
    searchFields: ['name', 'email', 'phone', 'primary_pathology'],
    selectFields: '*',
    defaultFilters: {
      sortBy: 'created_at',
      sortOrder: 'desc',
      limit: 10,
    },
  });

  const handleViewPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPatientId(null);
  };

  const handlePatientUpdated = () => {
    search();
  };

  const handlePatientDeleted = () => {
    search();
  };

  const handlePatientAdded = () => {
    setIsAddModalOpen(false);
    search();
  };

  // Export CSV
  const handleExportCSV = useCallback(() => {
    if (patients.length === 0) return;

    const headers = ['Nom', 'Email', 'Téléphone', 'Contact d\'urgence', 'Genre', 'Âge', 'Pathologie', 'Score de risque', 'Statut', 'Dernière visite', 'Date d\'ajout'];
    const rows = patients.map(p => [
      p.name,
      p.email,
      p.phone || '',
      p.emergency_contact || '',
      getGenderLabel(p.gender),
      p.date_of_birth ? formatAge(p.date_of_birth, '') : (p.age?.toString() || ''),
      p.primary_pathology || '',
      p.riskScore?.toString() || '',
      getStatusLabel(p.status),
      p.last_visit ? new Date(p.last_visit).toLocaleDateString('fr-FR') : '',
      new Date(p.created_at).toLocaleDateString('fr-FR'),
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(';')),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `patients_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [patients]);

  // Données à afficher
  const displayedPatients = patients;
  const displayedTotal = total;

  // Calcul des statistiques
  const stats = useMemo(() => {
    const activeCount = patients.filter(p => p.status === 'active').length;
    const inTreatmentCount = patients.filter(p => p.status === 'in_treatment').length;
    const recoveredCount = patients.filter(p => p.status === 'recovered').length;
    const highRiskCount = patients.filter(p => (p.riskScore ?? 0) > 60).length;
    return { activeCount, inTreatmentCount, recoveredCount, highRiskCount };
  }, [patients]);

  const statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'active', label: 'En consultation' },
    { value: 'in_treatment', label: 'En traitement' },
    { value: 'recovered', label: 'Rétabli' },
    { value: 'inactive', label: 'Sorti' },
  ];

  const sortOptions = [
    { value: 'created_at', label: 'Date de création' },
    { value: 'name', label: 'Nom' },
    { value: 'email', label: 'Email' },
    { value: 'riskScore', label: 'Score de risque' },
    { value: 'status', label: 'Statut' },
  ];

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      'in_treatment': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      recovered: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      inactive: 'bg-[var(--bg-tertiary)] theme-text-muted border-[var(--border-color)]',
    };
    return badges[status] || badges.inactive;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: 'En consultation',
      'in_treatment': 'En traitement',
      recovered: 'Rétabli',
      inactive: 'Sorti',
    };
    return labels[status] || status;
  };


  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      <MedicalSidebarRefined activeItem={activeSection} onItemClick={setActiveSection} onCollapsedChange={setSidebarCollapsed} />

      <ErrorBoundary>
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <header className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] px-4 lg:px-6 py-3 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 ml-14 lg:ml-0">
              <span className="text-base font-semibold theme-text-primary hidden sm:block">
                MedicalAI
              </span>

            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                aria-label="Notifications"
              >
                <Bell size={16} className="theme-text-muted" />
              </button>

            </div>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-4 lg:p-8 overflow-auto bg-[var(--bg-primary)]">
          <ErrorBoundary>
          {/* Cartes statistiques */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-blue-500/10 rounded-2xl p-4 border border-blue-500/20 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users size={20} className="text-white" />
                </div>
                <div>
                  <p className="theme-text-muted text-xs sm:text-sm">Total</p>
                  <p className="theme-text-primary text-lg sm:text-xl font-bold">{displayedTotal}</p>
                </div>
              </div>
            </div>
            <div className="bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/20 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Activity size={20} className="text-white" />
                </div>
                <div>
                  <p className="theme-text-muted text-xs sm:text-sm">Actifs</p>
                  <p className="theme-text-primary text-lg sm:text-xl font-bold">{stats.activeCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-amber-500/10 rounded-2xl p-4 border border-amber-500/20 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock size={20} className="text-white" />
                </div>
                <div>
                  <p className="theme-text-muted text-xs sm:text-sm">En traitement</p>
                  <p className="theme-text-primary text-lg sm:text-xl font-bold">{stats.inTreatmentCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-red-500/10 rounded-2xl p-4 border border-red-500/20 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                  <AlertTriangle size={20} className="text-white" />
                </div>
                <div>
                  <p className="theme-text-muted text-xs sm:text-sm">Risque élevé</p>
                  <p className="theme-text-primary text-lg sm:text-xl font-bold">{stats.highRiskCount}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="w-full sm:w-auto">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold theme-text-primary">Liste des Patients</h2>
              <p className="theme-text-muted text-xs sm:text-sm mt-1">
                {displayedTotal} patient{displayedTotal > 1 ? 's' : ''} au total
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* View mode toggle */}
              <div className="hidden md:flex items-center bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-emerald-500/10 text-emerald-500' : 'theme-text-muted hover:text-[var(--text-primary)]'}`}
                  aria-label="Vue tableau"
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-emerald-500/10 text-emerald-500' : 'theme-text-muted hover:text-[var(--text-primary)]'}`}
                  aria-label="Vue grille"
                >
                  <LayoutGrid size={16} />
                </button>
              </div>

              {/* Export CSV */}
              <button
                onClick={handleExportCSV}
                disabled={displayedPatients.length === 0}
                className="flex items-center gap-2 px-3 py-2.5 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded-xl border border-[var(--border-color)] transition-all duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Exporter en CSV"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Export</span>
              </button>

              {/* Add patient */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-2xl transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 font-medium text-sm sm:text-base cursor-pointer"
                aria-label="Créer un nouveau patient"
              >
                <Plus size={18} />
                Nouveau Patient
              </button>
            </div>
          </div>

          <SearchFilters
            filters={filters}
            onFiltersChange={setFilters}
            onReset={resetFilters}
            statusOptions={statusOptions}
            sortOptions={sortOptions}
            showDateFilter={true}
            showStatusFilter={true}
            showSortFilter={true}
            placeholder="Rechercher par nom, email, téléphone ou pathologie..."
          />

          {loading && (
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <LoadingSkeleton.PatientCard key={i} />
              ))}
            </div>
          )}

          {error && (
            <div className="bg-[var(--bg-secondary)] rounded-2xl border border-red-500/20 p-8 text-center shadow-sm">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <WifiOff size={32} className="text-red-500" />
              </div>
              <h3 className="theme-text-primary text-lg font-semibold mb-2">Erreur de connexion</h3>
              <p className="theme-text-secondary text-sm mb-1">{error.message}</p>
              <p className="theme-text-muted text-xs mb-6">Vérifiez votre connexion internet ou réessayez</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => search()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all duration-200 font-medium cursor-pointer"
                >
                  <RefreshCw size={18} />
                  Réessayer
                </button>
              </div>
            </div>
          )}

          {!loading && !error && patients.length === 0 && (
            <div className="bg-[var(--bg-secondary)] rounded-2xl p-12 border border-[var(--border-color)] text-center shadow-sm">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={32} className="text-emerald-500" />
              </div>
              <div className="theme-text-primary text-lg font-semibold mb-2">Aucun patient trouvé</div>
              <p className="theme-text-muted text-sm max-w-md mx-auto">
                Essayez de modifier vos filtres de recherche ou ajoutez un nouveau patient
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 font-medium cursor-pointer shadow-lg shadow-emerald-500/25"
                aria-label="Créer un nouveau patient"
              >
                <Plus size={18} />
                Nouveau Patient
              </button>
            </div>
          )}

          {!loading && !error && patients.length > 0 && displayedPatients.length > 0 && (
            <>
              {/* Vue Desktop - Tableau */}
              {viewMode === 'table' && (
                <div className="hidden md:block bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full" role="table" aria-label="Liste des patients">
                      <thead className="bg-[var(--bg-tertiary)] border-b border-[var(--border-color)]">
                        <tr>
                          <th scope="col" className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-bold theme-text-muted uppercase tracking-wider">
                            Patient
                          </th>
                          <th scope="col" className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-bold theme-text-muted uppercase tracking-wider whitespace-nowrap">
                            Âge / Genre
                          </th>
                          <th scope="col" className="hidden lg:table-cell px-4 md:px-6 py-3 md:py-4 text-left text-xs font-bold theme-text-muted uppercase tracking-wider">
                            Contact
                          </th>
                          <th scope="col" className="hidden xl:table-cell px-4 md:px-6 py-3 md:py-4 text-left text-xs font-bold theme-text-muted uppercase tracking-wider">
                            Pathologie
                          </th>
                          <th scope="col" className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-bold theme-text-muted uppercase tracking-wider whitespace-nowrap">
                            Risque
                          </th>
                          <th scope="col" className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-bold theme-text-muted uppercase tracking-wider">
                            Statut
                          </th>
                          <th scope="col" className="hidden xl:table-cell px-4 md:px-6 py-3 md:py-4 text-left text-xs font-bold theme-text-muted uppercase tracking-wider whitespace-nowrap">
                            Date d'ajout
                          </th>
                          <th scope="col" className="px-4 md:px-6 py-3 md:py-4 text-right text-xs font-bold theme-text-muted uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-color)]">
                        {displayedPatients.map((patient) => (
                          <tr
                            key={patient.id}
                            className="hover:bg-[var(--bg-tertiary)] transition-all duration-150 group cursor-pointer"
                            role="row"
                            onClick={() => handleViewPatient(patient.id)}
                          >
                            <td className="px-4 md:px-6 py-3 md:py-4">
                              <div className="flex items-center gap-2 md:gap-3">
                                <div className={`w-9 h-9 md:w-10 md:h-10 ${getAvatarColor(patient.name)} rounded-full flex items-center justify-center flex-shrink-0`}>
                                  <span className="text-white text-xs md:text-sm font-semibold">
                                    {patient.name
                                      .split(' ')
                                      .map((n) => n[0])
                                      .join('')
                                      .toUpperCase()
                                      .slice(0, 2)}
                                  </span>
                                </div>
                                <div className="min-w-0">
                                  <div className="theme-text-primary font-medium text-sm md:text-base truncate">
                                    {patient.name}
                                  </div>
                                  <div className="theme-text-muted text-xs truncate">
                                    {patient.id.slice(0, 8)}...
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 md:px-6 py-3 md:py-4">
                              <div>
                                <span className="theme-text-secondary font-medium whitespace-nowrap text-sm md:text-base">
                                  {formatAge(patient.date_of_birth, patient.age ? `${patient.age} ans` : '—')}
                                </span>
                                <div className="theme-text-muted text-xs">
                                  {getGenderLabel(patient.gender)}
                                </div>
                              </div>
                            </td>
                            <td className="hidden lg:table-cell px-4 md:px-6 py-3 md:py-4">
                              <div className="theme-text-secondary text-sm truncate max-w-[200px]">{patient.email}</div>
                              <div className="theme-text-muted text-xs">{patient.phone || '—'}</div>
                              {patient.emergency_contact && (
                                <div className="flex items-center gap-1 text-xs mt-1">
                                  <Phone size={10} className="text-red-400" />
                                  <span className="text-red-300 truncate max-w-[180px]">{patient.emergency_contact}</span>
                                </div>
                              )}
                            </td>
                            <td className="hidden xl:table-cell px-4 md:px-6 py-3 md:py-4">
                              <span className="theme-text-secondary text-sm">
                                {patient.primary_pathology || '—'}
                              </span>
                            </td>
                            <td className="px-4 md:px-6 py-3 md:py-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getRiskScoreColor(patient.riskScore)} whitespace-nowrap`}
                              >
                                {patient.riskScore != null ? `${patient.riskScore}%` : '—'}
                              </span>
                            </td>
                            <td className="px-4 md:px-6 py-3 md:py-4">
                              <span
                                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusBadge(
                                  patient.status
                                )} whitespace-nowrap`}
                                role="status"
                                aria-label={`Statut: ${getStatusLabel(patient.status)}`}
                              >
                                {getStatusLabel(patient.status)}
                              </span>
                            </td>
                            <td className="hidden xl:table-cell px-4 md:px-6 py-3 md:py-4">
                              <span className="theme-text-muted text-sm whitespace-nowrap">
                                {new Date(patient.created_at).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })}
                              </span>
                            </td>
                            <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleViewPatient(patient.id); }}
                                className="inline-flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-emerald-600 hover:text-white hover:bg-emerald-500 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 opacity-80 group-hover:opacity-100"
                                aria-label={`Voir les détails de ${patient.name}`}
                              >
                                <Eye size={16} className="transition-transform group-hover:scale-110" />
                                <span className="hidden lg:inline">Voir</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Vue Desktop - Grid */}
              {viewMode === 'grid' && (
                <div className="hidden md:grid grid-cols-2 xl:grid-cols-3 gap-4">
                  {displayedPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] p-5 hover:shadow-lg hover:border-emerald-500/30 transition-all duration-200 cursor-pointer group"
                      onClick={() => handleViewPatient(patient.id)}
                    >
                      <div className="flex items-start gap-3 mb-4">
                        <div className={`w-12 h-12 ${getAvatarColor(patient.name)} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md`}>
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
                          <h3 className="theme-text-primary font-semibold text-base truncate">{patient.name}</h3>
                          <p className="theme-text-muted text-xs mt-0.5">
                            {formatAge(patient.date_of_birth, patient.age ? `${patient.age} ans` : '—')} · {getGenderLabel(patient.gender)}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(patient.status)} whitespace-nowrap flex-shrink-0`}
                        >
                          {getStatusLabel(patient.status)}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        {patient.primary_pathology && (
                          <div className="flex items-center justify-between">
                            <span className="theme-text-muted">Pathologie</span>
                            <span className="theme-text-secondary font-medium truncate ml-2 max-w-[180px]">{patient.primary_pathology}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="theme-text-muted">Risque</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getRiskScoreColor(patient.riskScore)}`}>
                            {patient.riskScore != null ? `${patient.riskScore}% - ${getRiskScoreLabel(patient.riskScore)}` : '—'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="theme-text-muted">Email</span>
                          <span className="theme-text-secondary truncate ml-2 max-w-[180px]">{patient.email}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="theme-text-muted">Téléphone</span>
                          <span className="theme-text-secondary">{patient.phone || '—'}</span>
                        </div>
                        {patient.emergency_contact && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone size={14} className="text-red-400" />
                            <span className="text-gray-400">Urgence:</span>
                            <span className="text-gray-200">{patient.emergency_contact}</span>
                          </div>
                        )}
                        {patient.last_visit && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar size={14} className="text-green-400" />
                            <span className="text-gray-400">Dernière visite:</span>
                            <span className="text-gray-200">{new Date(patient.last_visit).toLocaleDateString('fr-FR')}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center justify-between">
                        <span className="theme-text-muted text-xs">
                          Ajouté le {new Date(patient.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleViewPatient(patient.id); }}
                          className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1"
                        >
                          <Eye size={14} />
                          Détails
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Vue Mobile - Cards */}
              <div className="md:hidden space-y-3">
                {displayedPatients.map((patient) => (
                  <PatientCardMobile
                    key={patient.id}
                    patient={patient}
                    onView={handleViewPatient}
                    getStatusBadge={getStatusBadge}
                    getStatusLabel={getStatusLabel}
                    getRiskScoreColor={getRiskScoreColor}
                  />
                ))}
              </div>

              <div className="mt-4 sm:mt-6">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalItems={total}
                  itemsPerPage={filters.limit || 10}
                  onPageChange={goToPage}
                  onPrevious={prevPage}
                  onNext={nextPage}
                />
              </div>
            </>
          )}
          </ErrorBoundary>
        </main>
      </div>

      {selectedPatientId && (
        <PatientDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          patientId={selectedPatientId}
          onPatientUpdated={handlePatientUpdated}
          onPatientDeleted={handlePatientDeleted}
        />
      )}

      <AddPatientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onPatientAdded={handlePatientAdded}
      />
      </ErrorBoundary>
    </div>
  );
};

export default PatientsViewPageEnhanced;
