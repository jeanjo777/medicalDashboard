import React, { useState, useEffect, useMemo } from 'react';
import MedicalSidebarRefined from '../components/MedicalSidebarRefined';
import DemoModeToggle, { DemoModeBanner } from '../components/Common/DemoModeToggle';
import { useDemoMode } from '../hooks/useDemoMode';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Activity,
  Heart,
  Download,
  Filter,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  BarChart3,
  PieChart,
  LineChart as LineChartIcon,
  Stethoscope,
  Clock,
  UserCheck,
  Zap,
  Target,
  Star,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import { supabase } from '../lib/supabase';
import logger from '../utils/logger';

type TimePeriod = 'day' | 'week' | 'month' | 'year';

const AnalyticsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('statistics');
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('year');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, [timePeriod]);

  const timePeriodOptions = [
    { value: 'day', label: "Aujourd'hui" },
    { value: 'week', label: 'Semaine' },
    { value: 'month', label: 'Mois' },
    { value: 'year', label: 'Année' },
  ];

  const patientGrowthData = [
    { month: 'Jan', patients: 145, consultations: 89 },
    { month: 'Fév', patients: 168, consultations: 102 },
    { month: 'Mar', patients: 192, consultations: 118 },
    { month: 'Avr', patients: 215, consultations: 134 },
    { month: 'Mai', patients: 248, consultations: 156 },
    { month: 'Jun', patients: 276, consultations: 178 },
    { month: 'Jul', patients: 312, consultations: 201 },
    { month: 'Aoû', patients: 345, consultations: 225 },
    { month: 'Sep', patients: 382, consultations: 248 },
    { month: 'Oct', patients: 421, consultations: 276 },
    { month: 'Nov', patients: 458, consultations: 302 },
    { month: 'Déc', patients: 502, consultations: 334 },
  ];

  const appointmentStatusData = [
    { name: 'Terminés', value: 342, color: '#10b981' },
    { name: 'Actifs', value: 156, color: '#3b82f6' },
    { name: 'En attente', value: 89, color: '#f59e0b' },
    { name: 'Annulés', value: 34, color: '#ef4444' },
  ];

  const weeklyActivityData = [
    { day: 'Lun', consultations: 42, urgences: 5 },
    { day: 'Mar', consultations: 38, urgences: 8 },
    { day: 'Mer', consultations: 45, urgences: 3 },
    { day: 'Jeu', consultations: 50, urgences: 7 },
    { day: 'Ven', consultations: 36, urgences: 4 },
    { day: 'Sam', consultations: 15, urgences: 12 },
    { day: 'Dim', consultations: 8, urgences: 9 },
  ];

  const topConditions = [
    { name: 'Hypertension artérielle', count: 142, percentage: 28.3, trend: 5.2, color: '#ef4444', icon: Heart },
    { name: 'Diabète type 2', count: 118, percentage: 23.5, trend: 3.8, color: '#f59e0b', icon: Activity },
    { name: 'Asthme', count: 89, percentage: 17.7, trend: -1.2, color: '#3b82f6', icon: Zap },
    { name: 'Cardiopathie', count: 76, percentage: 15.1, trend: 2.4, color: '#ec4899', icon: Heart },
    { name: 'Arthrite', count: 54, percentage: 10.8, trend: 1.8, color: '#8b5cf6', icon: ShieldCheck },
    { name: 'Migraine chronique', count: 23, percentage: 4.6, trend: -0.5, color: '#06b6d4', icon: Zap },
  ];

  const performanceMetrics = [
    { metric: 'Nouveaux patients', change: 12.5, value: '+63', period: 'Cette semaine', icon: Users, color: 'blue' },
    { metric: 'Taux de consultation', change: 8.3, value: '94.2%', period: 'Ce mois', icon: Stethoscope, color: 'emerald' },
    { metric: 'Taux de guérison', change: 5.7, value: '87.5%', period: 'Ce mois', icon: ShieldCheck, color: 'green' },
    { metric: "Temps d'attente moyen", change: -15.2, value: '-8 min', period: 'Cette semaine', icon: Clock, color: 'amber' },
    { metric: 'Satisfaction patients', change: 4.1, value: '4.8/5', period: 'Ce mois', icon: Star, color: 'purple' },
    { metric: 'Taux de suivi', change: 6.8, value: '92.3%', period: 'Cette semaine', icon: Target, color: 'cyan' },
  ];

  const satisfactionData = [
    { name: 'Score', value: 96, fill: '#3b82f6' },
  ];

  const conditionDistributionData = [
    { name: 'Hypertension', value: 28, color: '#ef4444' },
    { name: 'Diabète', value: 22, color: '#f59e0b' },
    { name: 'Asthme', value: 16, color: '#3b82f6' },
    { name: 'Cardiopathie', value: 14, color: '#ec4899' },
    { name: 'Arthrite', value: 12, color: '#8b5cf6' },
    { name: 'Autres', value: 8, color: '#06b6d4' },
  ];

  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#06b6d4'];

  const stats = [
    {
      label: 'Total Patients',
      value: '502',
      change: 12.5,
      icon: Users,
      gradient: 'from-blue-500 to-indigo-600',
      shadow: 'shadow-blue-500/20',
    },
    {
      label: 'Consultations',
      value: '334',
      change: 8.3,
      icon: Stethoscope,
      gradient: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/20',
    },
    {
      label: 'Taux de Guérison',
      value: '87.5%',
      change: 5.7,
      icon: Heart,
      gradient: 'from-rose-500 to-pink-600',
      shadow: 'shadow-rose-500/20',
    },
    {
      label: 'Satisfaction',
      value: '4.8/5',
      change: 4.1,
      icon: Star,
      gradient: 'from-violet-500 to-purple-600',
      shadow: 'shadow-violet-500/20',
    },
  ];

  const tooltipStyle = {
    backgroundColor: '#1e293b',
    border: '1px solid #475569',
    borderRadius: '12px',
    color: '#fff',
    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
    padding: '10px 14px',
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    logger.info(`Exporting analytics as ${format.toUpperCase()}`);
  };

  return (
    <div className="flex min-h-screen bg-[#0f172a]">
      <MedicalSidebarRefined activeItem={activeSection} onItemClick={setActiveSection} onCollapsedChange={setSidebarCollapsed} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Header */}
        <header className="bg-[#1e293b]/95 backdrop-blur-lg border-b border-[#334155] px-3 sm:px-4 lg:px-8 py-3 sm:py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 lg:ml-0 ml-14">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white flex items-center gap-2">
                <BarChart3 className="text-violet-500" size={24} />
                Statistiques & Analyses
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm mt-0.5 sm:mt-1 truncate">
                Vue d'ensemble des performances médicales
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <DemoModeToggle isDemoMode={isDemoMode} onToggle={toggleDemoMode} size="sm" />
            </div>
          </div>
        </header>

        <DemoModeBanner isDemoMode={isDemoMode} onDisable={toggleDemoMode} />

        <main className="flex-1 p-3 sm:p-4 lg:p-6 xl:p-8 overflow-auto">
          <div className="space-y-4 sm:space-y-5 lg:space-y-6 max-w-[1600px] mx-auto">

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className={`group bg-[#1e293b] rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-[#334155] hover:border-[#475569] transition-all duration-300 hover:shadow-xl ${stat.shadow}`}
                  >
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon size={20} className="text-white sm:w-6 sm:h-6" />
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${
                        stat.change >= 0
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-red-500/15 text-red-400'
                      }`}>
                        {stat.change >= 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                        {Math.abs(stat.change)}%
                      </div>
                    </div>
                    <p className="text-gray-400 text-xs sm:text-sm font-medium mb-0.5 sm:mb-1">{stat.label}</p>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{stat.value}</h3>
                  </div>
                );
              })}
            </div>

            {/* Filters Bar */}
            <div className="bg-[#1e293b] rounded-xl sm:rounded-2xl border border-[#334155] p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                  <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-3 py-2 bg-[#0f172a] hover:bg-[#334155] text-gray-300 rounded-lg transition-colors text-xs sm:text-sm border border-[#334155] flex-shrink-0 cursor-pointer"
                  >
                    <Filter size={14} />
                    <span className="hidden sm:inline">Filtres</span>
                    <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </button>

                  {timePeriodOptions.map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => setTimePeriod(option.value as TimePeriod)}
                      className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex-shrink-0 cursor-pointer ${
                        timePeriod === option.value
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/25'
                          : 'bg-[#0f172a] text-gray-400 hover:text-white hover:bg-[#334155]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleExport('csv')}
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#0f172a] hover:bg-[#334155] text-gray-300 rounded-lg transition-colors text-xs sm:text-sm border border-[#334155] cursor-pointer"
                  >
                    <Download size={14} />
                    <span className="hidden sm:inline">CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport('pdf')}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-lg transition-colors text-xs sm:text-sm font-medium shadow-lg shadow-violet-600/25 cursor-pointer"
                  >
                    <Download size={14} />
                    <span className="hidden sm:inline">PDF</span>
                  </button>
                </div>
              </div>

              {showFilters && (
                <div className="mt-3 pt-3 border-t border-[#334155] grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wider">Département</label>
                    <select
                      aria-label="Département"
                      className="w-full px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-sm text-gray-300 focus:outline-none focus:border-violet-500 cursor-pointer"
                    >
                      <option>Tous les départements</option>
                      <option>Cardiologie</option>
                      <option>Neurologie</option>
                      <option>Orthopédie</option>
                      <option>Pédiatrie</option>
                      <option>Médecine Générale</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wider">Spécialité</label>
                    <select
                      aria-label="Spécialité"
                      className="w-full px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-sm text-gray-300 focus:outline-none focus:border-violet-500 cursor-pointer"
                    >
                      <option>Toutes les spécialités</option>
                      <option>Médecine interne</option>
                      <option>Chirurgie</option>
                      <option>Urgences</option>
                      <option>Radiologie</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Charts Row 1: Growth + Appointments Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              {/* Patient Growth - takes 2 cols */}
              <div className="lg:col-span-2 bg-[#1e293b] rounded-xl sm:rounded-2xl border border-[#334155] p-4 sm:p-5 lg:p-6 hover:border-[#475569] transition-all">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
                        <LineChartIcon size={16} className="text-blue-400" />
                      </div>
                      Croissance des Patients
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 ml-10">Évolution mensuelle patients et consultations</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={patientGrowthData}>
                    <defs>
                      <linearGradient id="gradPatients" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradConsultations" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '11px' }} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" style={{ fontSize: '11px' }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                    <Area type="monotone" dataKey="patients" name="Patients" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#gradPatients)" dot={false} activeDot={{ r: 5, strokeWidth: 2 }} />
                    <Area type="monotone" dataKey="consultations" name="Consultations" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#gradConsultations)" dot={false} activeDot={{ r: 5, strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Appointments by Status - 1 col */}
              <div className="bg-[#1e293b] rounded-xl sm:rounded-2xl border border-[#334155] p-4 sm:p-5 lg:p-6 hover:border-[#475569] transition-all">
                <div className="mb-4 sm:mb-5">
                  <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                      <PieChart size={16} className="text-emerald-400" />
                    </div>
                    Rendez-vous
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 ml-10">Répartition par statut</p>
                </div>
                <div className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={180}>
                    <RechartsPieChart>
                      <Pie data={appointmentStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" strokeWidth={0}>
                        {appointmentStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 w-full">
                    {appointmentStatusData.map((status, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: status.color }} />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-300 truncate">{status.name}</p>
                          <p className="text-[10px] text-gray-500">{status.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row 2: Weekly Activity + Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
              {/* Weekly Activity */}
              <div className="bg-[#1e293b] rounded-xl sm:rounded-2xl border border-[#334155] p-4 sm:p-5 lg:p-6 hover:border-[#475569] transition-all">
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                      <Calendar size={16} className="text-amber-400" />
                    </div>
                    Activité Hebdomadaire
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 ml-10">Consultations et urgences par jour</p>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={weeklyActivityData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="day" stroke="#64748b" style={{ fontSize: '11px' }} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" style={{ fontSize: '11px' }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                    <Bar dataKey="consultations" name="Consultations" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="urgences" name="Urgences" fill="#ef4444" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Performance Metrics */}
              <div className="bg-[#1e293b] rounded-xl sm:rounded-2xl border border-[#334155] p-4 sm:p-5 lg:p-6 hover:border-[#475569] transition-all">
                <div className="mb-4 sm:mb-5">
                  <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
                      <Activity size={16} className="text-violet-400" />
                    </div>
                    Indicateurs de Performance
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 ml-10">Métriques clés de la semaine</p>
                </div>
                <div className="space-y-2.5 sm:space-y-3">
                  {performanceMetrics.map((metric, index) => {
                    const Icon = metric.icon;
                    const colorMap: Record<string, string> = {
                      blue: 'bg-blue-500/10 text-blue-400',
                      emerald: 'bg-emerald-500/10 text-emerald-400',
                      green: 'bg-green-500/10 text-green-400',
                      amber: 'bg-amber-500/10 text-amber-400',
                      purple: 'bg-purple-500/10 text-purple-400',
                      cyan: 'bg-cyan-500/10 text-cyan-400',
                    };
                    const colorClass = colorMap[metric.color] || colorMap.blue;

                    return (
                      <div key={index} className="flex items-center justify-between p-2.5 sm:p-3 bg-[#0f172a] rounded-xl hover:bg-[#0f172a]/80 transition-colors group">
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass} group-hover:scale-105 transition-transform`}>
                            <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-white truncate">{metric.metric}</p>
                            <p className="text-[10px] sm:text-xs text-gray-500">{metric.period}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="text-sm sm:text-base font-bold text-white">{metric.value}</p>
                          <p className={`text-[10px] sm:text-xs font-semibold ${metric.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {metric.change >= 0 ? '+' : ''}{metric.change}%
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Charts Row 3: Top Conditions + Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
              {/* Top Conditions */}
              <div className="bg-[#1e293b] rounded-xl sm:rounded-2xl border border-[#334155] p-4 sm:p-5 lg:p-6 hover:border-[#475569] transition-all">
                <div className="mb-4 sm:mb-5">
                  <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/15 flex items-center justify-center">
                      <Heart size={16} className="text-rose-400" />
                    </div>
                    Pathologies Principales
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 ml-10">Conditions les plus fréquentes</p>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {topConditions.map((condition, index) => {
                    const CondIcon = condition.icon;
                    return (
                      <div key={index} className="group">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${condition.color}15` }}>
                              <CondIcon size={12} style={{ color: condition.color }} />
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-white truncate">{condition.name}</span>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                            <span className="text-xs sm:text-sm text-gray-400">{condition.count}</span>
                            <span className={`flex items-center gap-0.5 text-[10px] sm:text-xs font-semibold ${condition.trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {condition.trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                              {Math.abs(condition.trend)}%
                            </span>
                          </div>
                        </div>
                        <div className="relative w-full h-2 bg-[#0f172a] rounded-full overflow-hidden">
                          <div
                            className="absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${condition.percentage}%`, backgroundColor: condition.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Condition Distribution Chart */}
              <div className="bg-[#1e293b] rounded-xl sm:rounded-2xl border border-[#334155] p-4 sm:p-5 lg:p-6 hover:border-[#475569] transition-all">
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center">
                      <BarChart3 size={16} className="text-cyan-400" />
                    </div>
                    Répartition des Pathologies
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 ml-10">Distribution globale des conditions</p>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={conditionDistributionData} layout="vertical" barSize={16}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" stroke="#64748b" style={{ fontSize: '11px' }} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" stroke="#64748b" style={{ fontSize: '11px' }} tickLine={false} axisLine={false} width={90} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="value" name="Patients (%)" radius={[0, 8, 8, 0]}>
                      {conditionDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default AnalyticsPage;
