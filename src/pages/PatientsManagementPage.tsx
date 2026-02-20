import React, { useEffect, useState } from 'react';
import {
  Users,
  Plus,
  X,
  UserPlus,
  Search,
  Edit,
  LayoutGrid,
  List,
  Download,
  Moon,
  Sun,
  Home,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import PatientCard from '../components/Patients/PatientCard';
import PatientFilters from '../components/Patients/PatientFilters';
import PatientDetailPanel from '../components/Patients/PatientDetailPanel';
import PatientsStats from '../components/Patients/PatientsStats';
import NotificationBell from '../components/Common/NotificationBell';
import ExportButton from '../components/Common/ExportButton';
import ConfirmDialog from '../components/Common/ConfirmDialog';
import { useToast } from '../components/Common/ToastNotification';
import logger from '../utils/logger';

interface Patient {
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
}

interface FilterState {
  ageRange: string;
  gender: string;
  riskLevel: string;
  consultationStatus: string;
  dateRange: string;
}

const PatientsManagementPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    ageRange: '',
    gender: '',
    riskLevel: '',
    consultationStatus: '',
    dateRange: '',
  });

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    age: '',
    gender: 'male',
    profilePic: '',
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-patients`;

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch patients');
      }

      const data = await response.json();
      setPatients(data.patients);
    } catch (err) {
      logger.error('Error:', err);
      setError('Impossible de charger les patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const openAddModal = () => {
    setEditingPatient(null);
    setFormData({ email: '', name: '', age: '', gender: 'male', profilePic: '' });
    setShowModal(true);
  };

  const openEditModal = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      email: patient.email,
      name: patient.name,
      age: patient.age?.toString() || '',
      gender: patient.gender || 'male',
      profilePic: patient.profile_pic || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        navigate('/login');
        return;
      }
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-patients`;

      const body = {
        email: formData.email,
        name: formData.name,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender,
        profilePic: formData.profilePic || null,
        ...(editingPatient && { patientId: editingPatient.id }),
      };

      const response = await fetch(apiUrl, {
        method: editingPatient ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Operation failed');
      }

      setShowModal(false);
      await fetchPatients();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Une erreur est survenue', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = (patientId: string) => {
    setDeleteTargetId(patientId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setShowDeleteConfirm(false);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        navigate('/login');
        return;
      }
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-patients?patientId=${encodeURIComponent(deleteTargetId)}`;

      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete patient');
      }

      showToast('Patient supprimé avec succès');
      await fetchPatients();
    } catch (err) {
      logger.error('Error:', err);
      showToast('Erreur lors de la suppression', 'error');
    } finally {
      setDeleteTargetId(null);
    }
  };

  const applyFilters = (patient: Patient): boolean => {
    if (filters.ageRange) {
      const age = patient.age || 0;
      const [min, max] = filters.ageRange.includes('+')
        ? [parseInt(filters.ageRange), 999]
        : filters.ageRange.split('-').map(Number);
      if (age < min || age > max) return false;
    }

    if (filters.gender && patient.gender !== filters.gender) return false;

    if (filters.riskLevel) {
      const risk = patient.riskScore || 0;
      if (filters.riskLevel === 'low' && risk >= 40) return false;
      if (filters.riskLevel === 'medium' && (risk < 40 || risk >= 70)) return false;
      if (filters.riskLevel === 'high' && risk < 70) return false;
    }

    if (filters.consultationStatus) {
      if (filters.consultationStatus === 'pending' && !patient.pendingConsultations) return false;
      if (filters.consultationStatus === 'completed' && patient.pendingConsultations) return false;
      if (filters.consultationStatus === 'none' && patient.totalConsultations) return false;
    }

    if (filters.dateRange) {
      const regDate = new Date(patient.registered_at);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - regDate.getTime()) / (1000 * 60 * 60 * 24));

      if (filters.dateRange === 'today' && daysDiff !== 0) return false;
      if (filters.dateRange === 'week' && daysDiff > 7) return false;
      if (filters.dateRange === 'month' && daysDiff > 30) return false;
      if (filters.dateRange === 'year' && daysDiff > 365) return false;
    }

    return true;
  };

  const filteredPatients = patients
    .filter((patient) =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(applyFilters);

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  const exportableData = filteredPatients.map(p => ({
    Nom: p.name,
    Email: p.email,
    Âge: p.age || 'N/A',
    Sexe: p.gender === 'male' ? 'Homme' : p.gender === 'female' ? 'Femme' : 'Autre',
    'Date inscription': new Date(p.registered_at).toLocaleDateString('fr-FR'),
    'Consultations totales': p.totalConsultations || 0,
    'En attente': p.pendingConsultations || 0,
    'Score de risque': p.riskScore || 0,
  }));

  if (loading && patients.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
              <Users className="text-primary dark:text-blue-400" size={36} />
              Gestion des patients
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {filteredPatients.length} patient{filteredPatients.length > 1 ? 's' : ''} enregistré{filteredPatients.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-xl bg-white/60 dark:bg-gray-800/60 hover:bg-white/80 dark:hover:bg-gray-800/80 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg"
              title="Retour au dashboard"
            >
              <Home size={24} className="text-gray-700 dark:text-gray-300" />
            </button>
            <NotificationBell />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-white/60 dark:bg-gray-800/60 hover:bg-white/80 dark:hover:bg-gray-800/80 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg"
            >
              {theme === 'dark' ? <Sun size={24} className="text-yellow-500" /> : <Moon size={24} className="text-gray-700" />}
            </button>
            <ExportButton data={exportableData} filename={`patients-${new Date().toISOString().split('T')[0]}`} />
            <button
              onClick={openAddModal}
              className="bg-gradient-to-r from-primary to-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <Plus size={20} />
              Nouveau patient
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-400 px-6 py-4 rounded-lg mb-6">
            <p className="font-semibold">Erreur</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <PatientsStats patients={patients} />

        <div className="mt-8 mb-6">
          <div className="glass backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-xl border border-white/50 dark:border-gray-700/50 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher un patient par nom ou email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-gray-900 dark:text-white transition-all duration-300"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-lg transition-all duration-300 ${
                    viewMode === 'grid'
                      ? 'bg-primary text-white'
                      : 'bg-white/60 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'
                  }`}
                  title="Vue grille"
                >
                  <LayoutGrid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-lg transition-all duration-300 ${
                    viewMode === 'list'
                      ? 'bg-primary text-white'
                      : 'bg-white/60 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'
                  }`}
                  title="Vue liste"
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <PatientFilters
            filters={filters}
            onFilterChange={setFilters}
            onReset={() => setFilters({ ageRange: '', gender: '', riskLevel: '', consultationStatus: '', dateRange: '' })}
            activeFiltersCount={activeFiltersCount}
          />
        </div>

        {filteredPatients.length === 0 ? (
          <div className="glass backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-xl border border-white/50 dark:border-gray-700/50 p-12">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Users size={64} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-lg font-semibold">Aucun patient trouvé</p>
              <p className="text-sm mt-2">Essayez de modifier vos filtres ou ajoutez un nouveau patient</p>
            </div>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredPatients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onView={(id) => setSelectedPatientId(id)}
                onEdit={openEditModal}
                onDelete={handleDeleteRequest}
              />
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="glass backdrop-blur-xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in-up">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {editingPatient ? <Edit size={24} /> : <UserPlus size={24} />}
                  {editingPatient ? 'Modifier patient' : 'Nouveau patient'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-gray-900 dark:text-white transition-all duration-300"
                    placeholder="Jean Dupont"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-gray-900 dark:text-white transition-all duration-300"
                    placeholder="jean.dupont@email.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Âge
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="150"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full px-4 py-3 bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-gray-900 dark:text-white transition-all duration-300"
                      placeholder="35"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Sexe
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-3 bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-gray-900 dark:text-white transition-all duration-300"
                    >
                      <option value="male">Homme</option>
                      <option value="female">Femme</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Photo de profil (URL)
                  </label>
                  <input
                    type="url"
                    value={formData.profilePic}
                    onChange={(e) => setFormData({ ...formData, profilePic: e.target.value })}
                    className="w-full px-4 py-3 bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-gray-900 dark:text-white transition-all duration-300"
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-primary to-blue-600 text-white px-4 py-3 rounded-xl font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none"
                  >
                    {loading ? 'Enregistrement...' : editingPatient ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {selectedPatientId && (
          <PatientDetailPanel
            patientId={selectedPatientId}
            onClose={() => setSelectedPatientId(null)}
          />
        )}

        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => { setShowDeleteConfirm(false); setDeleteTargetId(null); }}
          onConfirm={handleDeleteConfirm}
          title="Supprimer le patient"
          message="Êtes-vous sûr de vouloir supprimer ce patient ? Cette action est irréversible."
          confirmText="Supprimer"
          variant="danger"
        />
      </div>
    </div>
  );
};

export default PatientsManagementPage;
