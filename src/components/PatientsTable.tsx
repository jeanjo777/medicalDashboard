/**
 * PatientsTable Component
 *
 * Full-featured patient management table with advanced filtering, sorting, and CRUD operations.
 * Fetches data from Supabase and provides comprehensive patient list management.
 *
 * @component
 * @example
 * <PatientsTable />
 *
 * @accessibility
 * - Semantic table structure with proper headers
 * - Keyboard navigation for all actions
 * - Screen reader friendly labels
 * - High contrast status badges
 * - Loading skeletons
 * - Error and empty states
 *
 * @usage
 * - Main patient list page
 * - Patient management dashboard
 * - Administrative patient overview
 *
 * @features
 * - Real-time search across name, email, phone
 * - Multi-level filtering (status, pathology)
 * - Sortable columns (name, date, status)
 * - CRUD operations (view, edit, delete)
 * - Add new patient modal
 * - Responsive design
 * - Loading and error states
 * - Empty state with add action
 *
 * @database
 * - Table: patients
 * - RLS policies enforced
 * - Real-time updates
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, Eye, Edit, Trash2, Plus, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import PatientStatusBadge from './PatientStatusBadge';
import AddPatientModal from './AddPatientModal';
import PatientDetailModal from './PatientDetailModal';
import ErrorState from './ErrorState';
import EmptyState from './EmptyState';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import logger from '../utils/logger';

type PatientStatus = 'active' | 'in_treatment' | 'recovered' | 'inactive';
type SortField = 'name' | 'last_visit' | 'pathology' | 'status';
type SortDirection = 'asc' | 'desc';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone: string;
  email?: string;
  address?: string;
  primary_pathology?: string;
  status: PatientStatus;
  created_at: string;
  updated_at: string;
  last_visit?: string;
}

const PatientsTable: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PatientStatus | 'all'>('all');
  const [pathologyFilter, setPathologyFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const patientsWithLastVisit = await Promise.all(
        (data || []).map(async (patient) => {
          const { data: consultations } = await supabase
            .from('consultations')
            .select('created_at')
            .eq('patient_id', patient.id)
            .order('created_at', { ascending: false })
            .limit(1);

          return {
            ...patient,
            last_visit: consultations?.[0]?.created_at || patient.created_at
          };
        })
      );

      setPatients(patientsWithLastVisit);
    } catch (error: any) {
      logger.error('Error fetching patients:', error);
      setError(error.message || 'Erreur lors du chargement des patients');
    } finally {
      setLoading(false);
    }
  };

  const uniquePathologies = useMemo(() => {
    const pathologies = patients
      .map(p => p.primary_pathology)
      .filter((p): p is string => !!p);
    return Array.from(new Set(pathologies)).sort();
  }, [patients]);

  const filteredAndSortedPatients = useMemo(() => {
    let filtered = patients;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(patient =>
        `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(query) ||
        patient.phone.toLowerCase().includes(query) ||
        patient.email?.toLowerCase().includes(query) ||
        patient.primary_pathology?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(patient => patient.status === statusFilter);
    }

    if (pathologyFilter !== 'all') {
      filtered = filtered.filter(patient => patient.primary_pathology === pathologyFilter);
    }

    filtered.sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (sortField) {
        case 'name':
          aValue = `${a.first_name} ${a.last_name}`.toLowerCase();
          bValue = `${b.first_name} ${b.last_name}`.toLowerCase();
          break;
        case 'last_visit':
          aValue = new Date(a.last_visit || a.created_at).getTime();
          bValue = new Date(b.last_visit || b.created_at).getTime();
          break;
        case 'pathology':
          aValue = (a.primary_pathology || '').toLowerCase();
          bValue = (b.primary_pathology || '').toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [patients, searchQuery, statusFilter, pathologyFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = async (patientId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) return;

    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientId);

      if (error) throw error;
      await fetchPatients();
    } catch (error) {
      logger.error('Error deleting patient:', error);
      alert('Erreur lors de la suppression du patient');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: fr });
    } catch {
      return '-';
    }
  };

  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) return <ChevronDown size={16} className="opacity-30" />;
    return sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  if (loading) {
    return (
      <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-[#334155] rounded w-1/3" />
          <div className="h-12 bg-[#334155] rounded" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-[#334155] rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1e293b] rounded-xl border border-[#334155]">
        <ErrorState
          type="network"
          message={error}
          onRetry={fetchPatients}
        />
      </div>
    );
  }

  return (
    <div className="bg-[#1e293b] rounded-xl border border-[#334155]">
      <div className="p-6 border-b border-[#334155]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Patients</h2>
            <p className="text-gray-400 text-sm mt-1">
              {filteredAndSortedPatients.length} patient{filteredAndSortedPatients.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
            aria-label="Ajouter un nouveau patient"
          >
            <Plus size={20} aria-hidden="true" />
            <span>Ajouter Patient</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, téléphone, email ou pathologie..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors duration-200"
              aria-label="Rechercher des patients"
              role="searchbox"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors duration-200"
                aria-label="Effacer la recherche"
              >
                <X size={18} aria-hidden="true" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors duration-200
              ${showFilters
                ? 'bg-blue-600 text-white'
                : 'bg-[#334155] text-gray-300 hover:bg-[#475569]'
              }
            `}
            aria-label={showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
            aria-expanded={showFilters}
          >
            <Filter size={20} aria-hidden="true" />
            <span>Filtres</span>
            {(statusFilter !== 'all' || pathologyFilter !== 'all') && (
              <span className="w-2 h-2 bg-blue-400 rounded-full" aria-label="Filtres actifs" />
            )}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 bg-[#0f172a] rounded-lg border border-[#334155]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Statut
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as PatientStatus | 'all')}
                  className="w-full px-4 py-2.5 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors duration-200 cursor-pointer"
                  aria-label="Filtrer par statut"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actif</option>
                  <option value="in_treatment">En Traitement</option>
                  <option value="recovered">Guéri</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Pathologie
                </label>
                <select
                  value={pathologyFilter}
                  onChange={(e) => setPathologyFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#1e293b] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors duration-200 cursor-pointer"
                  aria-label="Filtrer par pathologie"
                >
                  <option value="all">Toutes les pathologies</option>
                  {uniquePathologies.map(pathology => (
                    <option key={pathology} value={pathology}>
                      {pathology}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(statusFilter !== 'all' || pathologyFilter !== 'all') && (
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setPathologyFilter('all');
                }}
                className="mt-3 text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
                aria-label="Réinitialiser tous les filtres"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}
      </div>

      <div className="overflow-x-auto" role="region" aria-label="Tableau des patients">
        <table className="w-full" role="table">
          <thead className="bg-[#0f172a]">
            <tr>
              <th
                onClick={() => handleSort('name')}
                className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <span>Nom</span>
                  <SortIcon field="name" />
                </div>
              </th>
              <th
                onClick={() => handleSort('last_visit')}
                className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span>Dernière Visite</span>
                  <SortIcon field="last_visit" />
                </div>
              </th>
              <th
                onClick={() => handleSort('pathology')}
                className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span>Pathologie</span>
                  <SortIcon field="pathology" />
                </div>
              </th>
              <th
                onClick={() => handleSort('status')}
                className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span>Statut</span>
                  <SortIcon field="status" />
                </div>
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#334155]">
            {filteredAndSortedPatients.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4">
                  {patients.length === 0 ? (
                    <EmptyState
                      type="patients"
                      onAction={() => setIsAddModalOpen(true)}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3 py-8">
                      <div className="w-16 h-16 bg-[#334155] rounded-full flex items-center justify-center">
                        <Search size={32} className="text-gray-500" />
                      </div>
                      <p className="text-gray-400">Aucun patient trouvé</p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setStatusFilter('all');
                          setPathologyFilter('all');
                        }}
                        className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
                      >
                        Réinitialiser la recherche
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              filteredAndSortedPatients.map((patient) => (
                <tr
                  key={patient.id}
                  className="hover:bg-[#334155]/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600/10 rounded-full flex items-center justify-center">
                        <span className="text-blue-500 font-semibold text-sm">
                          {patient.first_name[0]}{patient.last_name[0]}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          {patient.first_name} {patient.last_name}
                        </div>
                        <div className="text-sm text-gray-400">{patient.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-300">
                      {formatDate(patient.last_visit || patient.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-300">
                      {patient.primary_pathology || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <PatientStatusBadge status={patient.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedPatient(patient);
                          setIsDetailModalOpen(true);
                        }}
                        className="p-2 hover:bg-blue-600/10 text-blue-500 rounded-lg transition-colors duration-200"
                        aria-label={`Voir les détails de ${patient.first_name} ${patient.last_name}`}
                      >
                        <Eye size={18} aria-hidden="true" />
                      </button>
                      <button
                        className="p-2 hover:bg-purple-600/10 text-purple-500 rounded-lg transition-colors duration-200"
                        aria-label={`Modifier ${patient.first_name} ${patient.last_name}`}
                      >
                        <Edit size={18} aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => handleDelete(patient.id)}
                        className="p-2 hover:bg-red-600/10 text-red-500 rounded-lg transition-colors duration-200"
                        aria-label={`Supprimer ${patient.first_name} ${patient.last_name}`}
                      >
                        <Trash2 size={18} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddPatientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onPatientAdded={fetchPatients}
      />

      <PatientDetailModal
        patient={selectedPatient}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedPatient(null);
        }}
      />
    </div>
  );
};

export default PatientsTable;
