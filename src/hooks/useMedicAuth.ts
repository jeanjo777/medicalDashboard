import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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

export const useMedicAuth = (): UseMedicAuthResult => {
  const navigate = useNavigate();
  const [user, setUser] = useState<MedicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  }, [navigate]);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    logout,
  };
};
