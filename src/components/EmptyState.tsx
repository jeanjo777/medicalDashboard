/**
 * EmptyState Component
 *
 * Displays encouraging empty state messages with contextual actions.
 * Provides positive, welcoming messages when no data is available yet.
 *
 * @component
 * @example
 * // Empty patients list
 * <EmptyState
 *   type="patients"
 *   onAction={() => setAddModalOpen(true)}
 * />
 *
 * @example
 * // Custom empty state
 * <EmptyState
 *   title="Aucun résultat trouvé"
 *   message="Essayez de modifier vos critères de recherche"
 *   actionLabel="Réinitialiser les filtres"
 *   onAction={() => resetFilters()}
 *   type="generic"
 * />
 *
 * @accessibility
 * - Uses role="status" for screen readers
 * - aria-live="polite" for non-intrusive announcements
 * - aria-label on action button
 * - Keyboard navigation support
 * - Sufficient color contrast (WCAG AA)
 * - Touch-friendly button size (min 44x44px)
 *
 * @props
 * @param {string} [title] - Custom title (overrides default)
 * @param {string} [message] - Custom message (overrides default)
 * @param {'patients'|'appointments'|'consultations'|'generic'} [type='generic'] - Content type for contextual styling
 * @param {string} [actionLabel] - Custom action button label (overrides default)
 * @param {() => void} [onAction] - Callback for primary action button
 * @param {string} [className] - Additional CSS classes
 *
 * @usage
 * Use EmptyState when:
 * - No data exists in a list/table
 * - Search returns no results
 * - User hasn't created any items yet
 * - Dashboard has no activity
 * - Chart has no data to display
 *
 * @design
 * - Uses color-coded icons (blue/purple/green)
 * - Provides encouraging, positive messaging
 * - Always includes a call-to-action when possible
 * - Maintains consistent spacing and hierarchy
 */

import React from 'react';
import { Plus, Users, Calendar, FileText, Activity, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  type?: 'patients' | 'appointments' | 'consultations' | 'generic';
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  type = 'generic',
  actionLabel,
  onAction,
  className = ''
}) => {
  const getDefaultContent = () => {
    switch (type) {
      case 'patients':
        return {
          title: 'Aucun patient enregistré',
          message: 'Commencez par ajouter votre premier patient pour suivre son parcours de soins.',
          actionLabel: 'Ajouter un patient',
          icon: Users,
          color: 'blue'
        };
      case 'appointments':
        return {
          title: 'Aucun rendez-vous programmé',
          message: "Planifiez votre premier rendez-vous pour organiser vos consultations.",
          actionLabel: 'Créer un rendez-vous',
          icon: Calendar,
          color: 'purple'
        };
      case 'consultations':
        return {
          title: 'Aucune consultation enregistrée',
          message: "Commencez à documenter les consultations de vos patients.",
          actionLabel: 'Nouvelle consultation',
          icon: FileText,
          color: 'green'
        };
      default:
        return {
          title: 'Aucune donnée disponible',
          message: "Il n'y a pas encore de données à afficher ici.",
          actionLabel: 'Commencer',
          icon: Inbox,
          color: 'blue'
        };
    }
  };

  const defaultContent = getDefaultContent();
  const Icon = defaultContent.icon;
  const displayTitle = title || defaultContent.title;
  const displayMessage = message || defaultContent.message;
  const displayActionLabel = actionLabel || defaultContent.actionLabel;

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'purple':
        return {
          bg: 'bg-purple-500/10',
          text: 'text-purple-500',
          button: 'bg-purple-600 hover:bg-purple-700'
        };
      case 'green':
        return {
          bg: 'bg-green-500/10',
          text: 'text-green-500',
          button: 'bg-green-600 hover:bg-green-700'
        };
      default:
        return {
          bg: 'bg-blue-500/10',
          text: 'text-blue-500',
          button: 'bg-blue-600 hover:bg-blue-700'
        };
    }
  };

  const colors = getColorClasses(defaultContent.color);

  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-6 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className={`w-20 h-20 ${colors.bg} rounded-full flex items-center justify-center mb-6 animate-scale-in`}>
        <Icon size={40} className={colors.text} aria-hidden="true" />
      </div>

      <h3 className="text-xl font-semibold text-white mb-3 text-center">
        {displayTitle}
      </h3>

      <p className="text-gray-400 text-center max-w-md mb-8 leading-relaxed">
        {displayMessage}
      </p>

      {onAction && (
        <button
          onClick={onAction}
          className={`flex items-center gap-2 px-5 py-2.5 ${colors.button} text-white rounded-lg font-medium transition-colors duration-200 shadow-lg hover:shadow-xl`}
          aria-label={displayActionLabel}
        >
          <Plus size={18} aria-hidden="true" />
          <span>{displayActionLabel}</span>
        </button>
      )}

      <div className="mt-8 flex items-center gap-2 text-sm text-gray-500">
        <Activity size={16} className="animate-pulse" aria-hidden="true" />
        <span>Prêt à commencer</span>
      </div>
    </div>
  );
};

export default EmptyState;
