import React, { useState } from 'react';
import MedicalSidebarRefined from '../components/MedicalSidebarRefined';
import { useTheme } from '../contexts/ThemeContext';
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Database,
  Save,
  Check,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';

type ThemeMode = 'light' | 'dark' | 'system';
type Language = 'fr' | 'en';

interface SettingSection {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const SettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // Theme from context
  const { theme, setTheme } = useTheme();

  // Settings state
  const [language, setLanguage] = useState<Language>('fr');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    appointments: true,
    updates: false
  });
  const [saved, setSaved] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const settingSections: SettingSection[] = [
    { id: 'profile', label: 'Profil', icon: <User size={20} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={20} /> },
    { id: 'appearance', label: 'Apparence', icon: <Palette size={20} /> },
    { id: 'language', label: 'Langue', icon: <Globe size={20} /> },
    { id: 'security', label: 'Sécurité', icon: <Shield size={20} /> },
    { id: 'data', label: 'Données', icon: <Database size={20} /> }
  ];

  const handleSave = () => {
    localStorage.setItem('app-language', language);
    localStorage.setItem('app-notifications', JSON.stringify(notifications));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Informations personnelles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Prénom</label>
                  <input
                    type="text"
                    defaultValue={user?.prenom || 'John'}
                    className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Nom</label>
                  <input
                    type="text"
                    defaultValue={user?.nom || 'Doe'}
                    className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue={user?.email || 'contact@medicare.com'}
                    className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    defaultValue="+33 6 12 34 56 78"
                    className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Spécialité</h3>
              <select className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:border-blue-500 focus:outline-none">
                <option>Médecine générale</option>
                <option>Cardiologie</option>
                <option>Neurologie</option>
                <option>Pédiatrie</option>
                <option>Dermatologie</option>
              </select>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Préférences de notification</h3>
            <div className="space-y-4">
              {[
                { key: 'email', label: 'Notifications par email', desc: 'Recevoir les notifications importantes par email' },
                { key: 'push', label: 'Notifications push', desc: 'Notifications en temps réel dans le navigateur' },
                { key: 'sms', label: 'Notifications SMS', desc: 'Alertes urgentes par SMS' },
                { key: 'appointments', label: 'Rappels de rendez-vous', desc: 'Rappels avant chaque consultation' },
                { key: 'updates', label: 'Mises à jour système', desc: 'Informations sur les nouvelles fonctionnalités' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-[#0f172a] rounded-lg border border-[#334155]">
                  <div>
                    <p className="text-white font-medium">{item.label}</p>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof notifications] }))}
                    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                      notifications[item.key as keyof typeof notifications] ? 'bg-blue-500' : 'bg-gray-600'
                    }`}
                    aria-label={`Toggle ${item.label}`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                        notifications[item.key as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Thème de l'interface</h3>
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {[
                { value: 'light', label: 'Clair', icon: <Sun size={24} /> },
                { value: 'dark', label: 'Sombre', icon: <Moon size={24} /> },
                { value: 'system', label: 'Système', icon: <Monitor size={24} /> }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTheme(option.value as ThemeMode)}
                  className={`p-3 sm:p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-2 sm:gap-3 ${
                    theme === option.value
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-[#334155] bg-[#0f172a] hover:border-[#475569]'
                  }`}
                >
                  <span className={theme === option.value ? 'text-blue-400' : 'text-gray-400'}>
                    {option.icon}
                  </span>
                  <span className={`font-medium ${theme === option.value ? 'text-white' : 'text-gray-400'}`}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'language':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Langue de l'application</h3>
            <div className="space-y-3">
              {[
                { value: 'fr', label: 'Français', flag: '🇫🇷' },
                { value: 'en', label: 'English', flag: '🇬🇧' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setLanguage(option.value as Language)}
                  className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-4 ${
                    language === option.value
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-[#334155] bg-[#0f172a] hover:border-[#475569]'
                  }`}
                >
                  <span className="text-2xl">{option.flag}</span>
                  <span className={`font-medium ${language === option.value ? 'text-white' : 'text-gray-400'}`}>
                    {option.label}
                  </span>
                  {language === option.value && (
                    <Check size={20} className="text-blue-400 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Sécurité du compte</h3>
            <div className="space-y-4">
              <div className="p-4 bg-[#0f172a] rounded-lg border border-[#334155]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white font-medium">Mot de passe</p>
                    <p className="text-sm text-gray-400">Dernière modification il y a 30 jours</p>
                  </div>
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                  >
                    Modifier
                  </button>
                </div>
              </div>
              <div className="p-4 bg-[#0f172a] rounded-lg border border-[#334155]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Authentification à deux facteurs</p>
                    <p className="text-sm text-gray-400">Ajoutez une couche de sécurité supplémentaire</p>
                  </div>
                  <button
                    type="button"
                    className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
                  >
                    Activer
                  </button>
                </div>
              </div>
              <div className="p-4 bg-[#0f172a] rounded-lg border border-[#334155]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Sessions actives</p>
                    <p className="text-sm text-gray-400">Gérez vos appareils connectés</p>
                  </div>
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-colors"
                  >
                    Voir
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Gestion des données</h3>
            <div className="space-y-4">
              <div className="p-4 bg-[#0f172a] rounded-lg border border-[#334155]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Exporter mes données</p>
                    <p className="text-sm text-gray-400">Téléchargez une copie de vos données</p>
                  </div>
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                  >
                    Exporter
                  </button>
                </div>
              </div>
              <div className="p-4 bg-[#0f172a] rounded-lg border border-[#334155]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Vider le cache</p>
                    <p className="text-sm text-gray-400">Libérez de l'espace de stockage local</p>
                  </div>
                  <button
                    type="button"
                    className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors"
                  >
                    Vider
                  </button>
                </div>
              </div>
              <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-400 font-medium">Supprimer mon compte</p>
                    <p className="text-sm text-red-400/70">Cette action est irréversible</p>
                  </div>
                  <button
                    type="button"
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0f172a]">
      <MedicalSidebarRefined activeItem="settings" onCollapsedChange={setSidebarCollapsed} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <header className="bg-[#1e293b] border-b border-[#334155] px-3 sm:px-4 lg:px-8 py-3 sm:py-4 sticky top-0 z-30">
          <div className="flex items-center gap-2 sm:gap-3 ml-14 lg:ml-0">
            <div className="p-1.5 sm:p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
              <Settings size={20} className="text-blue-400 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Paramètres</h1>
              <p className="text-gray-400 text-xs sm:text-sm truncate">Gérez vos préférences et votre compte</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-4 lg:p-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Sidebar Navigation */}
              <div className="lg:col-span-1">
                <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-1.5 sm:p-2">
                  <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1 scrollbar-hide">
                    {settingSections.map((section) => (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => setActiveSection(section.id)}
                        className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all whitespace-nowrap lg:w-full ${
                          activeSection === section.id
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'text-gray-400 hover:bg-[#334155] hover:text-white'
                        }`}
                      >
                        {section.icon}
                        <span className="font-medium text-sm sm:text-base">{section.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="lg:col-span-3">
                <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-4 sm:p-6">
                  {renderContent()}

                  {/* Save Button */}
                  <div className="mt-8 pt-6 border-t border-[#334155] flex justify-end">
                    <button
                      type="button"
                      onClick={handleSave}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
                        saved
                          ? 'bg-emerald-500 text-white'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      {saved ? (
                        <>
                          <Check size={18} />
                          Enregistré
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          Enregistrer
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
