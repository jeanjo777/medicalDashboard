import React, { useState } from 'react';
import { X, Phone, Mail, MapPin, Printer, Download, Activity, Heart, Droplet, Weight, Ruler, Calendar, User, AlertCircle, Pill, FileText, TrendingUp } from 'lucide-react';

interface PatientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: {
    id: string;
    name: string;
    email: string;
    phone: string;
    first_name?: string;
    last_name?: string;
    date_of_birth?: string;
    address?: string;
    status?: string;
    primary_pathology?: string;
    gender?: string;
  };
}

type TabType = 'overview' | 'history' | 'prescriptions' | 'lab-results';

const PatientDetailModalEnhanced: React.FC<PatientDetailModalProps> = ({ isOpen, onClose, patient }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  if (!isOpen) return null;

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(patient.date_of_birth);

  const vitalSigns = [
    { icon: Heart, label: 'Pulse', value: '78 bpm', color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { icon: Activity, label: 'BP', value: '145/92 mmHg', color: 'text-red-400', bg: 'bg-red-500/10' },
    { icon: Droplet, label: 'SpO2', value: '98%', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { icon: Weight, label: 'Poids', value: '82 kg', color: 'text-green-400', bg: 'bg-green-500/10' },
    { icon: Ruler, label: 'Taille', value: '175 cm', color: 'text-blue-400', bg: 'bg-blue-500/10' }
  ];

  const historyEntries = [
    {
      id: 1,
      type: 'Consultation',
      title: 'Suivi hypertension',
      description: 'TA: 145/92 mmHg, traitement ajusté',
      date: '31 Oct 2025',
      doctor: 'Dr. Martin'
    },
    {
      id: 2,
      type: 'Examen',
      title: 'Bilan sanguin',
      description: 'Résultats normaux, cholestérol légèrement élevé',
      date: '15 Sep 2025',
      doctor: 'Dr. Chen'
    },
    {
      id: 3,
      type: 'Consultation',
      title: 'Contrôle routine',
      description: 'État général satisfaisant',
      date: '20 Oct 2025',
      doctor: 'Dr. Anderson'
    }
  ];

  const prescriptions = [
    {
      id: 1,
      name: 'Ramipril',
      dosage: '10mg',
      frequency: '1 comprimé/jour',
      duration: '3 mois',
      startDate: '28 Oct 2025',
      active: true
    },
    {
      id: 2,
      name: 'Aspirine',
      dosage: '100mg',
      frequency: '1 comprimé/jour',
      duration: 'En continu',
      startDate: '15 Sep 2025',
      active: true
    },
    {
      id: 3,
      name: 'Atorvastatine',
      dosage: '20mg',
      frequency: '1 comprimé le soir',
      duration: '6 mois',
      startDate: '15 Sep 2025',
      active: true
    }
  ];

  const labResults = [
    { name: 'Glycémie à jeun', value: '5,8 mmol/L', range: '3,9-6,1', status: 'normal' },
    { name: 'Cholestérol total', value: '5,4 mmol/L', range: '< 5,2', status: 'high' },
    { name: 'HDL', value: '1,2 mmol/L', range: '> 1,0', status: 'normal' },
    { name: 'LDL', value: '3,5 mmol/L', range: '< 3,4', status: 'high' },
    { name: 'Créatinine', value: '88 μmol/L', range: '62-106', status: 'normal' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700 max-h-[90vh] overflow-hidden flex flex-col">

        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6">
          <button
            onClick={onClose}
            aria-label="Fermer la fenêtre"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
          >
            <X size={20} />
          </button>

          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-bold border-4 border-white/30">
              {patient.first_name?.[0]?.toUpperCase() || 'P'}{patient.last_name?.[0]?.toUpperCase() || 'T'}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold text-white">{patient.name}</h2>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm text-white">
                  {age} ans
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm text-white">
                  {patient.gender || 'Femme'}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  patient.status === 'active' ? 'bg-green-500/30 text-green-200' : 'bg-gray-500/30 text-gray-200'
                }`}>
                  {patient.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-white/90 text-sm">
                <div className="flex items-center gap-2">
                  <Phone size={16} />
                  <span>{patient.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={16} />
                  <span>{patient.email}</span>
                </div>
                {patient.address && (
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>{patient.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50"
                title="Imprimer"
                aria-label="Imprimer le dossier"
              >
                <Printer size={18} />
              </button>
              <button
                type="button"
                onClick={() => {
                  const content = `DOSSIER PATIENT\n${'='.repeat(40)}\nNom: ${patient.name}\nEmail: ${patient.email}\nTéléphone: ${patient.phone}\nÂge: ${age} ans\nGenre: ${patient.gender || 'Non spécifié'}\nStatut: ${patient.status}\nPathologie: ${patient.primary_pathology || 'Non spécifiée'}\n\nDate d'export: ${new Date().toLocaleDateString('fr-FR')}`;
                  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `dossier_${patient.name?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50"
                title="Exporter le dossier"
                aria-label="Exporter le dossier"
              >
                <Download size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="relative border-b border-slate-700">
          <div className="overflow-x-auto scrollbar-hide" role="tablist" aria-label="Sections du dossier patient">
            <div className="flex gap-1 p-2 bg-slate-900/50 min-w-max">
              {[
                { id: 'overview', label: "Vue d'ensemble", icon: Activity },
                { id: 'history', label: 'Historique', icon: Calendar },
                { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
                { id: 'lab-results', label: 'Résultats labos', icon: FileText }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`panel-${tab.id}`}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`
                      relative flex-1 min-w-[120px] px-4 sm:px-6 py-3 rounded-lg font-medium transition-all duration-300
                      flex items-center justify-center gap-2 overflow-hidden group cursor-pointer
                      ${isActive
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50'
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white'
                      }
                    `}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse" />
                    )}
                    <Icon size={18} className="relative z-10 flex-shrink-0" />
                    <span className="relative z-10 whitespace-nowrap text-sm">{tab.label}</span>
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-purple-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Activity className="text-blue-400" size={20} />
                  Signes vitaux récents
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {vitalSigns.map((vital) => {
                    const Icon = vital.icon;
                    return (
                      <div key={vital.label} className={`${vital.bg} rounded-xl p-4 border border-slate-700/50`}>
                        <Icon className={`${vital.color} mb-2`} size={24} />
                        <div className="text-2xl font-bold text-white mb-1">{vital.value}</div>
                        <div className="text-sm text-slate-400">{vital.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <FileText className="text-purple-400" size={20} />
                  Diagnostic principal
                </h3>
                <div className="mb-4">
                  <div className="text-2xl font-bold text-white mb-2">{patient.primary_pathology || 'Hypertension'}</div>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Hypertension artérielle grade 1, diagnostiquée en septembre 2025. Contrôle régulier nécessaire avec
                    ajustement du traitement selon les mesures tensionnelles.
                  </p>
                </div>
                <div className="text-xs text-slate-500">Dernière mise à jour: 31 Oct 2025</div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <AlertCircle className="text-red-400" size={20} />
                  Allergies connues
                </h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-2 bg-red-500/20 text-red-300 rounded-lg text-sm border border-red-500/30">
                    Pénicilline
                  </span>
                  <span className="px-3 py-2 bg-red-500/20 text-red-300 rounded-lg text-sm border border-red-500/30">
                    Aucune autre allergie
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="text-blue-400" size={20} />
                Historique des consultations
              </h3>
              {historyEntries.map((entry) => (
                <div key={entry.id} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 hover:border-blue-500/50 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <FileText className="text-blue-400" size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-white font-semibold mb-1">{entry.title}</h4>
                          <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                            {entry.type}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const el = document.getElementById(`history-detail-${entry.id}`);
                            if (el) {
                              el.classList.toggle('hidden');
                            }
                          }}
                          className="text-blue-400 hover:text-blue-300 text-sm font-medium cursor-pointer hover:underline"
                        >
                          Voir détails
                        </button>
                      </div>
                      <p className="text-slate-400 text-sm mb-3">{entry.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {entry.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <User size={14} />
                          {entry.doctor}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Pill className="text-green-400" size={20} />
                  Prescriptions actives
                </h3>
                <button type="button" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all cursor-pointer">
                  + Ajouter prescription
                </button>
              </div>
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 hover:border-green-500/50 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Pill className="text-green-400" size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-white font-semibold text-lg mb-1">{prescription.name} {prescription.dosage}</h4>
                          <span className="inline-block px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
                            Actif
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-3">
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Fréquence</div>
                          <div className="text-sm text-slate-300">{prescription.frequency}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Durée</div>
                          <div className="text-sm text-slate-300">{prescription.duration}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Début</div>
                          <div className="text-sm text-slate-300">{prescription.startDate}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'lab-results' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="text-cyan-400" size={20} />
                  Résultats du 15 octobre 2025
                </h3>
                <button type="button" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all cursor-pointer">
                  Télécharger rapport
                </button>
              </div>
              {labResults.map((result, index) => (
                <div key={index} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-semibold">{result.name}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      result.status === 'normal'
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      {result.status === 'normal' ? 'Normal' : 'Élevé'}
                    </span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-2xl font-bold text-white mb-1">{result.value}</div>
                      <div className="text-xs text-slate-500">Référence: {result.range}</div>
                    </div>
                    {result.status !== 'normal' && (
                      <AlertCircle className="text-red-400" size={20} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetailModalEnhanced;
