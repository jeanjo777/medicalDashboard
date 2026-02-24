import React, { useState, useEffect, useCallback } from 'react';
import MedicalSidebarRefined from '../components/MedicalSidebarRefined';
import ErrorBoundary from '../components/ErrorBoundary';
import ReportsTab from '../components/Analytics/ReportsTab';
import { supabase } from '../lib/supabase';
import { generateSifcaPDF } from '../utils/sifcaPdfGenerator';
import {
  FileText, Search, Printer, RefreshCw, ChevronDown, X,
  User, Calendar, Building2, Stethoscope, CheckSquare, AlertCircle,
} from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  gender?: string;
  status?: string;
  temperature?: number | null;
  poids?: number | null;
  tension_arterielle?: string | null;
  visit_type?: string | null;
  filiale?: string | null;
}

const VISIT_TYPES = [
  { key: 'consultation', label: 'Consultation' },
  { key: 'systematique', label: 'Visite Systématique' },
  { key: 'embauche', label: "Visite d'embauche" },
];

const FILIALES = ['AUTRES', 'SIFCA', 'SAPH', 'PALMCI', 'SANIA', 'SUCRIVOIRE', 'SIFCOMASSUR'];

const ReportsPage: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [medecin, setMedecin] = useState('');
  const [visitType, setVisitType] = useState('');
  const [filiale, setFiliale] = useState('');

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('patients')
        .select('id, name, first_name, last_name, date_of_birth, gender, status, temperature, poids, tension_arterielle, visit_type, filiale')
        .order('name', { ascending: true });

      if (err) throw err;
      setPatients(data || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.first_name?.toLowerCase().includes(q) ||
      p.last_name?.toLowerCase().includes(q)
    );
  });

  const openDialog = (patient: Patient) => {
    setSelectedPatient(patient);
    setVisitType(patient.visit_type || '');
    setFiliale(patient.filiale || '');
    setMedecin('');
    setDialogOpen(true);
  };

  const handleGenerate = () => {
    if (!selectedPatient) return;
    generateSifcaPDF({
      name: selectedPatient.name,
      first_name: selectedPatient.first_name,
      last_name: selectedPatient.last_name,
      date_of_birth: selectedPatient.date_of_birth,
      temperature: selectedPatient.temperature,
      poids: selectedPatient.poids,
      tension_arterielle: selectedPatient.tension_arterielle,
      visitType: visitType as 'consultation' | 'systematique' | 'embauche' | undefined,
      filiale: filiale || undefined,
      medecin: medecin || undefined,
    });
    setDialogOpen(false);
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();

  const avatarColors = [
    'bg-blue-500', 'bg-purple-500', 'bg-emerald-500',
    'bg-orange-500', 'bg-pink-500', 'bg-cyan-500',
    'bg-indigo-500', 'bg-rose-500',
  ];
  const getColor = (name: string) => avatarColors[name.charCodeAt(0) % avatarColors.length];

  return (
    <div className="flex min-h-screen theme-bg-primary transition-colors duration-300">
      <MedicalSidebarRefined activeItem="reports" onCollapsedChange={setSidebarCollapsed} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Header */}
        <header className="theme-bg-secondary border-b theme-border px-3 sm:px-4 lg:px-8 py-3 sm:py-4 sticky top-0 z-30 transition-colors duration-300">
          <div className="flex items-center justify-between ml-14 lg:ml-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-primary/20 rounded-lg flex-shrink-0">
                <FileText size={20} className="text-primary sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold theme-text-primary">Rapports</h1>
                <p className="theme-text-secondary text-xs sm:text-sm truncate">Générer les documents SIFCA</p>
              </div>
            </div>
            <button
              type="button"
              onClick={fetchPatients}
              className="flex items-center gap-2 px-3 py-1.5 text-sm theme-text-secondary hover:text-primary transition-colors"
              title="Actualiser"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Actualiser</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-4 lg:p-8">
          <ErrorBoundary>
            <div className="max-w-5xl mx-auto space-y-6">

              {/* Info banner */}
              <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <Printer size={18} className="text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-300">
                  Sélectionnez un patient pour générer et télécharger son formulaire SIFCA Centre Médico-Social en PDF.
                </p>
              </div>

              {/* Search */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-secondary" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un patient..."
                  className="w-full pl-9 pr-4 py-2.5 text-sm theme-bg-secondary border theme-border rounded-xl theme-text-primary placeholder:theme-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Patient list */}
              {loading ? (
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-16 theme-bg-secondary rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16 theme-text-secondary">
                  <User size={40} className="mx-auto mb-3 opacity-30" />
                  <p>Aucun patient trouvé</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.map((patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center gap-4 p-4 theme-bg-secondary border theme-border rounded-xl hover:border-primary/50 transition-all group"
                    >
                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-full ${getColor(patient.name)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                        {getInitials(patient.name)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold theme-text-primary truncate">
                          {patient.last_name
                            ? `${patient.last_name.toUpperCase()} ${patient.first_name || ''}`
                            : patient.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                          {patient.date_of_birth && (
                            <span className="flex items-center gap-1 text-xs theme-text-secondary">
                              <Calendar size={11} />
                              {patient.date_of_birth}
                            </span>
                          )}
                          {patient.visit_type && (
                            <span className="flex items-center gap-1 text-xs text-blue-400">
                              <Stethoscope size={11} />
                              {VISIT_TYPES.find((v) => v.key === patient.visit_type)?.label || patient.visit_type}
                            </span>
                          )}
                          {patient.filiale && (
                            <span className="flex items-center gap-1 text-xs text-emerald-400">
                              <Building2 size={11} />
                              {patient.filiale}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Badge vitals */}
                      <div className="hidden sm:flex items-center gap-2">
                        {(patient.temperature || patient.poids || patient.tension_arterielle) && (
                          <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                            <CheckSquare size={11} />
                            Signes vitaux
                          </span>
                        )}
                      </div>

                      {/* Button */}
                      <button
                        type="button"
                        onClick={() => openDialog(patient)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/80 transition-colors flex-shrink-0"
                      >
                        <Printer size={15} />
                        <span className="hidden sm:inline">Générer PDF</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Count */}
              {!loading && filtered.length > 0 && (
                <p className="text-center text-xs theme-text-secondary">
                  {filtered.length} patient{filtered.length > 1 ? 's' : ''}
                </p>
              )}

              {/* Divider */}
              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs theme-text-secondary uppercase tracking-widest font-medium">Générateur de rapports analytiques</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Old ReportsTab content */}
              <ReportsTab filters={{}} />

            </div>
          </ErrorBoundary>
        </main>
      </div>

      {/* ─── PDF Generation Dialog ─────────────────────────────────────── */}
      {dialogOpen && selectedPatient && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setDialogOpen(false); }}
        >
          <div className="theme-bg-secondary border theme-border rounded-2xl shadow-2xl w-full max-w-md">
            {/* Dialog header */}
            <div className="flex items-center justify-between p-5 border-b theme-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <FileText size={18} className="text-primary" />
                </div>
                <div>
                  <h2 className="font-bold theme-text-primary">Générer document SIFCA</h2>
                  <p className="text-xs theme-text-secondary mt-0.5 truncate max-w-[220px]">
                    {selectedPatient.last_name
                      ? `${selectedPatient.last_name.toUpperCase()} ${selectedPatient.first_name || ''}`
                      : selectedPatient.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                aria-label="Fermer"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors theme-text-secondary"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Médecin */}
              <div>
                <label className="block text-sm font-medium theme-text-primary mb-1.5">
                  Médecin
                </label>
                <input
                  type="text"
                  value={medecin}
                  onChange={(e) => setMedecin(e.target.value)}
                  placeholder="Nom du médecin (optionnel)"
                  className="w-full px-3 py-2.5 text-sm theme-bg-primary border theme-border rounded-xl theme-text-primary placeholder:theme-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                />
              </div>

              {/* Type de visite */}
              <div>
                <label className="block text-sm font-medium theme-text-primary mb-2">
                  Type de visite
                </label>
                <div className="space-y-2">
                  {VISIT_TYPES.map((v) => (
                    <label
                      key={v.key}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        visitType === v.key
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-transparent theme-bg-primary theme-text-secondary hover:border-primary/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="visitType"
                        value={v.key}
                        checked={visitType === v.key}
                        onChange={() => setVisitType(v.key)}
                        className="accent-primary"
                      />
                      <span className="text-sm font-medium">{v.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filiale */}
              <div>
                <label className="block text-sm font-medium theme-text-primary mb-1.5">
                  Filiale
                </label>
                <div className="relative">
                  <select
                    value={filiale}
                    onChange={(e) => setFiliale(e.target.value)}
                    aria-label="Sélectionner une filiale"
                    title="Filiale"
                    className="w-full px-3 py-2.5 pr-8 text-sm theme-bg-primary border theme-border rounded-xl theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none transition"
                  >
                    <option value="">— Sélectionner une filiale —</option>
                    {FILIALES.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-secondary pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Dialog footer */}
            <div className="flex gap-3 p-5 border-t theme-border">
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="flex-1 py-2.5 text-sm font-medium theme-text-secondary border theme-border rounded-xl hover:bg-white/5 transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium bg-primary text-white rounded-xl hover:bg-primary/80 transition"
              >
                <Printer size={16} />
                Télécharger PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
