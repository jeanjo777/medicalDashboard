/**
 * Widget Registry
 *
 * Central registry for all dashboard widgets.
 * Each widget is configurable, draggable, and can be shown/hidden.
 */

import React from 'react';
import { LayoutDashboard, TrendingUp, Calendar, Activity, Users, BarChart3 } from 'lucide-react';

export interface Widget {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  component: React.LazyExoticComponent<React.ComponentType<any>> | React.ComponentType<any>;
  defaultSize: {
    w: number;
    h: number;
  };
  minSize: {
    w: number;
    h: number;
  };
  maxSize?: {
    w: number;
    h: number;
  };
  category: 'stats' | 'charts' | 'lists' | 'activity';
  requiresData?: boolean;
  refreshInterval?: number;
}

export interface WidgetLayout {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  visible: boolean;
}

/**
 * Widget Registry
 * Note: Components are imported dynamically to enable code splitting
 */
export const widgetRegistry: Record<string, Omit<Widget, 'component'> & { componentPath: string }> = {
  stats: {
    id: 'stats',
    name: 'Statistics Cards',
    description: 'Overview of key metrics (Total Patients, Appointments, Revenue)',
    icon: LayoutDashboard,
    componentPath: '../components/DashboardStatsCards',
    defaultSize: { w: 12, h: 1 },
    minSize: { w: 6, h: 1 },
    maxSize: { w: 12, h: 1 },
    category: 'stats',
    requiresData: true,
    refreshInterval: 30000
  },

  patientGrowth: {
    id: 'patientGrowth',
    name: 'Patient Growth Chart',
    description: 'Line chart showing patient growth over time',
    icon: TrendingUp,
    componentPath: '../components/PatientGrowthChart',
    defaultSize: { w: 8, h: 2 },
    minSize: { w: 6, h: 2 },
    maxSize: { w: 12, h: 3 },
    category: 'charts',
    requiresData: true
  },

  appointmentDistribution: {
    id: 'appointmentDistribution',
    name: 'Appointments Distribution',
    description: 'Pie chart showing appointment types breakdown',
    icon: BarChart3,
    componentPath: '../components/AppointmentDistributionChart',
    defaultSize: { w: 6, h: 2 },
    minSize: { w: 4, h: 2 },
    maxSize: { w: 8, h: 3 },
    category: 'charts',
    requiresData: true
  },

  upcomingAppointments: {
    id: 'upcomingAppointments',
    name: 'Upcoming Appointments',
    description: 'List of today\'s scheduled appointments',
    icon: Calendar,
    componentPath: '../components/ModernDashboard/UpcomingAppointments',
    defaultSize: { w: 6, h: 2 },
    minSize: { w: 4, h: 2 },
    maxSize: { w: 8, h: 4 },
    category: 'lists',
    requiresData: true,
    refreshInterval: 60000
  },

  recentActivity: {
    id: 'recentActivity',
    name: 'Recent Activity',
    description: 'Latest system activities and updates',
    icon: Activity,
    componentPath: '../components/ModernDashboard/RecentActivity',
    defaultSize: { w: 4, h: 2 },
    minSize: { w: 3, h: 2 },
    maxSize: { w: 6, h: 4 },
    category: 'activity',
    requiresData: true,
    refreshInterval: 30000
  }
};

/**
 * Default dashboard layout
 */
export const DEFAULT_LAYOUT: WidgetLayout[] = [
  { id: 'stats', x: 0, y: 0, w: 12, h: 1, visible: true },
  { id: 'patientGrowth', x: 0, y: 1, w: 8, h: 2, visible: true },
  { id: 'recentActivity', x: 8, y: 1, w: 4, h: 2, visible: true },
  { id: 'appointmentDistribution', x: 0, y: 3, w: 6, h: 2, visible: true },
  { id: 'upcomingAppointments', x: 6, y: 3, w: 6, h: 2, visible: true }
];

/**
 * Get widget by ID
 */
export const getWidgetById = (id: string) => {
  return widgetRegistry[id];
};

/**
 * Get all widgets
 */
export const getAllWidgets = () => {
  return Object.values(widgetRegistry);
};

/**
 * Get widgets by category
 */
export const getWidgetsByCategory = (category: Widget['category']) => {
  return Object.values(widgetRegistry).filter(w => w.category === category);
};

/**
 * Widget categories metadata
 */
export const widgetCategories = [
  {
    id: 'stats',
    name: 'Statistics',
    description: 'Key metrics and numbers',
    icon: LayoutDashboard
  },
  {
    id: 'charts',
    name: 'Charts',
    description: 'Visual data representations',
    icon: TrendingUp
  },
  {
    id: 'lists',
    name: 'Lists',
    description: 'Data tables and lists',
    icon: Users
  },
  {
    id: 'activity',
    name: 'Activity',
    description: 'Recent events and updates',
    icon: Activity
  }
] as const;

export default widgetRegistry;
