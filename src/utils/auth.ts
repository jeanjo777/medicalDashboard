import logger from './logger';

// Types pour une meilleure sécurité de type
export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  nom?: string;
  prenom?: string;
  specialite?: string;
  created_at?: string;
}

interface TokenPayload {
  exp: number;
  sub: string;
  email: string;
}

// Constantes
const AUTH_TOKEN_KEY = 'auth_token';
const USER_KEY = 'user';
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes avant expiration

/**
 * Décode un JWT sans vérification (côté client)
 * La vérification réelle se fait côté serveur
 */
const decodeToken = (token: string): TokenPayload | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Handle base64url encoding (JWT standard) - replace url-safe chars and add padding
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';

    const payload = JSON.parse(atob(base64));
    return payload as TokenPayload;
  } catch {
    return null;
  }
};

/**
 * Vérifie si le token est expiré localement
 */
const isTokenExpired = (token: string): boolean => {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return true;

  const expirationTime = payload.exp * 1000;
  return Date.now() >= expirationTime;
};

/**
 * Vérifie si le token expire bientôt
 */
const isTokenExpiringSoon = (token: string): boolean => {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return true;

  const expirationTime = payload.exp * 1000;
  return Date.now() >= expirationTime - TOKEN_REFRESH_THRESHOLD;
};

/**
 * Vérifie si l'utilisateur est authentifié
 * Inclut une vérification de l'expiration du token
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) return false;

  // Vérification locale de l'expiration
  if (isTokenExpired(token)) {
    logger.warn('Token expiré détecté', { component: 'auth' });
    clearAuthData();
    return false;
  }

  return true;
};

/**
 * Récupère le token d'authentification
 */
export const getAuthToken = (): string | null => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  if (token && isTokenExpired(token)) {
    logger.warn('Token expiré, suppression', { component: 'auth' });
    clearAuthData();
    return null;
  }

  return token;
};

/**
 * Récupère les informations de l'utilisateur avec typage
 */
export const getUser = (): User | null => {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;

  try {
    const user = JSON.parse(userStr);
    // Validation basique de la structure
    if (!user.id || !user.email) {
      logger.warn('Données utilisateur invalides', { component: 'auth' });
      return null;
    }
    return user as User;
  } catch (error) {
    logger.error('Erreur parsing user data', error as Error, { component: 'auth' });
    return null;
  }
};

/**
 * Sauvegarde les données d'authentification
 */
export const setAuthData = (token: string, user: User): void => {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    logger.info('Authentification réussie', {
      component: 'auth',
      userId: user.id
    });
  } catch (error) {
    logger.error('Erreur sauvegarde auth data', error as Error, { component: 'auth' });
  }
};

/**
 * Efface les données d'authentification
 */
const clearAuthData = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Déconnexion de l'utilisateur
 */
export const logout = (): void => {
  const user = getUser();
  logger.info('Déconnexion utilisateur', {
    component: 'auth',
    userId: user?.id
  });

  clearAuthData();

  // Utiliser replace pour éviter le retour arrière
  window.location.replace('/login');
};

/**
 * Vérifie le token auprès du serveur
 * Avec gestion du retry et timeout
 */
export const verifyToken = async (options?: {
  timeout?: number;
  retries?: number;
}): Promise<boolean> => {
  const token = getAuthToken();
  if (!token) return false;

  const { timeout = 10000, retries = 2 } = options || {};

  const attemptVerification = async (attempt: number): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const apiUrl = `${window.location.origin}/functions/v1/verify-token`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        logger.warn('Vérification token échouée', {
          component: 'auth',
          status: response.status
        });
        return false;
      }

      const data = await response.json();
      return data.valid === true;
    } catch (error) {
      if (attempt < retries) {
        logger.debug(`Retry vérification token (${attempt + 1}/${retries})`, { component: 'auth' });
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        return attemptVerification(attempt + 1);
      }

      logger.error('Erreur vérification token', error as Error, { component: 'auth' });
      return false;
    }
  };

  return attemptVerification(1);
};

/**
 * Vérifie si un rafraîchissement du token est nécessaire
 */
export const shouldRefreshToken = (): boolean => {
  const token = getAuthToken();
  if (!token) return false;
  return isTokenExpiringSoon(token);
};

/**
 * Récupère l'ID utilisateur depuis le token
 */
export const getUserIdFromToken = (): string | null => {
  const token = getAuthToken();
  if (!token) return null;

  const payload = decodeToken(token);
  return payload?.sub || null;
};

/**
 * Récupère l'ID du médecin connecté (depuis localStorage user ou token)
 * Utilisé pour filtrer les patients par médecin
 */
export const getCurrentMedicId = (): string | null => {
  const user = getUser();
  if (user?.id) return user.id;
  return getUserIdFromToken();
};
