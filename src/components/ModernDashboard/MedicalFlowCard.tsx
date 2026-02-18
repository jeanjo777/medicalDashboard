/**
 * Medical Flow Card - UXBooster Style
 *
 * Displays key medical metrics with visual indicators
 */

import React from 'react';
import { AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface MedicalFlowCardProps {
  title: string;
  value: string | number;
  status: 'good' | 'warning' | 'attention';
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  alert?: string;
}

const MedicalFlowCard: React.FC<MedicalFlowCardProps> = ({
  title,
  value,
  status,
  trend,
  trendValue,
  alert,
}) => {
  const statusConfig = {
    good: {
      badge: 'BON',
      badgeClass: 'bg-emerald-500',
    },
    warning: {
      badge: 'ATTENTION',
      badgeClass: 'bg-yellow-500',
    },
    attention: {
      badge: 'URGENT',
      badgeClass: 'bg-orange-500',
    },
  };

  const config = statusConfig[status];

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-1 text-xs font-medium text-gray-500">{title}</div>
      <div className="mb-2 flex items-end gap-2">
        <span className="text-3xl sm:text-4xl font-bold text-gray-900">{value}</span>
        {trend && trendValue && (
          <span className={`flex items-center gap-0.5 text-xs font-medium ${
            trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500'
          }`}>
            {trend === 'up' ? (
              <TrendingUp className="h-3 w-3" />
            ) : trend === 'down' ? (
              <TrendingDown className="h-3 w-3" />
            ) : null}
            {trendValue}
          </span>
        )}
      </div>
      <div className={`inline-block rounded-full ${config.badgeClass} px-3 py-1 text-[10px] font-semibold text-white`}>
        {config.badge}
      </div>
      {alert && (
        <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-gray-50 p-2">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-500" />
          <p className="text-[10px] leading-relaxed text-gray-600">{alert}</p>
        </div>
      )}
    </div>
  );
};

export default MedicalFlowCard;
