import React, { useState, useEffect, useCallback, useRef } from 'react';
import MedicalSidebarRefined from '../components/MedicalSidebarRefined';
import ErrorBoundary from '../components/ErrorBoundary';
import ReportsTab from '../components/Analytics/ReportsTab';
import { supabase } from '../lib/supabase';
import { generateSifcaDocument, SIFCA_DOC_TYPES, type SifcaDocType } from '../utils/sifcaPdfGenerator';
import {
  FileText, Search, Printer, RefreshCw, ChevronDown, X,
  User, Calendar, Building2, Stethoscope, CheckSquare, AlertCircle, Loader2,
} from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  gender?: string;
  status?: string;
  visit_type?: string | null;
  filiale?: string | null;
  urines_albumine?: string | null;
  urines_sucre?: string | null;
}

const VISIT_TYPES = [
  { key: 'consultation', label: 'Consultation' },
  { key: 'systematique', label: 'Visite Systématique' },
  { key: 'embauche', label: "Visite d'embauche" },
];

const FILIALES = ['AUTRES', 'SIFCA', 'SAPH', 'PALMCI', 'SANIA', 'SUCRIVOIRE', 'SIFCOMASSUR'];

const PAGE_SIZE = 50;

const ReportsPage: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [medecin, setMedecin] = useState('');
  const [visitType, setVisitType] = useState('');
  const [filiale, setFiliale] = useState('');
  const [selectedDocType, setSelectedDocType] = useState<SifcaDocType>('fiche-cms');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input — 300 ms
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setOffset(0);         // reset pagination on new search
      setPatients([]);      // clear list immediately
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  // Build Supabase query
  const buildQuery = useCallback((q: string, from: number) => {
    let query = supabase
      .from('patients')
      .select(
        'id, name, first_name, last_name, date_of_birth, gender, status, visit_type, filiale, urines_albumine, urines_sucre',
        { count: 'exact' }
      )
      .order('name', { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (q) {
      query = query.or(
        `name.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%`
      );
    }
    return query;
  }, []);

  // Initial / search fetch (replaces list)
  const fetchPatients = useCallback(async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err, count } = await buildQuery(q, 0);
      if (err) throw err;
      setPatients(data || []);
      setTotal(count ?? 0);
      setOffset(PAGE_SIZE);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  // Load more (append)
  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const { data, error: err } = await buildQuery(debouncedSearch, offset);
      if (err) throw err;
      setPatients((prev) => [...prev, ...(data || [])]);
      setOffset((prev) => prev + PAGE_SIZE);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoadingMore(false);
    }
  };

  // Trigger fetch when debouncedSearch changes
  useEffect(() => {
    fetchPatients(debouncedSearch);
  }, [debouncedSearch, fetchPatients]);

  const openDialog = (patient: Patient) => {
    setSelectedPatient(patient);
    setVisitType(patient.visit_type || '');
    setFiliale(patient.filiale || '');
    setMedecin('');
    setSelectedDocType('fiche-cms');
    setDialogOpen(true);
  };

  const handleGenerate = () => {
    if (!selectedPatient) return;
    generateSifcaDocument(selectedDocType, {
      name: selectedPatient.name,
      first_name: selectedPatient.first_name,
      last_name: selectedPatient.last_name,
      date_of_birth: selectedPatient.date_of_birth,
      visitType: visitType as 'consultation' | 'systematique' | 'embauche' | undefined,
      filiale: filiale || undefined,
      medecin: medecin || undefined,
      urines_albumine: selectedPatient.urines_albumine || undefined,
      urines_sucre: selectedPatient.urines_sucre || undefined,
    });
    setDialogOpen(false);
  };

  const getInitials = (name: string) =>
    name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();

  const avatarColors = [
    'bg-blue-500', 'bg-purple-500', 'bg-emerald-500',
    'bg-orange-500', 'bg-pink-500', 'bg-cyan-500',
    'bg-indigo-500', 'bg-rose-500',
  ];
  const getColor = (name: string) => avatarColors[name.charCodeAt(0) % avatarColors.length];

  const hasMore = patients.length < total;

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
              onClick={() => fetchPatients(debouncedSearch)}
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
            <div className="max-w-5xl mx-auto space-y-5">

              {/* Info banner */}
              <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <Printer size={18} className="text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-300">
                  Sélectionnez un patient pour générer et télécharger son formulaire SIFCA Centre Médico-Social en PDF.
                </p>
              </div>

              {/* Search + count */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-secondary" />
                  {loading && search ? (
                    <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-secondary animate-spin" />
                  ) : null}
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher par nom, prénom…"
                    className="w-full pl-9 pr-10 py-2.5 text-sm theme-bg-secondary border theme-border rounded-xl theme-text-primary placeholder:theme-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                  />
                </div>
                {!loading && (
                  <span className="text-xs theme-text-secondary whitespace-nowrap flex-shrink-0">
                    {total.toLocaleString('fr-FR')} patient{total > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Patient list — scrollable container */}
              <div className="theme-bg-secondary border theme-border rounded-2xl overflow-hidden">
                {/* List header */}
                <div className="px-4 py-3 border-b theme-border flex items-center justify-between">
                  <span className="text-sm font-semibold theme-text-primary">Liste des patients</span>
                  {!loading && patients.length > 0 && (
                    <span className="text-xs theme-text-secondary">
                      {patients.length.toLocaleString('fr-FR')} affiché{patients.length > 1 ? 's' : ''} sur {total.toLocaleString('fr-FR')}
                    </span>
                  )}
                </div>

                {/* Scrollable area */}
                <div className="overflow-y-auto max-h-[480px]">
                  {loading ? (
                    <div className="p-4 space-y-2">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-14 theme-bg-primary rounded-xl animate-pulse" />
                      ))}
                    </div>
                  ) : patients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 theme-text-secondary">
                      <User size={36} className="mb-3 opacity-30" />
                      <p className="text-sm">
                        {search ? `Aucun résultat pour « ${search} »` : 'Aucun patient enregistré'}
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {patients.map((patient) => (
                        <div
                          key={patient.id}
                          className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 transition-colors group"
                        >
                          {/* Avatar */}
                          <div className={`w-9 h-9 rounded-full ${getColor(patient.name)} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
                            {getInitials(patient.name)}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold theme-text-primary text-sm truncate">
                              {patient.last_name
                                ? `${patient.last_name.toUpperCase()} ${patient.first_name || ''}`
                                : patient.name}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                              {patient.date_of_birth && (
                                <span className="flex items-center gap-1 text-xs theme-text-secondary">
                                  <Calendar size={10} />
                                  {patient.date_of_birth}
                                </span>
                              )}
                              {patient.visit_type && (
                                <span className="flex items-center gap-1 text-xs text-blue-400">
                                  <Stethoscope size={10} />
                                  {VISIT_TYPES.find((v) => v.key === patient.visit_type)?.label || patient.visit_type}
                                </span>
                              )}
                              {patient.filiale && (
                                <span className="flex items-center gap-1 text-xs text-emerald-400">
                                  <Building2 size={10} />
                                  {patient.filiale}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Status badge */}
                          <div className="hidden sm:flex items-center">
                            {patient.status === 'active' && (
                              <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                                <CheckSquare size={10} />
                                Actif
                              </span>
                            )}
                          </div>

                          {/* Generate button */}
                          <button
                            type="button"
                            onClick={() => openDialog(patient)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/80 transition-colors flex-shrink-0"
                          >
                            <Printer size={13} />
                            <span className="hidden sm:inline">PDF</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Load more footer */}
                {!loading && hasMore && (
                  <div className="px-4 py-3 border-t theme-border">
                    <button
                      type="button"
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium theme-text-secondary hover:text-primary border theme-border rounded-xl hover:border-primary/40 transition-all"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Chargement…
                        </>
                      ) : (
                        <>
                          <ChevronDown size={14} />
                          Charger {Math.min(PAGE_SIZE, total - patients.length)} patients de plus
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs theme-text-secondary uppercase tracking-widest font-medium">Générateur de rapports analytiques</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Analytics ReportsTab */}
              <ReportsTab filters={{}} />

            </div>
          </ErrorBoundary>
        </main>
      </div>

      {/* ─── PDF Generation Dialog ──────────────────────────────────────── */}
      {dialogOpen && selectedPatient && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
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

            <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
              {/* Type de document */}
              <div>
                <label className="block text-sm font-medium theme-text-primary mb-2">Type de document</label>
                <div className="grid grid-cols-1 gap-1.5 max-h-[180px] overflow-y-auto pr-1">
                  {SIFCA_DOC_TYPES.map((dt) => (
                    <label
                      key={dt.id}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        selectedDocType === dt.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-transparent theme-bg-primary theme-text-secondary hover:border-primary/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="docType"
                        value={dt.id}
                        checked={selectedDocType === dt.id}
                        onChange={() => setSelectedDocType(dt.id)}
                        className="accent-primary flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-sm font-medium block">{dt.label}</span>
                        <span className="text-xs opacity-60 block truncate">{dt.description}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Médecin */}
              <div>
                <label className="block text-sm font-medium theme-text-primary mb-1.5">Medecin</label>
                <input
                  type="text"
                  value={medecin}
                  onChange={(e) => setMedecin(e.target.value)}
                  placeholder="Nom du médecin (optionnel)"
                  className="w-full px-3 py-2.5 text-sm theme-bg-primary border theme-border rounded-xl theme-text-primary placeholder:theme-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                />
              </div>

              {selectedDocType === 'fiche-cms' && (
                <>
                  <div>
                    <label className="block text-sm font-medium theme-text-primary mb-2">Type de visite</label>
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

                  <div>
                    <label className="block text-sm font-medium theme-text-primary mb-1.5">Filiale</label>
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
                </>
              )}
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
