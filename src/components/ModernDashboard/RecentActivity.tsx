/**
 * RecentActivity Component
 *
 * Displays recent patient-related activities and updates from activity_log table.
 * Real-time updates via Supabase subscriptions.
 *
 * @component
 * @example
 * <RecentActivity />
 *
 * @accessibility
 * - Semantic list structure
 * - Color-coded activity indicators
 * - Relative timestamps for context
 * - Loading and error states
 *
 * @usage
 * - Dashboard activity feed
 * - Recent updates widget
 * - Activity history overview
 *
 * @features
 * - Real-time activity updates via Supabase
 * - Relative time formatting (e.g., "5 minutes ago")
 * - Auto-refresh every 30 seconds
 * - Empty, loading, and error states
 */

import React from 'react';
import { useActivityLog } from '../../hooks/useActivityLog';
import EmptyState from '../EmptyState';
import ErrorState from '../ErrorState';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale/fr';

const getActivityColor = (entityType: string): string => {
  const colors: Record<string, string> = {
    patient: 'bg-blue-500',
    appointment: 'bg-emerald-500',
    consultation: 'bg-purple-500',
    other: 'bg-orange-500',
  };
  return colors[entityType] || colors.other;
};

const RecentActivity: React.FC = () => {
  const { activities, loading, error, refetch } = useActivityLog({
    limit: 8,
    autoRefresh: true,
    refreshInterval: 30000,
  });

  if (loading) {
    return (
      <div className="bg-[#1e293b] rounded-xl p-4 sm:p-5 lg:p-6 border border-[#334155]">
        <div className="mb-4 sm:mb-5 lg:mb-6">
          <h3 className="text-white text-base sm:text-lg font-semibold mb-0.5 sm:mb-1">Recent Activity</h3>
          <p className="text-gray-400 text-xs sm:text-sm">Latest patient updates</p>
        </div>
        <div className="space-y-3 sm:space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
              <div className="w-10 h-10 bg-gray-700 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1e293b] rounded-xl p-4 sm:p-5 lg:p-6 border border-[#334155]">
        <div className="mb-4 sm:mb-5 lg:mb-6">
          <h3 className="text-white text-base sm:text-lg font-semibold mb-0.5 sm:mb-1">Recent Activity</h3>
          <p className="text-gray-400 text-xs sm:text-sm">Latest patient updates</p>
        </div>
        <ErrorState
          type="network"
          message={error.message}
          onRetry={refetch}
        />
      </div>
    );
  }

  const hasActivity = activities.length > 0;

  return (
    <div className="bg-[#1e293b] rounded-xl p-6 border border-[#334155]">
      <div className="mb-6">
        <h3 className="text-white text-lg font-semibold mb-1">Recent Activity</h3>
        <p className="text-gray-400 text-sm">Latest patient updates</p>
      </div>
      {!hasActivity ? (
        <EmptyState
          title="Aucune activité récente"
          message="Les activités récentes de vos patients apparaîtront ici."
          type="generic"
          className="py-12"
        />
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {activities.map((activity) => {
            const bgColor = getActivityColor(activity.entity_type);
            const timeAgo = formatDistanceToNow(new Date(activity.created_at), {
              addSuffix: true,
              locale: fr,
            });

            return (
              <div key={activity.id} className="flex items-center gap-3 group hover:bg-[#334155]/30 p-2 -mx-2 rounded-lg transition-colors">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 ${bgColor} rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <span className="text-white text-xs sm:text-sm font-semibold">
                    {activity.user_initials}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs sm:text-sm font-medium truncate">
                    {activity.action}
                  </p>
                  <p className="text-gray-400 text-xs flex items-center gap-1">
                    {activity.entity_name && (
                      <>
                        <span>{activity.entity_name}</span>
                        <span>•</span>
                      </>
                    )}
                    <span>{timeAgo}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
