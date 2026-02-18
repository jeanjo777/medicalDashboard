/**
 * StatCard Component
 *
 * Displays a key metric with icon, value, and trend indicator.
 * Part of the dashboard statistics overview.
 *
 * @component
 * @example
 * <StatCard
 *   title="Patients Totaux"
 *   value={250}
 *   change="+12%"
 *   isPositive={true}
 *   icon={Users}
 *   iconBgColor="bg-blue-500/10"
 *   iconColor="text-blue-500"
 * />
 *
 * @accessibility
 * - Semantic HTML structure
 * - Color is not the only indicator (icons + text)
 * - Touch-friendly hover states
 * - High contrast text
 *
 * @props
 * @param {string} title - Metric label
 * @param {string|number} value - Current metric value
 * @param {string} change - Percentage change (e.g., "+12%")
 * @param {boolean} isPositive - Whether change is positive/negative
 * @param {LucideIcon} icon - Icon component for the metric
 * @param {string} iconBgColor - Tailwind class for icon background
 * @param {string} iconColor - Tailwind class for icon color
 *
 * @usage
 * Use in dashboard overview, analytics pages, or metric summaries.
 * Typically displayed in a grid of 2-4 cards.
 */

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive,
  icon: Icon,
  iconBgColor,
  iconColor
}) => {
  return (
    <div className="bg-[#1e293b] rounded-xl p-6 border border-[#334155] hover:border-[#475569] transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center`}>
              <Icon size={24} className={iconColor} strokeWidth={2} />
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <h3 className="text-white text-3xl font-bold mb-2">{value}</h3>
          <div className="flex items-center gap-1">
            {isPositive ? (
              <TrendingUp size={14} className="text-emerald-500" />
            ) : (
              <TrendingDown size={14} className="text-red-500" />
            )}
            <span className={`text-xs font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
              {change}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
