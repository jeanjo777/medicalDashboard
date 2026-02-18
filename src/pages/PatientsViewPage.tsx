import React, { useState } from 'react';
import MedicalSidebarRefined from '../components/MedicalSidebarRefined';
import DemoModeToggle, { DemoModeBanner } from '../components/Common/DemoModeToggle';
import { Search, Bell, Plus } from 'lucide-react';
import { demoPatients, Patient as DemoPatient } from '../data/demoData';
import { useDemoMode } from '../hooks/useDemoMode';

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

// Convertir les données démo en format pour la table
const convertDemoToRows = (patients: DemoPatient[]): PatientRow[] => {
  return patients.map(p => ({
    id: p.id,
    initials: p.initials,
    name: p.name,
    age: p.age,
    gender: p.gender,
    condition: p.condition,
    status: p.status,
    lastVisit: formatDate(p.lastVisit)
  }));
};

const PatientsViewPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('patients');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const { isDemoMode, toggleDemoMode } = useDemoMode();

  // Utiliser les données de démonstration centralisées
  const patients: PatientRow[] = isDemoMode ? convertDemoToRows(demoPatients) : [];

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
    <div className="flex min-h-screen bg-[#0f172a]">
      {/* Sidebar */}
      <MedicalSidebarRefined
        activeItem={activeSection}
        onItemClick={setActiveSection}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Top Header */}
        <header className="bg-[#1e293b] border-b border-[#334155] px-3 sm:px-4 lg:px-6 py-2 sm:py-3 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 lg:ml-0 ml-14">
              <h1 className="text-base sm:text-lg lg:text-xl font-semibold text-white">Dossiers Patients</h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5 truncate">Bienvenue, Dr. Anderson</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Demo Mode Toggle */}
              <DemoModeToggle isDemoMode={isDemoMode} onToggle={toggleDemoMode} size="sm" />

              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-64 pl-9 pr-4 py-2 bg-[#0f172a] border border-[#334155] rounded-xl text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 hover:bg-[#334155] rounded-lg transition-colors">
                <Bell size={20} className="text-gray-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* User Avatar */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#334155] rounded-lg">
                <span className="text-sm font-medium text-white">DA</span>
              </div>
            </div>
          </div>
        </header>

        {/* Demo Mode Banner */}
        <DemoModeBanner isDemoMode={isDemoMode} onDisable={toggleDemoMode} />

        {/* Content Area */}
        <main className="flex-1 p-6 bg-[#f5f4f0]">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Section Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Dossiers Patients</h2>
                <p className="text-sm text-gray-500 mt-0.5">Gérer et consulter les informations patients</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-emerald-500/25">
                <Plus size={16} />
                Nouveau Patient
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      ID Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Âge
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Genre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Condition
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Dernière Visite
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {patients.map((patient) => (
                    <tr
                      key={patient.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">{patient.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {patient.initials}
                          </div>
                          <span className="text-sm font-medium text-gray-800">{patient.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{patient.age}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{getGenderLabel(patient.gender)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-700">{patient.condition}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(patient.status)}`}>
                          {getStatusLabel(patient.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">{patient.lastVisit}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientsViewPage;
