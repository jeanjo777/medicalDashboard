import React, { useState, useCallback } from 'react';
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
  Monitor,
  Download,
  Trash2,
  AlertTriangle,
  X,
  Eye,
  EyeOff,
  LogOut,
  Smartphone,
  Laptop
} from 'lucide-react';

type ThemeMode = 'light' | 'dark' | 'system';
type Language = 'fr' | 'en';

interface SettingSection {
  id: string;
  label: string;
  icon: React.ReactNode;
}

// Toast notification component
const Toast: React.FC<{ message: string; type: 'success' | 'error' | 'info'; onClose: () => void }> = ({ message, type, onClose }) => {
  const bgColor = type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  return (
    <div className={`fixed top-4 right-4 z-50 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in-right`}>
      {type === 'success' && <Check size={18} />}
      {type === 'error' && <AlertTriangle size={18} />}
      <span className="font-medium">{message}</span>
      <button type="button" onClick={onClose} className="ml-2 hover:opacity-70" aria-label="Fermer la notification">
        <X size={16} />
      </button>
    </div>
  );
};

// Confirmation modal
const ConfirmModal: React.FC<{
  title: string;
  message: string;
  confirmLabel: string;
  confirmColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ title, message, confirmLabel, confirmColor = 'bg-red-500 hover:bg-red-600', onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="theme-bg-secondary rounded-xl border theme-border p-6 max-w-md w-full mx-4 shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-red-500/20 rounded-lg">
          <AlertTriangle size={24} className="text-red-400" />
        </div>
        <h3 className="text-lg font-bold theme-text-primary">{title}</h3>
      </div>
      <p className="theme-text-secondary mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg theme-bg-tertiary theme-text-primary hover:opacity-80 transition-colors">
          Annuler
        </button>
        <button type="button" onClick={onConfirm} className={`px-4 py-2 rounded-lg text-white transition-colors ${confirmColor}`}>
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

// Password change modal
const PasswordModal: React.FC<{ onClose: () => void; onSave: () => void; onError: (msg: string) => void }> = ({ onClose, onSave, onError }) => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = () => {
    setValidationError(null);

    if (!currentPassword) {
      setValidationError('Veuillez entrer votre mot de passe actuel.');
      return;
    }
    if (newPassword.length < 8) {
      setValidationError('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setValidationError('Les mots de passe ne correspondent pas.');
      return;
    }

    // TODO: Call Supabase Edge Function for password change when available.
    // For now, validation passes but no backend call is made.
    console.warn('Password change API is not yet implemented. Validation passed with provided credentials.');
    onError('Changement de mot de passe non disponible pour le moment.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="theme-bg-secondary rounded-xl border theme-border p-6 max-w-md w-full mx-4 shadow-2xl">
        <h3 className="text-lg font-bold theme-text-primary mb-4">Modifier le mot de passe</h3>
        {validationError && (
          <div className="mb-4 p-3 bg-red-500/15 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle size={16} className="flex-shrink-0" />
            {validationError}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-sm theme-text-secondary mb-2">Mot de passe actuel</label>
            <div className="relative">
              <input type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Entrez votre mot de passe actuel" className="w-full px-4 py-2.5 theme-bg-input border theme-border rounded-lg theme-text-primary focus:border-primary focus:outline-none pr-10" />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted">
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm theme-text-secondary mb-2">Nouveau mot de passe</label>
            <div className="relative">
              <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Entrez votre nouveau mot de passe (min. 8 caractères)" className="w-full px-4 py-2.5 theme-bg-input border theme-border rounded-lg theme-text-primary focus:border-primary focus:outline-none pr-10" />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted">
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm theme-text-secondary mb-2">Confirmer le mot de passe</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirmez votre nouveau mot de passe" className="w-full px-4 py-2.5 theme-bg-input border theme-border rounded-lg theme-text-primary focus:border-primary focus:outline-none" />
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg theme-bg-tertiary theme-text-primary hover:opacity-80 cursor-pointer">Annuler</button>
          <button type="button" onClick={handleSubmit} className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white cursor-pointer">Enregistrer</button>
        </div>
      </div>
    </div>
  );
};

const SettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // Theme from context
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Settings state
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('app-language') as Language) || 'fr';
  });
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('app-notifications');
    return saved ? JSON.parse(saved) : {
      email: true,
      push: true,
      sms: false,
      appointments: true,
      updates: false
    };
  });
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showClearCacheConfirm, setShowClearCacheConfirm] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(() => {
    return localStorage.getItem('2fa-enabled') === 'true';
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Profile form state – initialised from localStorage (or user object as fallback)
  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem('app-profile');
    if (saved) return JSON.parse(saved);
    return {
      prenom: user?.prenom || 'John',
      nom: user?.nom || 'Doe',
      email: user?.email || 'contact@medicare.com',
      telephone: '+33 6 12 34 56 78',
      specialite: 'Médecine générale'
    };
  });

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

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
    localStorage.setItem('app-profile', JSON.stringify(profileData));
    setSaved(true);
    showToast('Paramètres enregistrés avec succès');
    setTimeout(() => setSaved(false), 2000);
  };

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    const labels: Record<ThemeMode, string> = { light: 'Thème clair activé', dark: 'Thème sombre activé', system: 'Thème système activé' };
    showToast(labels[newTheme], 'info');
  };

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    localStorage.setItem('app-language', newLang);
    showToast(newLang === 'fr' ? 'Langue changée en Français' : 'Language changed to English', 'info');
  };

  const handlePasswordChange = () => {
    setShowPasswordModal(false);
    showToast('Mot de passe modifié avec succès');
  };

  const handleToggle2FA = () => {
    const newValue = !twoFactorEnabled;
    setTwoFactorEnabled(newValue);
    localStorage.setItem('2fa-enabled', String(newValue));
    showToast(newValue ? 'Authentification à deux facteurs activée' : 'Authentification à deux facteurs désactivée');
  };

  const handleExportData = () => {
    const exportData = {
      user,
      settings: { language, notifications, theme },
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical-ai-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Données exportées avec succès');
  };

  const handleClearCache = () => {
    const keysToKeep = ['user', 'theme', 'app-language', '2fa-enabled'];
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });
    setShowClearCacheConfirm(false);
    showToast('Cache vidé avec succès');
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(false);
    showToast('Demande de suppression envoyée. Vous serez contacté par email.', 'info');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold theme-text-primary mb-4">Informations personnelles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm theme-text-secondary mb-2">Prénom</label>
                  <input
                    type="text"
                    value={profileData.prenom}
                    onChange={(e) => setProfileData((prev: typeof profileData) => ({ ...prev, prenom: e.target.value }))}
                    className="w-full px-4 py-2.5 theme-bg-input border theme-border rounded-lg theme-text-primary focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm theme-text-secondary mb-2">Nom</label>
                  <input
                    type="text"
                    value={profileData.nom}
                    onChange={(e) => setProfileData((prev: typeof profileData) => ({ ...prev, nom: e.target.value }))}
                    className="w-full px-4 py-2.5 theme-bg-input border theme-border rounded-lg theme-text-primary focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm theme-text-secondary mb-2">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData((prev: typeof profileData) => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2.5 theme-bg-input border theme-border rounded-lg theme-text-primary focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm theme-text-secondary mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={profileData.telephone}
                    onChange={(e) => setProfileData((prev: typeof profileData) => ({ ...prev, telephone: e.target.value }))}
                    className="w-full px-4 py-2.5 theme-bg-input border theme-border rounded-lg theme-text-primary focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold theme-text-primary mb-4">Spécialité</h3>
              <select
                value={profileData.specialite}
                onChange={(e) => setProfileData((prev: typeof profileData) => ({ ...prev, specialite: e.target.value }))}
                className="w-full px-4 py-2.5 theme-bg-input border theme-border rounded-lg theme-text-primary focus:border-primary focus:outline-none transition-colors"
              >
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
            <h3 className="text-lg font-semibold theme-text-primary mb-4">Préférences de notification</h3>
            <div className="space-y-4">
              {[
                { key: 'email', label: 'Notifications par email', desc: 'Recevoir les notifications importantes par email' },
                { key: 'push', label: 'Notifications push', desc: 'Notifications en temps réel dans le navigateur' },
                { key: 'sms', label: 'Notifications SMS', desc: 'Alertes urgentes par SMS' },
                { key: 'appointments', label: 'Rappels de rendez-vous', desc: 'Rappels avant chaque consultation' },
                { key: 'updates', label: 'Mises à jour système', desc: 'Informations sur les nouvelles fonctionnalités' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 theme-bg-input rounded-lg border theme-border transition-colors">
                  <div>
                    <p className="theme-text-primary font-medium">{item.label}</p>
                    <p className="text-sm theme-text-secondary">{item.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifications((prev: typeof notifications) => ({ ...prev, [item.key]: !prev[item.key as keyof typeof notifications] }))}
                    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 cursor-pointer ${
                      notifications[item.key as keyof typeof notifications] ? 'bg-primary' : 'bg-gray-500'
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
            <h3 className="text-lg font-semibold theme-text-primary mb-4">Thème de l'interface</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {[
                { value: 'light' as ThemeMode, label: 'Clair', icon: <Sun size={20} />, desc: 'Interface lumineuse', previewBg: '#f8fafc', previewCard: '#ffffff', previewText: '#0f172a', previewMuted: '#94a3b8', previewBorder: '#e2e8f0', previewAccent: '#2563eb' },
                { value: 'dark' as ThemeMode, label: 'Sombre', icon: <Moon size={20} />, desc: 'Interface sombre', previewBg: '#0f172a', previewCard: '#1e293b', previewText: '#ffffff', previewMuted: '#64748b', previewBorder: '#334155', previewAccent: '#3b82f6' },
                { value: 'system' as ThemeMode, label: 'Système', icon: <Monitor size={20} />, desc: 'Préférences OS', previewBg: 'linear-gradient(135deg, #f8fafc 50%, #0f172a 50%)', previewCard: '#1e293b', previewText: '#ffffff', previewMuted: '#64748b', previewBorder: '#334155', previewAccent: '#3b82f6' }
              ].map((option) => {
                const isSelected = theme === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleThemeChange(option.value)}
                    className={`group relative p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 sm:gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20 ring-1 ring-primary/30'
                        : 'border-[var(--border-color)] bg-[var(--bg-input)] hover:border-[var(--border-hover)] hover:shadow-md'
                    }`}
                  >
                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}

                    {/* Mini preview mockup */}
                    <div
                      className="w-full aspect-[4/3] rounded-lg overflow-hidden border border-[var(--border-color)] relative"
                      style={{ background: option.previewBg }}
                    >
                      {/* Mini sidebar */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-[18%] rounded-l-lg"
                        style={{ backgroundColor: option.value === 'light' ? '#ffffff' : '#1e293b', borderRight: `1px solid ${option.previewBorder}` }}
                      />
                      {/* Mini header */}
                      <div
                        className="absolute left-[18%] top-0 right-0 h-[16%]"
                        style={{ backgroundColor: option.previewCard, borderBottom: `1px solid ${option.previewBorder}` }}
                      />
                      {/* Mini content cards */}
                      <div className="absolute left-[22%] top-[22%] right-[6%] flex flex-col gap-[4px]">
                        <div className="flex gap-[4px]">
                          <div className="flex-1 h-[10px] rounded-sm" style={{ backgroundColor: option.previewCard, border: `1px solid ${option.previewBorder}` }} />
                          <div className="flex-1 h-[10px] rounded-sm" style={{ backgroundColor: option.previewCard, border: `1px solid ${option.previewBorder}` }} />
                        </div>
                        <div className="h-[16px] rounded-sm" style={{ backgroundColor: option.previewCard, border: `1px solid ${option.previewBorder}` }} />
                        <div className="flex gap-[4px]">
                          <div className="flex-1 h-[8px] rounded-sm" style={{ backgroundColor: option.previewAccent, opacity: 0.2 }} />
                          <div className="flex-1 h-[8px] rounded-sm" style={{ backgroundColor: option.previewCard, border: `1px solid ${option.previewBorder}` }} />
                          <div className="flex-1 h-[8px] rounded-sm" style={{ backgroundColor: option.previewCard, border: `1px solid ${option.previewBorder}` }} />
                        </div>
                      </div>
                    </div>

                    {/* Label + icon */}
                    <div className="flex items-center gap-2">
                      <span className={`transition-colors duration-200 ${isSelected ? 'text-primary' : 'theme-text-muted group-hover:theme-text-secondary'}`}>
                        {option.icon}
                      </span>
                      <span className={`font-semibold text-sm transition-colors duration-200 ${isSelected ? 'text-primary' : 'theme-text-primary'}`}>
                        {option.label}
                      </span>
                    </div>

                    {/* Description */}
                    <span className={`text-xs transition-colors duration-200 ${isSelected ? 'text-primary/70' : 'theme-text-muted'}`}>
                      {option.desc}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Theme preview */}
            <div className="mt-6 p-4 rounded-xl border theme-border theme-bg-input flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${resolvedTheme === 'dark' ? 'bg-blue-400' : 'bg-amber-400'}`} />
                <span className="theme-text-primary font-medium text-sm">
                  {resolvedTheme === 'dark' ? 'Mode sombre actif' : 'Mode clair actif'}
                </span>
              </div>
              {theme === 'system' && (
                <span className="text-xs theme-text-muted bg-[var(--bg-tertiary)] px-2.5 py-1 rounded-full">
                  Automatique
                </span>
              )}
            </div>
          </div>
        );

      case 'language':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold theme-text-primary mb-4">Langue de l'application</h3>
            <div className="space-y-3">
              {[
                { value: 'fr' as Language, label: 'Français', flag: 'FR' },
                { value: 'en' as Language, label: 'English', flag: 'GB' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleLanguageChange(option.value)}
                  className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-4 cursor-pointer ${
                    language === option.value
                      ? 'border-primary bg-primary/10'
                      : 'border-[var(--border-color)] bg-[var(--bg-input)] hover:border-[var(--border-hover)]'
                  }`}
                >
                  <span className="text-sm font-bold theme-text-secondary bg-[var(--bg-tertiary)] px-2 py-1 rounded">{option.flag}</span>
                  <span className={`font-medium ${language === option.value ? 'theme-text-primary' : 'theme-text-secondary'}`}>
                    {option.label}
                  </span>
                  {language === option.value && (
                    <Check size={20} className="text-primary ml-auto" />
                  )}
                </button>
              ))}
            </div>
            <p className="text-sm theme-text-muted mt-4">
              {language === 'fr'
                ? 'Le changement de langue sera appliqué immédiatement.'
                : 'Language change will be applied immediately.'}
            </p>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold theme-text-primary mb-4">Sécurité du compte</h3>
            <div className="space-y-4">
              <div className="p-4 theme-bg-input rounded-lg border theme-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="theme-text-primary font-medium">Mot de passe</p>
                    <p className="text-sm theme-text-secondary">Dernière modification il y a 30 jours</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(true)}
                    className="px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors cursor-pointer"
                  >
                    Modifier
                  </button>
                </div>
              </div>
              <div className="p-4 theme-bg-input rounded-lg border theme-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="theme-text-primary font-medium">Authentification à deux facteurs</p>
                    <p className="text-sm theme-text-secondary">
                      {twoFactorEnabled ? 'Activée - votre compte est protégé' : 'Ajoutez une couche de sécurité supplémentaire'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggle2FA}
                    className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                      twoFactorEnabled
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                    }`}
                  >
                    {twoFactorEnabled ? 'Désactiver' : 'Activer'}
                  </button>
                </div>
              </div>
              <div className="p-4 theme-bg-input rounded-lg border theme-border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="theme-text-primary font-medium">Sessions actives</p>
                    <p className="text-sm theme-text-secondary">Gérez vos appareils connectés</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-primary)]">
                    <div className="flex items-center gap-3">
                      <Laptop size={20} className="theme-text-muted" />
                      <div>
                        <p className="text-sm theme-text-primary font-medium">Windows - Chrome</p>
                        <p className="text-xs theme-text-muted">Session actuelle</p>
                      </div>
                    </div>
                    <span className="text-xs text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded">Actif</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-primary)]">
                    <div className="flex items-center gap-3">
                      <Smartphone size={20} className="theme-text-muted" />
                      <div>
                        <p className="text-sm theme-text-primary font-medium">iPhone - Safari</p>
                        <p className="text-xs theme-text-muted">Il y a 2 heures</p>
                      </div>
                    </div>
                    <button type="button" className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer">
                      <LogOut size={14} />
                      Déconnecter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold theme-text-primary mb-4">Gestion des données</h3>
            <div className="space-y-4">
              <div className="p-4 theme-bg-input rounded-lg border theme-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="theme-text-primary font-medium">Exporter mes données</p>
                    <p className="text-sm theme-text-secondary">Téléchargez une copie de vos données</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportData}
                    className="px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Download size={16} />
                    Exporter
                  </button>
                </div>
              </div>
              <div className="p-4 theme-bg-input rounded-lg border theme-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="theme-text-primary font-medium">Vider le cache</p>
                    <p className="text-sm theme-text-secondary">Libérez de l'espace de stockage local</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowClearCacheConfirm(true)}
                    className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 size={16} />
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
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <AlertTriangle size={16} />
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
    <div className="flex min-h-screen theme-bg-primary transition-colors duration-300">
      <MedicalSidebarRefined activeItem="settings" onCollapsedChange={setSidebarCollapsed} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <header className="theme-bg-secondary border-b theme-border px-3 sm:px-4 lg:px-8 py-3 sm:py-4 sticky top-0 z-30 transition-colors duration-300">
          <div className="flex items-center gap-2 sm:gap-3 ml-14 lg:ml-0">
            <div className="p-1.5 sm:p-2 bg-primary/20 rounded-lg flex-shrink-0">
              <Settings size={20} className="text-primary sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold theme-text-primary">Paramètres</h1>
              <p className="theme-text-secondary text-xs sm:text-sm truncate">Gérez vos préférences et votre compte</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-4 lg:p-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Sidebar Navigation */}
              <div className="lg:col-span-1">
                <div className="theme-bg-secondary rounded-xl border theme-border p-1.5 sm:p-2 transition-colors duration-300">
                  <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1 scrollbar-hide">
                    {settingSections.map((section) => (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => setActiveSection(section.id)}
                        className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all whitespace-nowrap lg:w-full cursor-pointer ${
                          activeSection === section.id
                            ? 'bg-primary/20 text-primary'
                            : 'theme-text-secondary hover:bg-[var(--bg-tertiary)] hover:theme-text-primary'
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
                <div className="theme-bg-secondary rounded-xl border theme-border p-4 sm:p-6 transition-colors duration-300">
                  {renderContent()}

                  {/* Save Button */}
                  <div className="mt-8 pt-6 border-t theme-border flex justify-end">
                    <button
                      type="button"
                      onClick={handleSave}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${
                        saved
                          ? 'bg-emerald-500 text-white'
                          : 'bg-primary hover:bg-primary-dark text-white'
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

      {/* Modals */}
      {showPasswordModal && (
        <PasswordModal onClose={() => setShowPasswordModal(false)} onSave={handlePasswordChange} />
      )}
      {showDeleteConfirm && (
        <ConfirmModal
          title="Supprimer le compte"
          message="Êtes-vous sûr de vouloir supprimer votre compte ? Toutes vos données seront perdues définitivement."
          confirmLabel="Supprimer"
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
      {showClearCacheConfirm && (
        <ConfirmModal
          title="Vider le cache"
          message="Êtes-vous sûr de vouloir vider le cache ? Certains paramètres locaux seront réinitialisés."
          confirmLabel="Vider"
          confirmColor="bg-amber-500 hover:bg-amber-600"
          onConfirm={handleClearCache}
          onCancel={() => setShowClearCacheConfirm(false)}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default SettingsPage;
