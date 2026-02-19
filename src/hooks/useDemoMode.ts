import { useState, useEffect, useCallback } from 'react';

interface UseDemoModeOptions {
  defaultEnabled?: boolean;
  storageKey?: string;
}

interface UseDemoModeReturn {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  enableDemoMode: () => void;
  disableDemoMode: () => void;
  setDemoMode: (enabled: boolean) => void;
}

/**
 * Hook pour gérer le mode démonstration de l'application
 * Persiste l'état dans localStorage pour maintenir le choix de l'utilisateur
 *
 * @param options - Options de configuration
 * @param options.defaultEnabled - Si true, le mode démo est activé par défaut (default: false)
 * @param options.storageKey - Clé localStorage personnalisée (default: 'medical-app-demo-mode')
 *
 * @example
 * const { isDemoMode, toggleDemoMode } = useDemoMode();
 *
 * // Utilisation dans un composant
 * if (isDemoMode) {
 *   return <DemoDataView data={demoPatients} />;
 * }
 * return <RealDataView data={realPatients} />;
 */
export const useDemoMode = (options: UseDemoModeOptions = {}): UseDemoModeReturn => {
  const {
    defaultEnabled = false,
    storageKey = 'medical-app-demo-mode'
  } = options;

  // Initialiser l'état depuis localStorage ou utiliser la valeur par défaut
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return defaultEnabled;

    try {
      // Migration v2: clear old demo-mode=true so new default (false) takes effect
      const migrationKey = 'medical-app-demo-mode-v2';
      if (!localStorage.getItem(migrationKey)) {
        localStorage.removeItem(storageKey);
        localStorage.setItem(migrationKey, '1');
      }

      const stored = localStorage.getItem(storageKey);
      if (stored !== null) {
        return JSON.parse(stored);
      }
      return defaultEnabled;
    } catch {
      return defaultEnabled;
    }
  });

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(isDemoMode));
    } catch (error) {
      // localStorage non disponible — mode démo non persisté
    }
  }, [isDemoMode, storageKey]);

  // Fonctions de contrôle
  const toggleDemoMode = useCallback(() => {
    setIsDemoMode(prev => !prev);
  }, []);

  const enableDemoMode = useCallback(() => {
    setIsDemoMode(true);
  }, []);

  const disableDemoMode = useCallback(() => {
    setIsDemoMode(false);
  }, []);

  const setDemoMode = useCallback((enabled: boolean) => {
    setIsDemoMode(enabled);
  }, []);

  return {
    isDemoMode,
    toggleDemoMode,
    enableDemoMode,
    disableDemoMode,
    setDemoMode
  };
};

export default useDemoMode;
