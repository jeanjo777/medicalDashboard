import React from 'react';
import { Database, FlaskConical } from 'lucide-react';

interface DemoModeToggleProps {
  isDemoMode: boolean;
  onToggle: () => void;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Composant de toggle pour basculer entre le mode démonstration et les données réelles
 * À intégrer dans les headers des pages
 */
const DemoModeToggle: React.FC<DemoModeToggleProps> = ({
  isDemoMode,
  onToggle,
  className = '',
  showLabel = true,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-2',
    lg: 'px-4 py-2 text-base gap-2'
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  return (
    <button
      onClick={onToggle}
      className={`
        flex items-center rounded-lg font-medium transition-all duration-200
        ${sizeClasses[size]}
        ${isDemoMode
          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30'
          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
        }
        ${className}
      `}
      title={isDemoMode ? 'Mode démonstration actif - Cliquer pour utiliser les données réelles' : 'Données réelles - Cliquer pour activer le mode démo'}
    >
      {isDemoMode ? (
        <FlaskConical size={iconSizes[size]} />
      ) : (
        <Database size={iconSizes[size]} />
      )}
      {showLabel && (
        <span className="hidden sm:inline">
          {isDemoMode ? 'Mode Démo' : 'Données Réelles'}
        </span>
      )}
      <span
        className={`
          w-2 h-2 rounded-full
          ${isDemoMode ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}
        `}
      />
    </button>
  );
};

/**
 * Version compacte pour les espaces restreints
 */
export const DemoModeIndicator: React.FC<{ isDemoMode: boolean; onClick?: () => void }> = ({
  isDemoMode,
  onClick
}) => {
  if (!isDemoMode) return null;

  return (
    <div
      onClick={onClick}
      className={`
        flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium
        bg-amber-500/20 text-amber-400 border border-amber-500/30
        ${onClick ? 'cursor-pointer hover:bg-amber-500/30' : ''}
      `}
    >
      <FlaskConical size={12} />
      <span>Démo</span>
    </div>
  );
};

/**
 * Bannière d'information pour le mode démo
 */
export const DemoModeBanner: React.FC<{
  isDemoMode: boolean;
  onDisable?: () => void;
  className?: string;
}> = ({ isDemoMode, onDisable, className = '' }) => {
  if (!isDemoMode) return null;

  return (
    <div className={`bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 ${className}`}>
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-amber-400 text-sm">
          <FlaskConical size={16} />
          <span>
            <strong>Mode démonstration actif</strong> - Les données affichées sont fictives
          </span>
        </div>
        {onDisable && (
          <button
            onClick={onDisable}
            className="text-amber-400 hover:text-amber-300 text-sm underline"
          >
            Désactiver
          </button>
        )}
      </div>
    </div>
  );
};

export default DemoModeToggle;
