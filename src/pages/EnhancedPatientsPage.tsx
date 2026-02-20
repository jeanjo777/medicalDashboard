import React, { useState, useEffect, useMemo } from 'react';
import MedicalSidebarRefined from '../components/MedicalSidebarRefined';
import {
  Search,
  Plus,
  Filter,
  Download,
  Bell,
  User as UserIcon,
  ChevronUp,
  ChevronDown,
  X,
  TrendingUp,
  Users,
  Activity,
  Calendar,
  Eye,
  Edit,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format, isToday } from 'date-fns';
import AddPatientModal from '../components/AddPatientModal';
import EditPatientModal from '../components/EditPatientModal';
import PatientDetailModalEnhanced from '../components/PatientDetailModalEnhanced';
import { calculateAge } from '../utils/dateHelpers';
import { exportData } from '../utils/exportUtils';
import logger from '../utils/logger';

interface Patient {
  id: string;
  patient_id: string;
  name: string;
  age: number | null;
  gender: string | null;
  condition: string;
  status: 'active' | 'inactive' | 'in_treatment' | 'recovered';
  last_visit: string;
  created_at: string;
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  address?: string;
  primary_pathology?: string;
}

type SortField = 'patient_id' | 'name' | 'age' | 'gender' | 'condition' | 'status' | 'last_visit';
type SortDirection = 'asc' | 'desc';

const EnhancedPatientsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('patients');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCondition, setFilterCondition] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('patient_id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData: Patient[] = (data || []).map((patient, index) => ({
        id: patient.id,
        patient_id: `PT-${String(index + 1).padStart(3, '0')}`,
        name: patient.name || 'Unknown',
        age: calculateAge(patient.date_of_birth),
        gender: patient.gender,
        condition: patient.primary_pathology || 'Non renseigné',
        status: patient.status || 'active',
        last_visit: patient.registered_at || patient.created_at || new Date().toISOString(),
        created_at: patient.created_at || new Date().toISOString(),
        email: patient.email,
        phone: patient.phone,
        first_name: patient.first_name,
        last_name: patient.last_name,
        date_of_birth: patient.date_of_birth,
        address: patient.address,
        primary_pathology: patient.primary_pathology
      }));

      setPatients(formattedData);
    } catch (error) {
      logger.error('Error fetching patients:', error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowEditModal(true);
  };

  const handleDeleteClick = (patient: Patient) => {
    setPatientToDelete(patient);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!patientToDelete) return;

    setDeleteLoading(true);
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientToDelete.id);

      if (error) throw error;

      await fetchPatients();
      setShowDeleteConfirm(false);
      setPatientToDelete(null);
    } catch (error) {
      logger.error('Error deleting patient:', error);
      alert('Erreur lors de la suppression du patient');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setPatientToDelete(null);
  };

  const filteredAndSortedPatients = useMemo(() => {
    let filtered = patients;

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.patient_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.condition.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus);
    }

    if (filterCondition !== 'all') {
      filtered = filtered.filter(p => p.condition === filterCondition);
    }

    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'age') {
        aVal = aVal || 0;
        bVal = bVal || 0;
      }

      if (typeof aVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return filtered;
  }, [patients, searchQuery, filterStatus, filterCondition, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'inactive':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      case 'recovered':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'in_treatment':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'inactive':
        return 'Inactif';
      case 'recovered':
        return 'Guéri';
      case 'in_treatment':
        return 'En traitement';
      default:
        return status;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (gender: string | null) => {
    if (gender === 'Male') return 'bg-blue-500';
    if (gender === 'Female') return 'bg-pink-500';
    return 'bg-purple-500';
  };

  const uniqueConditions = useMemo(() => {
    return Array.from(new Set(patients.map(p => p.condition)));
  }, [patients]);

  const stats = useMemo(() => {
    return {
      total: patients.length,
      active: patients.filter(p => p.status === 'active').length,
      inactive: patients.filter(p => p.status === 'inactive').length,
      recovered: patients.filter(p => p.status === 'recovered').length,
      underTreatment: patients.filter(p => p.status === 'in_treatment').length,
    };
  }, [patients]);

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      <MedicalSidebarRefined activeItem={activeSection} onItemClick={setActiveSection} onCollapsedChange={setSidebarCollapsed} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Header */}
        <header className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] px-3 sm:px-4 lg:px-8 py-3 sm:py-4 sticky top-0 z-30">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-0 lg:justify-between">
            <div className="min-w-0 flex-1 lg:ml-0 ml-14">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold theme-text-primary">Patient Records</h1>
              <p className="theme-text-muted text-xs sm:text-sm mt-0.5 sm:mt-1 truncate">Manage and view patient information</p>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <div className="relative flex-1 lg:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted" size={18} />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full lg:w-80 pl-10 pr-4 py-2 sm:py-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-xs sm:text-sm theme-text-secondary placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <button className="relative p-2.5 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors" title="Notifications">
                <Bell size={22} className="theme-text-muted" />
              </button>

              <div className="flex items-center gap-3 px-4 py-2 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)]">
                <UserIcon size={20} className="theme-text-muted" />
                <span className="text-sm font-medium theme-text-primary">DA</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-4 lg:p-8 overflow-auto">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
            <div className="bg-[var(--bg-secondary)] rounded-xl p-3 sm:p-4 lg:p-6 border border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="theme-text-muted text-xs sm:text-sm mb-1 truncate">Total Patients</p>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold theme-text-primary">{stats.total}</h3>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="text-blue-500 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 sm:mt-3">
                <TrendingUp size={14} className="text-emerald-500" />
                <span className="text-xs font-medium text-emerald-500">+12.5%</span>
              </div>
            </div>

            <div className="bg-[var(--bg-secondary)] rounded-xl p-3 sm:p-4 lg:p-6 border border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="theme-text-muted text-xs sm:text-sm mb-1 truncate">Actifs</p>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold theme-text-primary">{stats.active}</h3>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Activity className="text-emerald-500 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-secondary)] rounded-xl p-3 sm:p-4 lg:p-6 border border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="theme-text-muted text-xs sm:text-sm mb-1 truncate">Guéris</p>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold theme-text-primary">{stats.recovered}</h3>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="text-blue-500 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-secondary)] rounded-xl p-3 sm:p-4 lg:p-6 border border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="theme-text-muted text-xs sm:text-sm mb-1 truncate">En traitement</p>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold theme-text-primary">{stats.underTreatment}</h3>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="text-orange-500 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] theme-text-secondary rounded-lg transition-colors text-xs sm:text-sm border border-[var(--border-color)]"
                >
                  <Filter size={16} />
                  <span>Filtres</span>
                </button>

                {(filterStatus !== 'all' || filterCondition !== 'all') && (
                  <button
                    onClick={() => {
                      setFilterStatus('all');
                      setFilterCondition('all');
                    }}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors text-xs sm:text-sm border border-red-500/20"
                  >
                    <X size={16} />
                    <span className="hidden sm:inline">Effacer</span>
                  </button>
                )}

                <span className="text-xs sm:text-sm theme-text-muted">
                  {filteredAndSortedPatients.length}/{patients.length} patients
                </span>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => {
                    exportData(
                      filteredAndSortedPatients.map(p => ({
                        ID: p.patient_id,
                        Nom: p.name,
                        Age: p.age,
                        Genre: p.gender || 'N/A',
                        Condition: p.condition,
                        Statut: p.status,
                        Derniere_visite: p.last_visit,
                      })),
                      'csv',
                      { filename: 'patients_export' }
                    );
                  }}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] theme-text-secondary rounded-lg transition-colors text-xs sm:text-sm border border-[var(--border-color)]"
                >
                  <Download size={16} />
                  <span className="hidden sm:inline">Export</span>
                </button>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs sm:text-sm font-medium shadow-lg shadow-blue-600/20 flex-1 sm:flex-initial justify-center"
                >
                  <Plus size={18} />
                  <span>Ajouter</span>
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex flex-wrap gap-4">
                <div>
                  <label className="block text-xs theme-text-muted mb-2">Statut</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm theme-text-secondary focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                    <option value="in_treatment">En traitement</option>
                    <option value="recovered">Guéri</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs theme-text-muted mb-2">Condition</label>
                  <select
                    value={filterCondition}
                    onChange={(e) => setFilterCondition(e.target.value)}
                    className="px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm theme-text-secondary focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">All Conditions</option>
                    {uniqueConditions.map(condition => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Patient Table - Desktop */}
          <div className="hidden md:block bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
                    <th
                      onClick={() => handleSort('patient_id')}
                      className="px-3 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold theme-text-muted uppercase tracking-wider cursor-pointer hover:text-[var(--text-secondary)] transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        ID
                        {sortField === 'patient_id' && (
                          sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('name')}
                      className="px-3 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold theme-text-muted uppercase tracking-wider cursor-pointer hover:text-[var(--text-secondary)] transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Nom
                        {sortField === 'name' && (
                          sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('age')}
                      className="px-3 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold theme-text-muted uppercase tracking-wider cursor-pointer hover:text-[var(--text-secondary)] transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Age
                        {sortField === 'age' && (
                          sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        )}
                      </div>
                    </th>
                    <th className="hidden lg:table-cell px-3 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold theme-text-muted uppercase tracking-wider">
                      Genre
                    </th>
                    <th
                      onClick={() => handleSort('condition')}
                      className="px-3 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold theme-text-muted uppercase tracking-wider cursor-pointer hover:text-[var(--text-secondary)] transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Condition
                        {sortField === 'condition' && (
                          sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('status')}
                      className="px-3 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold theme-text-muted uppercase tracking-wider cursor-pointer hover:text-[var(--text-secondary)] transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Statut
                        {sortField === 'status' && (
                          sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('last_visit')}
                      className="hidden lg:table-cell px-3 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold theme-text-muted uppercase tracking-wider cursor-pointer hover:text-[var(--text-secondary)] transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Dernière visite
                        {sortField === 'last_visit' && (
                          sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        )}
                      </div>
                    </th>
                    <th className="px-3 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold theme-text-muted uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center theme-text-muted">
                        Chargement...
                      </td>
                    </tr>
                  ) : filteredAndSortedPatients.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center theme-text-muted">
                        Aucun patient trouvé
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedPatients.map((patient, index) => (
                      <tr
                        key={patient.id}
                        onClick={() => {
                          setSelectedPatient(patient);
                          setShowDetailModal(true);
                        }}
                        className={`cursor-pointer transition-colors hover:bg-[var(--bg-tertiary)]/30 ${
                          index % 2 === 0 ? 'bg-[var(--bg-secondary)]' : 'bg-[var(--bg-primary)]/50'
                        }`}
                      >
                        <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                          <span className="text-xs lg:text-sm font-medium text-blue-400">{patient.patient_id}</span>
                        </td>
                        <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 lg:gap-3">
                            <div className={`w-8 h-8 lg:w-10 lg:h-10 ${getAvatarColor(patient.gender)} rounded-full flex items-center justify-center flex-shrink-0`}>
                              <span className="text-white text-xs lg:text-sm font-semibold">{getInitials(patient.name)}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs lg:text-sm font-medium theme-text-primary truncate max-w-[120px] lg:max-w-none">{patient.name}</p>
                              {isToday(new Date(patient.created_at)) && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] lg:text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                                  New
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                          <span className="text-xs lg:text-sm theme-text-secondary">
                            {patient.age !== null ? `${patient.age} ans` : 'N/A'}
                          </span>
                        </td>
                        <td className="hidden lg:table-cell px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                          <span className="text-sm theme-text-secondary">{patient.gender || 'N/A'}</span>
                        </td>
                        <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                          <span className="text-xs lg:text-sm theme-text-secondary truncate max-w-[100px] lg:max-w-none block">{patient.condition}</span>
                        </td>
                        <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 lg:px-3 py-0.5 lg:py-1 rounded-full text-[10px] lg:text-xs font-medium border ${getStatusColor(patient.status)}`}>
                            {formatStatus(patient.status)}
                          </span>
                        </td>
                        <td className="hidden lg:table-cell px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                          <span className="text-sm theme-text-secondary">
                            {format(new Date(patient.last_visit), 'MMM dd, yyyy')}
                          </span>
                        </td>
                        <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPatient(patient);
                                setShowDetailModal(true);
                              }}
                              className="p-2.5 hover:bg-blue-500/10 text-blue-500 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditPatient(patient);
                              }}
                              className="p-2.5 hover:bg-emerald-500/10 text-emerald-500 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(patient);
                              }}
                              className="p-2.5 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Patient Cards - Mobile */}
          <div className="md:hidden space-y-3">
            {loading ? (
              <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] p-6 text-center theme-text-muted">
                Chargement...
              </div>
            ) : filteredAndSortedPatients.length === 0 ? (
              <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] p-6 text-center theme-text-muted">
                Aucun patient trouvé
              </div>
            ) : (
              filteredAndSortedPatients.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => {
                    setSelectedPatient(patient);
                    setShowDetailModal(true);
                  }}
                  className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] p-4 cursor-pointer hover:bg-[var(--bg-tertiary)]/30 transition-colors active:scale-[0.98]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-10 h-10 ${getAvatarColor(patient.gender)} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white text-sm font-semibold">{getInitials(patient.name)}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium theme-text-primary truncate">{patient.name}</p>
                        <p className="text-xs theme-text-muted">{patient.patient_id} &middot; {patient.age !== null ? `${patient.age} ans` : 'Age N/A'}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border flex-shrink-0 ${getStatusColor(patient.status)}`}>
                      {formatStatus(patient.status)}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs theme-text-muted">
                      <span>{patient.condition}</span>
                      <span>{format(new Date(patient.last_visit), 'dd/MM/yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title="Modifier"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditPatient(patient);
                        }}
                        className="p-2 hover:bg-emerald-500/10 text-emerald-500 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        type="button"
                        title="Supprimer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(patient);
                        }}
                        className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Add Patient Modal */}
      <AddPatientModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onPatientAdded={fetchPatients}
      />

      {/* Edit Patient Modal */}
      {selectedPatient && (
        <EditPatientModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPatient(null);
          }}
          onPatientUpdated={fetchPatients}
          patient={selectedPatient}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && patientToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)] rounded-2xl shadow-2xl border border-[var(--border-color)] w-full max-w-md">
            <div className="p-6">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-red-500" size={24} />
              </div>
              <h3 className="text-xl font-bold theme-text-primary text-center mb-2">
                Confirmer la suppression
              </h3>
              <p className="theme-text-muted text-center mb-6">
                Êtes-vous sûr de vouloir supprimer le patient{' '}
                <span className="font-semibold theme-text-primary">{patientToDelete.name}</span>?
                <br />
                Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteCancel}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2.5 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] theme-text-primary rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deleteLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Suppression...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Supprimer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patient Detail Modal - Enhanced */}
      {showDetailModal && selectedPatient && (
        <PatientDetailModalEnhanced
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          patient={selectedPatient}
        />
      )}
    </div>
  );
};

export default EnhancedPatientsPage;
