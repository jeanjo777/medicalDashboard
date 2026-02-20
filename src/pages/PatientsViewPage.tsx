import React, { useState, useEffect } from 'react';
import MedicalSidebarRefined from '../components/MedicalSidebarRefined';
import { Search, Bell, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { calculateAge } from '../utils/dateHelpers';
import logger from '../utils/logger';
import AddPatientModal from '../components/AddPatientModal';

// Type simplifié pour l'affichage dans la table
interface PatientRow {
  id: string;
  initials: string;
  name: string;
  age: number;
  gender: string;
  condition: string;
  status: 'Active' | 'Recovered' | 'Under Treatment' | 'Inactive';
  lastVisit: string;
}

// Fonction pour formater la date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Mapper le statut Supabase vers le format d'affichage
const mapStatus = (status: string | null): PatientRow['status'] => {
  if (!status) return 'Active';
  const lower = status.toLowerCase();
  if (lower === 'active' || lower === 'actif') return 'Active';
  if (lower === 'recovered' || lower === 'gueri' || lower === 'guéri') return 'Recovered';
  if (lower === 'under treatment' || lower === 'en traitement' || lower === 'treatment') return 'Under Treatment';
  if (lower === 'inactive' || lower === 'inactif') return 'Inactive';
  return 'Active';
};

const PatientsViewPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('patients');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const rows: PatientRow[] = (data || []).map((p: any) => {
          const name = p.name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Inconnu';
          const initials = name
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
          const age = p.age ?? calculateAge(p.date_of_birth) ?? 0;

          return {
            id: p.id,
            initials,
            name,
            age,
            gender: p.gender || 'Non renseigne',
            condition: p.primary_pathology || 'Non renseigne',
            status: mapStatus(p.status),
            lastVisit: p.registered_at ? formatDate(p.registered_at) : 'N/A',
          };
        });

        setPatients(rows);
      } catch (err) {
        logger.error('Erreur lors du chargement des patients:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Recovered':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Under Treatment':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Inactive':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Active':
        return 'Actif';
      case 'Recovered':
        return 'Guéri';
      case 'Under Treatment':
        return 'En traitement';
      case 'Inactive':
        return 'Inactif';
      default:
        return status;
    }
  };

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'Male':
        return 'Homme';
      case 'Female':
        return 'Femme';
      case 'Other':
        return 'Autre';
      default:
        return gender;
    }
  };

  return (
    <div className="flex min-h-screen theme-bg-primary transition-colors duration-300">
      {/* Sidebar */}
      <MedicalSidebarRefined
        activeItem={activeSection}
        onItemClick={setActiveSection}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Top Header */}
        <header className="theme-bg-secondary border-b theme-border px-3 sm:px-4 lg:px-6 py-2 sm:py-3 sticky top-0 z-30 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 lg:ml-0 ml-14">
              <h1 className="text-base sm:text-lg lg:text-xl font-semibold theme-text-primary">Dossiers Patients</h1>
              <p className="text-xs sm:text-sm theme-text-muted mt-0.5 truncate">Bienvenue</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted" size={16} />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-64 pl-9 pr-4 py-2 theme-bg-primary border theme-border rounded-xl text-sm theme-text-secondary placeholder-[var(--text-muted)] focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors">
                <Bell size={20} className="theme-text-muted" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* User Avatar */}
              <div className="flex items-center gap-2 px-3 py-1.5 theme-bg-tertiary rounded-lg">
                <span className="text-sm font-medium theme-text-primary">U</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 theme-bg-primary transition-colors duration-300">
          <div className="theme-bg-secondary rounded-2xl border theme-border overflow-hidden shadow-sm transition-colors duration-300">
            {/* Section Header */}
            <div className="px-6 py-4 border-b theme-border bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold theme-text-primary">Dossiers Patients</h2>
                <p className="text-sm theme-text-muted mt-0.5">Gerer et consulter les informations patients</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-emerald-500/25"
              >
                <Plus size={16} />
                Nouveau Patient
              </button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
                <span className="ml-3 theme-text-muted text-sm">Chargement des patients...</span>
              </div>
            )}

            {/* Empty State */}
            {!loading && patients.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-full theme-bg-tertiary flex items-center justify-center mb-4">
                  <Search size={24} className="theme-text-muted" />
                </div>
                <p className="theme-text-secondary font-medium">Aucun patient trouve</p>
                <p className="theme-text-muted text-sm mt-1">Les patients apparaitront ici une fois ajoutes.</p>
              </div>
            )}

            {/* Table */}
            {!loading && patients.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="theme-bg-tertiary border-b theme-border">
                    <th className="px-6 py-3 text-left text-xs font-semibold theme-text-muted uppercase tracking-wider">
                      ID Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold theme-text-muted uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold theme-text-muted uppercase tracking-wider">
                      Age
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold theme-text-muted uppercase tracking-wider">
                      Genre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold theme-text-muted uppercase tracking-wider">
                      Condition
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold theme-text-muted uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold theme-text-muted uppercase tracking-wider">
                      Derniere Visite
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {patients.map((patient) => (
                    <tr
                      key={patient.id}
                      className="hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm theme-text-muted">{patient.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {patient.initials}
                          </div>
                          <span className="text-sm font-medium theme-text-primary">{patient.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm theme-text-secondary">{patient.age}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm theme-text-secondary">{getGenderLabel(patient.gender)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium theme-text-secondary">{patient.condition}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(patient.status)}`}>
                          {getStatusLabel(patient.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm theme-text-muted">{patient.lastVisit}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </div>
        </main>
      </div>

      <AddPatientModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onPatientAdded={() => {
          setShowAddModal(false);
          // Re-fetch patients
          const fetchPatients = async () => {
            try {
              setLoading(true);
              const { data, error } = await supabase
                .from('patients')
                .select('*')
                .order('created_at', { ascending: false });
              if (error) throw error;
              const rows: PatientRow[] = (data || []).map((p: any) => {
                const name = p.name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Inconnu';
                const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                const age = p.age ?? calculateAge(p.date_of_birth) ?? 0;
                return { id: p.id, initials, name, age, gender: p.gender || 'Non renseigne', condition: p.primary_pathology || 'Non renseigne', status: mapStatus(p.status), lastVisit: p.registered_at ? formatDate(p.registered_at) : 'N/A' };
              });
              setPatients(rows);
            } catch (err) {
              logger.error('Erreur:', err);
            } finally {
              setLoading(false);
            }
          };
          fetchPatients();
        }}
      />
    </div>
  );
};

export default PatientsViewPage;
