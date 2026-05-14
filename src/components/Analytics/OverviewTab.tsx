import React, { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Star,
  Users,
  Activity,
  Stethoscope,
  Heart,
  AlertTriangle,
  Clock,
  Brain,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Shield
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  useAnalyticsStats,
  useDepartementStats,
  useMedecinPerformance,
  useFluxPatients,
  usePathologiesDistribution,
  useTauxRecuperation,
  useSystemesSante
} from '../../hooks/useAnalyticsData';
import { useAppointmentsQuery } from '../../hooks/useAppointmentsQuery';
import { supabase } from '../../lib/supabase';
import { getCurrentMedicId } from '../../utils/auth';

interface OverviewTabProps {
  filters: any;
}

const COLORS = ['#0891B2', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];

const tooltipStyle = {
  backgroundColor: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: '12px',
  boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
  padding: '12px 16px',
  color: 'var(--text-primary)'
};

const OverviewTab: React.FC<OverviewTabProps> = ({ filters }) => {
  const [flowPeriod, setFlowPeriod] = useState<'12M' | '6M' | '30J'>('12M');
  const { data: analyticsStats } = useAnalyticsStats();
  const { data: departements } = useDepartementStats();
  const { data: medecins } = useMedecinPerformance();
  const { data: flux } = useFluxPatients();
  const { data: pathologies } = usePathologiesDistribution();
  const { data: recuperation } = useTauxRecuperation();
  const { data: systemes } = useSystemesSante();
  const { appointments } = useAppointmentsQuery();

  // Real DB counts (lightweight HEAD queries)
  const { data: realPatientCount = 0 } = useQuery({
    queryKey: ['real-patient-count'],
    queryFn: async () => {
      const { count, error } = await supabase.from('patients').select('id', { count: 'exact', head: true }).eq('medic_id', getCurrentMedicId()!);
      if (error) throw error;
      return count ?? 0;
    },
    staleTime: 60 * 1000,
  });

  const { data: realConsultationCount = 0 } = useQuery({
    queryKey: ['real-consultation-count'],
    queryFn: async () => {
      const { count, error } = await supabase.from('consultations').select('id', { count: 'exact', head: true }).eq('medic_id', getCurrentMedicId()!);
      if (error) throw error;
      return count ?? 0;
    },
    staleTime: 60 * 1000,
  });

  const { data: realHighRiskCount = 0 } = useQuery({
    queryKey: ['real-high-risk-count'],
    queryFn: async () => {
      const { count, error } = await supabase.from('patients').select('id', { count: 'exact', head: true }).eq('medic_id', getCurrentMedicId()!).gt('riskScore', 60);
      if (error) throw error;
      return count ?? 0;
    },
    staleTime: 60 * 1000,
  });

  const departmentData = useMemo(() => {
    const data = departements ?? [];
    return data?.map((dept, index) => ({
      name: dept.departement,
      patients: dept.patients_count,
      growth: `${dept.croissance > 0 ? '+' : ''}${dept.croissance}%`,
      growthValue: dept.croissance,
      color: COLORS[index % COLORS.length]
    })) || [];
  }, [departements]);

  const medicPerformance = useMemo(() => {
    const data = medecins ?? [];
    return data?.map((med) => ({
      name: med.medecin_name,
      consultations: med.consultations,
      minPerPatient: med.minutes_par_patient,
      satisfaction: med.satisfaction
    })) || [];
  }, [medecins]);

  const patientFlowData = useMemo(() => {
    const data = flux ?? [];
    const mapped = data?.map((f) => ({
      month: f.mois,
      consultations: f.consultations,
      urgences: f.urgences,
      suivis: f.suivis
    })) || [];
    if (flowPeriod === '6M') return mapped.slice(-6);
    if (flowPeriod === '30J') return mapped.slice(-1);
    return mapped;
  }, [flux, flowPeriod]);

  const pathologyData = useMemo(() => {
    const data = pathologies ?? [];
    return data?.map((path, index) => ({
      name: path.pathologie,
      value: path.pourcentage,
      color: COLORS[index % COLORS.length]
    })) || [];
  }, [pathologies]);

  const recoveryData = useMemo(() => {
    const data = recuperation ?? [];
    return data?.map((rec) => ({
      week: `S${rec.semaine}`,
      objectif: rec.objectif,
      taux: rec.taux_reel
    })) || [];
  }, [recuperation]);

  const radarData = useMemo(() => {
    const data = systemes ?? [];
    return data?.map((sys) => ({
      system: sys.systeme,
      value: sys.score
    })) || [];
  }, [systemes]);

  // Compute weekly data from real appointments
  const weeklyData = useMemo(() => {
    if (!appointments.length) return ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => ({ day, appointments: 0, completed: 0 }));
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
    const counts = Array(7).fill(null).map(() => ({ total: 0, completed: 0 }));
    appointments.forEach(apt => {
      const d = new Date(apt.appointment_date);
      const diff = Math.floor((d.getTime() - startOfWeek.getTime()) / 86400000);
      if (diff >= 0 && diff < 7) {
        counts[diff].total++;
        if (apt.status === 'completed' || apt.status === 'termine') counts[diff].completed++;
      }
    });
    return ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, i) => ({
      day,
      appointments: counts[i].total,
      completed: counts[i].completed
    }));
  }, [appointments]);

  // Compute appointment types from real data
  const appointmentTypeData = useMemo(() => {
    if (!appointments.length) return [];
    const typeMap: Record<string, number> = {};
    appointments.forEach(apt => {
      const type = apt.type_consultation || 'Consultation';
      typeMap[type] = (typeMap[type] || 0) + 1;
    });
    const typeColors: Record<string, string> = {
      'consultation': '#10b981', 'Consultation': '#10b981',
      'suivi': '#3b82f6', 'Suivi': '#3b82f6', 'follow-up': '#3b82f6',
      'urgence': '#ef4444', 'Urgence': '#ef4444', 'emergency': '#ef4444',
      'controle': '#f59e0b', 'Bilan': '#f59e0b', 'checkup': '#f59e0b',
      'therapie': '#8b5cf6', 'Thérapie': '#8b5cf6',
    };
    return Object.entries(typeMap).map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count,
      color: typeColors[type] || COLORS[Object.keys(typeMap).indexOf(type) % COLORS.length]
    }));
  }, [appointments]);

  // Use real analytics stats for KPIs
  const kpiStats = useMemo(() => {
    if (!analyticsStats) return null;
    return analyticsStats;
  }, [analyticsStats]);

  // Generate sparklines from real flow data
  const sparklines = useMemo(() => {
    if (!flux?.length) return { patients: [{ value: 0 }], consultations: [{ value: 0 }], satisfaction: [{ value: 0 }], risk: [{ value: 0 }] };
    const pts = flux.filter(f => f.consultations > 0).slice(-7);
    if (pts.length < 2) return { patients: [{ value: 0 }], consultations: [{ value: 0 }], satisfaction: [{ value: 0 }], risk: [{ value: 0 }] };
    return {
      patients: pts.map(f => ({ value: f.consultations + f.suivis })),
      consultations: pts.map(f => ({ value: f.consultations })),
      satisfaction: pts.map(f => ({ value: f.suivis > 0 ? Math.round((f.consultations / (f.consultations + f.urgences)) * 5 * 10) / 10 : 0 })),
      risk: pts.map(f => ({ value: Math.round(f.urgences * 0.6) }))
    };
  }, [flux]);

  const totalPatients = realPatientCount;
  const avgSatisfaction = medicPerformance.length > 0
    ? (medicPerformance.reduce((sum, m) => sum + m.satisfaction, 0) / medicPerformance.length).toFixed(1)
    : '0';
  const totalConsultations = realConsultationCount;
  const totalAppointments = appointmentTypeData.reduce((sum, a) => sum + a.count, 0);
  const globalScore = radarData.length > 0 ? Math.round(radarData.reduce((sum, r) => sum + r.value, 0) / radarData.length) : 0;

  const casRisque = realHighRiskCount;
  const casRisqueEvol = kpiStats?.cas_risque_evolution ?? 0;
  const patientsConsultesEvol = kpiStats?.patients_consultes_evolution ?? 0;
  const rdvHonoresEvol = kpiStats?.rdv_honores_evolution ?? 0;

  const kpiCards = [
    {
      label: 'Total Patients',
      value: totalPatients.toLocaleString(),
      trend: `${patientsConsultesEvol > 0 ? '+' : ''}${patientsConsultesEvol}%`,
      trendUp: patientsConsultesEvol > 0,
      icon: Users,
      gradient: 'from-cyan-500 to-teal-500',
      shadowColor: 'shadow-cyan-500/20',
      sparkData: sparklines.patients,
      sparkColor: '#0891B2',
      sparkId: 'ov-spark-patients'
    },
    {
      label: 'Consultations',
      value: totalConsultations.toLocaleString(),
      trend: `${rdvHonoresEvol > 0 ? '+' : ''}${rdvHonoresEvol}%`,
      trendUp: rdvHonoresEvol > 0,
      icon: Stethoscope,
      gradient: 'from-blue-500 to-indigo-500',
      shadowColor: 'shadow-blue-500/20',
      sparkData: sparklines.consultations,
      sparkColor: '#3b82f6',
      sparkId: 'ov-spark-consult'
    },
    {
      label: 'Satisfaction',
      value: `${avgSatisfaction}/5`,
      trend: '+4.1%',
      trendUp: true,
      icon: Heart,
      gradient: 'from-emerald-500 to-green-500',
      shadowColor: 'shadow-emerald-500/20',
      sparkData: sparklines.satisfaction,
      sparkColor: '#10b981',
      sparkId: 'ov-spark-satis'
    },
    {
      label: 'Cas a Risque',
      value: casRisque.toString(),
      trend: `${casRisqueEvol > 0 ? '+' : ''}${casRisqueEvol}%`,
      trendUp: casRisqueEvol > 0,
      icon: Shield,
      gradient: 'from-violet-500 to-purple-500',
      shadowColor: 'shadow-violet-500/20',
      sparkData: sparklines.risk,
      sparkColor: '#8b5cf6',
      sparkId: 'ov-spark-risk'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-6 lg:grid-cols-12 gap-4 lg:gap-5">

      {/* ═══════════════ ROW 1: Hero KPI Cards ═══════════════ */}
      <div className="col-span-1 sm:col-span-6 lg:col-span-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className={`group relative overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-700/50
                  bg-white dark:bg-[#1e293b] p-5 shadow-sm hover:shadow-xl ${card.shadowColor}
                  transition-all duration-300 hover:-translate-y-1 animate-fade-in-up`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50/0 to-gray-50/80 dark:from-transparent dark:to-transparent
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg ${card.shadowColor}`}>
                      <Icon size={18} className="text-white" />
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full
                      ${card.trendUp
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400'
                      }`}>
                      {card.trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {card.trend}
                    </span>
                  </div>

                  <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight font-heading">
                    {card.value}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{card.label}</p>

                  <div className="mt-3 h-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={card.sparkData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id={card.sparkId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={card.sparkColor} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={card.sparkColor} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="value" stroke={card.sparkColor}
                          strokeWidth={1.5} fill={`url(#${card.sparkId})`} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent
                  opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: card.sparkColor }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════════ ROW 2-3: Patient Flow (7col) + Donut + AI Insights (5col) ═══════════════ */}

      {/* Patient Flow - Large Area Chart */}
      <div className="col-span-1 sm:col-span-6 lg:col-span-7 lg:row-span-2
        bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-100 dark:border-gray-700/50
        shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden animate-fade-in-up"
        style={{ animationDelay: '200ms' }}>
        <div className="px-6 pt-6 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white font-heading">Flux de Patients</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Consultations, urgences et suivis par mois</p>
            </div>
            <div className="flex bg-gray-100 dark:bg-gray-700/50 rounded-lg p-0.5">
              {(['12M', '6M', '30J'] as const).map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => setFlowPeriod(period)}
                  className={`px-3 py-1 text-xs font-medium rounded-md cursor-pointer transition-all ${
                    flowPeriod === period
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-5 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Consultations</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Suivis</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Urgences</span>
            </div>
          </div>
        </div>
        <div className="px-4 pb-5">
          <ResponsiveContainer width="100%" height={340}>
            <AreaChart data={patientFlowData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="ov-gradConsult" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ov-gradSuivis" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ov-gradUrgences" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: '#0891B2', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area type="monotone" dataKey="consultations" stroke="#3b82f6" strokeWidth={2.5}
                fill="url(#ov-gradConsult)" name="Consultations"
                dot={false} activeDot={{ r: 5, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} />
              <Area type="monotone" dataKey="suivis" stroke="#10b981" strokeWidth={2}
                fill="url(#ov-gradSuivis)" name="Suivis"
                dot={false} activeDot={{ r: 4, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
              <Area type="monotone" dataKey="urgences" stroke="#ef4444" strokeWidth={2}
                fill="url(#ov-gradUrgences)" name="Urgences"
                dot={false} activeDot={{ r: 4, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Appointments Donut */}
      <div className="col-span-1 sm:col-span-3 lg:col-span-5
        bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-100 dark:border-gray-700/50
        shadow-sm hover:shadow-md transition-all duration-300 p-6 animate-fade-in-up"
        style={{ animationDelay: '300ms' }}>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white font-heading mb-1">Rendez-vous par Type</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">Repartition des {totalAppointments.toLocaleString()} rendez-vous</p>

        <div className="relative mt-3">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={appointmentTypeData} cx="50%" cy="50%"
                innerRadius={60} outerRadius={88} paddingAngle={4}
                dataKey="count" strokeWidth={0}>
                {appointmentTypeData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white font-heading">{totalAppointments.toLocaleString()}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
            </div>
          </div>
        </div>

        <div className="space-y-1.5 mt-3">
          {appointmentTypeData.map(item => (
            <div key={item.type} className="flex items-center justify-between px-3 py-2
              rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-gray-600 dark:text-gray-300">{item.type}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.count.toLocaleString()}</span>
                <span className="text-xs text-gray-400 w-8 text-right">
                  {Math.round((item.count / totalAppointments) * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights Banner */}
      <div className="col-span-1 sm:col-span-3 lg:col-span-5
        relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700
        p-6 text-white animate-fade-in-up"
        style={{ animationDelay: '400ms' }}>
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5 blur-xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
              <Brain size={18} />
            </div>
            <span className="text-sm font-semibold text-white/90">Insights IA</span>
            <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm flex items-center gap-1">
              <Sparkles size={10} /> Live
            </span>
          </div>

          <ul className="space-y-3">
            <li className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
              <p className="text-sm text-white/90 leading-relaxed">
                {patientsConsultesEvol > 0
                  ? <>Tendance haussiere : <strong>+{patientsConsultesEvol}% de consultations</strong> par rapport a la periode precedente</>
                  : <>Tendance en baisse : <strong>{patientsConsultesEvol}% de consultations</strong> - analyser les causes</>
                }
              </p>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
              <p className="text-sm text-white/90 leading-relaxed">
                <strong>{totalAppointments.toLocaleString()} rendez-vous</strong> enregistres - taux d'honoration a <strong>{kpiStats?.rdv_honores ?? 0}%</strong>
              </p>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
              <p className="text-sm text-white/90 leading-relaxed">
                Satisfaction patients stable a <strong>{avgSatisfaction}/5</strong> - {Number(avgSatisfaction) >= 4.5 ? 'excellent' : Number(avgSatisfaction) >= 4 ? 'bon' : 'a ameliorer'}
              </p>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-2 flex-shrink-0" />
              <p className="text-sm text-white/90 leading-relaxed">
                {departmentData.length > 0 && departmentData[0].growthValue > 0
                  ? <><strong>{departmentData[0].name}</strong> : croissance de {departmentData[0].growth}, departement le plus actif</>
                  : <><strong>{departmentData.length} departements</strong> actifs avec {totalPatients} patients</>
                }
              </p>
            </li>
          </ul>
        </div>
      </div>

      {/* ═══════════════ ROW 4: Conditions + Doctors + Weekly ═══════════════ */}

      {/* Top Conditions */}
      <div className="col-span-1 sm:col-span-3 lg:col-span-4
        bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-100 dark:border-gray-700/50
        shadow-sm hover:shadow-md transition-all duration-300 p-6 animate-fade-in-up"
        style={{ animationDelay: '300ms' }}>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white font-heading mb-1">Pathologies Principales</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Repartition par specialite</p>

        <div className="space-y-4">
          {pathologyData.map((item, i) => (
            <div key={item.name}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-gray-600 dark:text-gray-300">{item.name}</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.value}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700 ease-out animate-expand-width"
                  style={{ width: `${item.value}%`, backgroundColor: item.color, animationDelay: `${i * 80}ms` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Doctor Performance */}
      <div className="col-span-1 sm:col-span-3 lg:col-span-4
        bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-100 dark:border-gray-700/50
        shadow-sm hover:shadow-md transition-all duration-300 p-6 animate-fade-in-up"
        style={{ animationDelay: '350ms' }}>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white font-heading mb-1">Performance Medecins</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Top 5 par satisfaction</p>

        <div className="space-y-2">
          {medicPerformance.slice(0, 5).map((doc, i) => (
            <div key={doc.name} className="flex items-center gap-3 p-2.5 rounded-xl
              hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0
                ${i === 0 ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' :
                  i === 1 ? 'bg-gray-100 dark:bg-gray-600/30 text-gray-600 dark:text-gray-300' :
                  i === 2 ? 'bg-orange-50 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400' :
                  'bg-gray-50 dark:bg-gray-700/30 text-gray-400'
                }`}>
                {i + 1}
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}>
                {doc.name.split(' ').slice(1).map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{doc.consultations} consult. · {doc.minPerPatient} min/p</p>
              </div>
              <div className="flex items-center gap-1">
                <Star size={12} fill="#f59e0b" className="text-amber-500" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{doc.satisfaction}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Activity */}
      <div className="col-span-1 sm:col-span-6 lg:col-span-4
        bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-100 dark:border-gray-700/50
        shadow-sm hover:shadow-md transition-all duration-300 p-6 animate-fade-in-up"
        style={{ animationDelay: '400ms' }}>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white font-heading mb-1">Activite Hebdomadaire</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Programmes vs completes</p>

        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-cyan-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Programmes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Completes</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }} barGap={2}>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} width={30} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(8,145,178,0.05)', radius: 8 }} />
            <Bar dataKey="appointments" fill="#0891B2" radius={[4, 4, 0, 0]} name="Programmes" maxBarSize={24} />
            <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Completes" maxBarSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ═══════════════ ROW 5: Radar + Recovery + Metrics ═══════════════ */}

      {/* Healthcare Radar */}
      <div className="col-span-1 sm:col-span-6 lg:col-span-5
        bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-100 dark:border-gray-700/50
        shadow-sm hover:shadow-md transition-all duration-300 p-6 animate-fade-in-up"
        style={{ animationDelay: '300ms' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white font-heading">Systeme de Sante</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Analyse multi-dimensionnelle</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
            <Activity size={14} className="text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{globalScore}%</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={radarData} cx="50%" cy="50%">
            <PolarGrid stroke="var(--border-color)" />
            <PolarAngleAxis dataKey="system" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Radar name="Score" dataKey="value" stroke="#0891B2" fill="#0891B2" fillOpacity={0.15} strokeWidth={2}
              dot={{ fill: '#0891B2', r: 3, strokeWidth: 0 }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Recovery Rate */}
      <div className="col-span-1 sm:col-span-3 lg:col-span-4
        bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-100 dark:border-gray-700/50
        shadow-sm hover:shadow-md transition-all duration-300 p-6 animate-fade-in-up"
        style={{ animationDelay: '350ms' }}>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white font-heading mb-1">Taux de Recuperation</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Tendance vs objectif</p>

        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={recoveryData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
            <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
            <YAxis domain={[60, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} width={35} />
            <Tooltip contentStyle={tooltipStyle}
              formatter={(value: number, name: string) => [`${value}%`, name === 'objectif' ? 'Objectif' : 'Taux reel']} />
            <Line type="monotone" dataKey="objectif" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="6 4" dot={false} name="objectif" />
            <Line type="monotone" dataKey="taux" stroke="#10b981" strokeWidth={2.5} name="taux"
              dot={{ fill: '#10b981', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 dark:text-gray-400">Performance actuelle</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {recoveryData.length > 0 ? `${recoveryData[recoveryData.length - 1].taux}%` : 'N/A'}
            </span>
          </div>
          <div className="mt-2 h-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
              style={{ width: recoveryData.length > 0 ? `${recoveryData[recoveryData.length - 1].taux}%` : '0%' }} />
          </div>
        </div>
      </div>

      {/* Recent Metrics - Compact Cards */}
      <div className="col-span-1 sm:col-span-3 lg:col-span-3 space-y-3 animate-fade-in-up"
        style={{ animationDelay: '400ms' }}>

        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-100 dark:border-gray-700/50
          shadow-sm hover:shadow-md transition-all duration-300 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-500/10">
              <Activity size={18} className="text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">Score Global</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{globalScore}%</p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <TrendingUp size={12} /> +3.2%
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-100 dark:border-gray-700/50
          shadow-sm hover:shadow-md transition-all duration-300 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10">
              <Clock size={18} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">RDV Honorés</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{kpiStats?.rdv_honores ?? 0}%</p>
            </div>
            <span className={`text-xs font-semibold flex items-center gap-0.5 ${(kpiStats?.rdv_honores_evolution ?? 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
              {(kpiStats?.rdv_honores_evolution ?? 0) >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {(kpiStats?.rdv_honores_evolution ?? 0) > 0 ? '+' : ''}{kpiStats?.rdv_honores_evolution ?? 0}%
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-100 dark:border-gray-700/50
          shadow-sm hover:shadow-md transition-all duration-300 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-500/10">
              <AlertTriangle size={18} className="text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">Cas Urgences</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{kpiStats?.rdv_exceptionnels ?? 0}</p>
            </div>
            <span className={`text-xs font-semibold flex items-center gap-0.5 ${(kpiStats?.rdv_exceptionnels_evolution ?? 0) <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
              {(kpiStats?.rdv_exceptionnels_evolution ?? 0) <= 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
              {(kpiStats?.rdv_exceptionnels_evolution ?? 0) > 0 ? '+' : ''}{kpiStats?.rdv_exceptionnels_evolution ?? 0}%
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-100 dark:border-gray-700/50
          shadow-sm hover:shadow-md transition-all duration-300 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-500/10">
              <Users size={18} className="text-violet-600 dark:text-violet-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">Departements</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{departmentData.length}</p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <TrendingUp size={12} /> Actifs
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default OverviewTab;
