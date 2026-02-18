/**
 * ErrorState Component
 *
 * Displays user-friendly error messages with appropriate iconography and actions.
 * Handles different error types including network failures, expired sessions, and permission issues.
 *
 * @component
 * @example
 * // Network error with retry
 * <ErrorState
 *   type="network"
 *   message="Impossible de charger les patients"
 *   onRetry={() => fetchData()}
 * />
 *
 * @example
 * // Session expired with reconnect
 * <ErrorState
 *   type="session"
 *   onRetry={() => refetch()}
 *   onLogout={() => handleLogout()}
 * />
 *
 * @accessibility
 * - Uses role="alert" for screen readers
 * - aria-live="polite" for non-intrusive announcements
 * - aria-label on action buttons
 * - Keyboard navigation support
 * - Sufficient color contrast (WCAG AA)
 *
 * @props
 * @param {string} [title] - Custom error title (overrides default)
 * @param {string} [message] - Custom error message (overrides default)
 * @param {'error'|'session'|'network'|'permission'} [type='error'] - Error type for contextual styling
 * @param {() => void} [onRetry] - Callback for retry action
 * @param {() => void} [onLogout] - Callback for logout/reconnect (session type only)
 * @param {string} [className] - Additional CSS classes
 *
 * @usage
 * Use ErrorState when:
 * - API requests fail
 * - User session expires
 * - Network connectivity issues occur
 * - Permission checks fail
 * - Data loading encounters errors
 */

import React from 'react';
import { AlertCircle, RefreshCw, LogOut } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  type?: 'error' | 'session' | 'network' | 'permission';
  onRetry?: () => void;
  onLogout?: () => void;
  className?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  type = 'error',
  onRetry,
  onLogout,
  className = ''
}) => {
  const getDefaultContent = () => {
    switch (type) {
      case 'session':
        return {
          title: 'Session expirée',
          message: 'Votre session a expiré. Veuillez vous reconnecter pour continuer.',
          icon: LogOut
        };
      case 'network':
        return {
          title: 'Erreur de connexion',
          message: 'Impossible de charger les données. Vérifiez votre connexion internet.',
          icon: AlertCircle
        };
      case 'permission':
        return {
          title: 'Accès refusé',
          message: "Vous n'avez pas les permissions nécessaires pour accéder à ces données.",
          icon: AlertCircle
        };
      default:
        return {
          title: 'Erreur de chargement',
          message: 'Une erreur est survenue lors du chargement des données.',
          icon: AlertCircle
        };
    }
  };

  const defaultContent = getDefaultContent();
  const Icon = defaultContent.icon;
  const displayTitle = title || defaultContent.title;
  const displayMessage = message || defaultContent.message;

  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-6 ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <Icon size={40} className="text-red-500" aria-hidden="true" />
      </div>

      <h3 className="text-xl font-semibold text-white mb-3 text-center">
        {displayTitle}
      </h3>

      <p className="text-gray-400 text-center max-w-md mb-8 leading-relaxed">
        {displayMessage}
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
            aria-label="Réessayer de charger les données"
          >
            <RefreshCw size={18} aria-hidden="true" />
            <span>Réessayer</span>
          </button>
        )}

        {onLogout && type === 'session' && (
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#334155] hover:bg-[#475569] text-white rounded-lg font-medium transition-colors duration-200"
            aria-label="Se reconnecter"
          >
            <LogOut size={18} aria-hidden="true" />
            <span>Se reconnecter</span>
          </button>
        )}
      </div>

      {type === 'network' && (
        <p className="mt-6 text-sm text-gray-500 text-center">
          Code d'erreur: NETWORK_ERROR
        </p>
      )}
    </div>
  );
};

export default ErrorState;
