import { useState, useEffect } from 'react';
import logger from '../utils/logger';

interface MedicUser {
  id: string;
  username: string;
  nom: string;
  prenom: string;
  specialite: string;
  email: string;
  telephone: string;
}

interface UseMedicAuthResult {
  user: MedicUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}

// TEMP: Mock user for testing - remove this to restore authentication
const MOCK_USER: MedicUser = {
  id: 'test-medic-001',
  username: 'dr.test',
  nom: 'Dupont',
  prenom: 'Jean',
  specialite: 'Médecine générale',
  email: 'dr.dupont@medical.test',
  telephone: '0123456789',
};

// Set to false to disable mock and restore normal auth
const USE_MOCK_AUTH = false;

export const useMedicAuth = (): UseMedicAuthResult => {
  const [user, setUser] = useState<MedicUser | null>(USE_MOCK_AUTH ? MOCK_USER : null);
  const [isLoading, setIsLoading] = useState(!USE_MOCK_AUTH);

  useEffect(() => {
    // TEMP: Skip auth check when using mock
    if (USE_MOCK_AUTH) {
      return;
    }

    const loadUser = () => {
      logger.info('[useMedicAuth] Loading user from localStorage...');
      try {
        const token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('user');

        logger.info(`[useMedicAuth] Token exists: ${!!token}`);
        logger.info(`[useMedicAuth] User string exists: ${!!userStr}`);

        if (!token || !userStr) {
          logger.info('[useMedicAuth] No auth data found, user = null');
          setUser(null);
          setIsLoading(false);
          return;
        }

        const userData = JSON.parse(userStr);
        logger.info('[useMedicAuth] User data parsed successfully');
        setUser(userData);
        logger.info('[useMedicAuth] User state updated successfully');
      } catch (error) {
        logger.error('[useMedicAuth] Error loading user data:', error instanceof Error ? error : undefined);
        setUser(null);
      } finally {
        setIsLoading(false);
        logger.info('[useMedicAuth] Loading complete, isLoading = false');
      }
    };

    loadUser();
  }, []);

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    logout,
  };
};
