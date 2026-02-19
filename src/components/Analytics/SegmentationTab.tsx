import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, RadialBarChart, RadialBar } from 'recharts';
import { Users, TrendingUp, TrendingDown, Target, Filter, Sparkles, Activity, Minus, AlertCircle } from 'lucide-react';
import ExportButton from '../Common/ExportButton';
import { useDynamicAnalytics, usePathologiesDistribution } from '../../hooks/useAnalyticsData';

interface SegmentationTabProps {
  filters: any;
}

const SegmentationTab: React.FC<SegmentationTabProps> = ({ filters }) => {
  const { data: dynamicData } = useDynamicAnalytics(filters);
  const { data: pathologiesData } = usePathologiesDistribution();

  const defaultSegmentation = {
    ageGroups: [] as { range: string; patients: number; percentage: number; growth: string }[],
    genderDistribution: [] as { name: string; value: number; count: number }[],
    riskLevels: [] as { level: string; patients: number; percentage: number }[],
    pathologySegments: [] as { pathology: string; patients: number; percentage: number; priority: 'Haute' | 'Moyenne' | 'Basse'; trend: 'up' | 'down' | 'stable' }[],
    totalPatients: 0,
    monthlyGrowth: 0,
  };

  const segmentData = useMemo(() => {
    if (!dynamicData?.segmentation) return defaultSegmentation;

    const seg = dynamicData.segmentation;
    const totalPatients = dynamicData.meta?.dataPoints?.totalPatients || 0;

    // Map byAge → ageGroups
    const ageGroups = seg.byAge.map((a) => ({
      range: a.range,
      patients: a.count,
      percentage: a.percentage,
      growth: `${a.growth >= 0 ? '+' : ''}${a.growth}%`,
    }));

    // Map byGender → genderDistribution
    const genderDistribution = seg.byGender.map((g) => ({
      name: g.gender === 'M' ? 'Hommes' : g.gender === 'F' ? 'Femmes' : g.gender,
      value: g.percentage,
      count: g.count,
    }));

    // Map byRisk → riskLevels
    const riskLevelMap: Record<string, string> = { low: 'Faible', medium: 'Modéré', high: 'Élevé' };
    const riskLevels = seg.byRisk.map((r) => ({
      level: riskLevelMap[r.level] || r.level,
      patients: r.count,
      percentage: r.percentage,
    }));

    // Map pathologies
    const pathologySegments = (pathologiesData || []).map((p) => ({
      pathology: p.pathologie,
      patients: p.count,
      percentage: p.pourcentage,
      priority: p.pourcentage > 20 ? 'Haute' as const : p.pourcentage > 10 ? 'Moyenne' as const : 'Basse' as const,
      trend: 'stable' as const,
    }));

    // Compute monthly growth from departmentStats if available
    const monthlyGrowth = dynamicData.departmentStats?.length > 0
      ? Math.round(dynamicData.departmentStats.reduce((sum, d) => sum + d.growth, 0) / dynamicData.departmentStats.length * 10) / 10
      : 0;

    return {
      ageGroups,
      genderDistribution,
      riskLevels,
      pathologySegments,
      totalPatients,
      monthlyGrowth,
    };
  }, [dynamicData, pathologiesData]);

  const ageSegments = useMemo(() => {
    return segmentData.ageGroups.map((group, index) => ({
      ...group,
      fill: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][index % 5]
    }));
  }, [segmentData]);

  const genderSegments = useMemo(() => {
    return segmentData.genderDistribution.map((item, index) => ({
      ...item,
      fill: ['#8b5cf6', '#3b82f6', '#64748b'][index % 3]
    }));
  }, [segmentData]);

  const riskSegments = useMemo(() => {
    return segmentData.riskLevels.map((item) => ({
      ...item,
      fill: item.level === 'Faible' ? '#10b981' : item.level === 'Modéré' ? '#f59e0b' : '#ef4444'
    }));
  }, [segmentData]);

  const pathologySegments = useMemo(() => {
    return segmentData.pathologySegments;
  }, [segmentData]);

  // Données pour export
  const exportData = useMemo(() => [
    ...ageSegments.map(s => ({ Segment: 'Âge', Range: s.range, Patients: s.patients, Pourcentage: s.percentage, Croissance: s.growth })),
    ...genderSegments.map(s => ({ Segment: 'Genre', Range: s.name, Patients: s.count, Pourcentage: s.value, Croissance: 'N/A' })),
    ...riskSegments.map(s => ({ Segment: 'Risque', Range: s.level, Patients: s.patients, Pourcentage: s.percentage, Croissance: 'N/A' })),
  ], [ageSegments, genderSegments, riskSegments]);

  // Segment principal
  const mainSegment = useMemo(() => {
    if (ageSegments.length === 0) return { range: '—', percentage: 0, patients: 0, growth: '0%', fill: '#3b82f6' };
    return ageSegments.reduce((prev, current) =>
      (prev.percentage > current.percentage) ? prev : current
    );
  }, [ageSegments]);

  // Données pour le graphique radial
  const riskRadialData = useMemo(() =>
    riskSegments.map(r => ({
      name: r.level,
      value: r.percentage,
      fill: r.fill
    })), [riskSegments]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp size={14} className="text-emerald-500" />;
      case 'down': return <TrendingDown size={14} className="text-red-500" />;
      default: return <Minus size={14} className="text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold theme-text-primary">Segmentation des Patients</h2>
          <p className="theme-text-muted text-sm mt-1">Analyse démographique et médicale</p>
        </div>
        <ExportButton
          data={exportData}
          filename="segmentation-patients"
          title="Exporter"
          metadata={{ section: 'Segmentation', type: 'analytics' }}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[var(--bg-secondary)] rounded-xl p-5 border border-[var(--border-color)] shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <Users size={20} className="text-white" />
            </div>
            <h3 className="theme-text-secondary text-sm font-medium">Total Patients</h3>
          </div>
          <p className="text-3xl font-bold theme-text-primary">{segmentData.totalPatients.toLocaleString()}</p>
          <p className="text-sm text-emerald-500 mt-1 flex items-center gap-1">
            <TrendingUp size={14} />
            +{segmentData.monthlyGrowth}% vs mois dernier
          </p>
        </div>

        <div className="bg-[var(--bg-secondary)] rounded-xl p-5 border border-[var(--border-color)] shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
              <Target size={20} className="text-white" />
            </div>
            <h3 className="theme-text-secondary text-sm font-medium">Segments Actifs</h3>
          </div>
          <p className="text-3xl font-bold theme-text-primary">12</p>
          <p className="text-sm theme-text-muted mt-1">Groupes démographiques</p>
        </div>

        <div className="bg-[var(--bg-secondary)] rounded-xl p-5 border border-[var(--border-color)] shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
              <Activity size={20} className="text-white" />
            </div>
            <h3 className="theme-text-secondary text-sm font-medium">Segment Principal</h3>
          </div>
          <p className="text-3xl font-bold theme-text-primary">{mainSegment.range}</p>
          <p className="text-sm text-purple-500 mt-1">{mainSegment.percentage}% des patients</p>
        </div>

        <div className="bg-[var(--bg-secondary)] rounded-xl p-5 border border-[var(--border-color)] shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg">
              <AlertCircle size={20} className="text-white" />
            </div>
            <h3 className="theme-text-secondary text-sm font-medium">Risque Élevé</h3>
          </div>
          <p className="text-3xl font-bold theme-text-primary">{riskSegments.find(r => r.level === 'Élevé')?.patients || 0}</p>
          <p className="text-sm text-red-500 mt-1">Surveillance requise</p>
        </div>
      </div>

      {/* Graphiques Age et Genre */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Segmentation par Âge */}
        <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
            <h3 className="text-lg font-semibold theme-text-primary mb-1">Segmentation par Âge</h3>
            <p className="text-sm theme-text-muted">Distribution et croissance par tranche d'âge</p>
          </div>

          <div className="p-5">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={ageSegments} barSize={40}>
                <defs>
                  {ageSegments.map((entry, index) => (
                    <linearGradient key={`seg-age-gradient-${index}`} id={`segAgeGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={entry.fill} stopOpacity={1}/>
                      <stop offset="100%" stopColor={entry.fill} stopOpacity={0.6}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="range" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                <YAxis stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    color: 'var(--text-primary)'
                  }}
                  formatter={(value: number) => [`${value} patients`, 'Patients']}
                />
                <Bar dataKey="patients" radius={[8, 8, 0, 0]}>
                  {ageSegments.map((entry, index) => (
                    <Cell key={`seg-age-cell-${index}`} fill={`url(#segAgeGradient${index})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-4 grid grid-cols-5 gap-2">
              {ageSegments.map((segment, index) => (
                <div key={index} className="text-center p-3 bg-[var(--bg-primary)] rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors">
                  <p className="text-xs theme-text-muted mb-1">{segment.range}</p>
                  <p className="text-sm font-bold theme-text-primary">{segment.percentage}%</p>
                  <p className="text-xs text-emerald-500 mt-1">{segment.growth}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Segmentation par Genre */}
        <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
            <h3 className="text-lg font-semibold theme-text-primary mb-1">Segmentation par Genre</h3>
            <p className="text-sm theme-text-muted">Répartition démographique</p>
          </div>

          <div className="p-5">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <defs>
                  {genderSegments.map((entry, index) => (
                    <linearGradient key={`seg-gender-gradient-${index}`} id={`segGenderGradient${index}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={entry.fill} stopOpacity={1}/>
                      <stop offset="100%" stopColor={entry.fill} stopOpacity={0.7}/>
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={genderSegments}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                  labelLine={false}
                >
                  {genderSegments.map((entry, index) => (
                    <Cell key={`seg-gender-cell-${index}`} fill={`url(#segGenderGradient${index})`} stroke="var(--bg-secondary)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    color: 'var(--text-primary)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-2">
              {genderSegments.map((segment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-[var(--bg-primary)] rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.fill }} />
                    <span className="theme-text-secondary text-sm font-medium">{segment.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="theme-text-primary font-semibold">{segment.count.toLocaleString()}</p>
                    <p className="text-xs theme-text-muted">{segment.value}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Segmentation par Risque */}
      <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
          <h3 className="text-lg font-semibold theme-text-primary mb-1">Segmentation par Niveau de Risque</h3>
          <p className="text-sm theme-text-muted">Classification des patients selon le niveau de risque médical</p>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {riskSegments.map((segment, index) => (
              <div
                key={index}
                className={`p-5 rounded-xl border-2 transition-all hover:shadow-lg bg-[var(--bg-secondary)] ${
                  segment.level === 'Faible' ? 'border-emerald-500/30' :
                  segment.level === 'Modéré' ? 'border-amber-500/30' :
                  'border-red-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className={`font-semibold ${
                    segment.level === 'Faible' ? 'text-emerald-500' :
                    segment.level === 'Modéré' ? 'text-amber-500' :
                    'text-red-500'
                  }`}>{segment.level}</h4>
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: segment.fill }} />
                </div>
                <p className="text-4xl font-bold theme-text-primary mb-1">{segment.patients.toLocaleString()}</p>
                <p className="text-sm theme-text-muted mb-4">patients</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="theme-text-muted">Pourcentage</span>
                    <span className="font-semibold" style={{ color: segment.fill }}>{segment.percentage}%</span>
                  </div>
                  <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${segment.percentage}%`, backgroundColor: segment.fill }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Segmentation par Pathologie */}
      <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
          <h3 className="text-lg font-semibold theme-text-primary mb-1">Segmentation par Pathologie</h3>
          <p className="text-sm theme-text-muted">Classification par type de condition médicale</p>
        </div>

        <div className="p-5 space-y-3">
          {pathologySegments.map((segment, index) => {
            const progressWidth = segmentData.totalPatients > 0 ? (segment.patients / segmentData.totalPatients) * 100 : 0;
            return (
              <div
                key={index}
                className="p-4 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)] hover:border-indigo-500/30 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="theme-text-primary font-semibold mb-1">{segment.pathology}</h4>
                    <p className="text-sm theme-text-muted">{segment.patients.toLocaleString()} patients</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                      segment.priority === 'Haute' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                      segment.priority === 'Moyenne' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    }`}>
                      Priorité {segment.priority}
                    </span>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                      segment.trend === 'up' ? 'bg-emerald-500/10 text-emerald-500' :
                      segment.trend === 'down' ? 'bg-red-500/10 text-red-500' :
                      'bg-[var(--bg-tertiary)] theme-text-secondary'
                    }`}>
                      {getTrendIcon(segment.trend)}
                      {segment.trend === 'up' ? 'En hausse' : segment.trend === 'down' ? 'En baisse' : 'Stable'}
                    </div>
                  </div>
                </div>
                <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${progressWidth}%` }}
                  />
                </div>
                <div className="mt-2 text-xs theme-text-muted text-right">{progressWidth.toFixed(1)}% du total</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommandations */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl -ml-24 -mb-24" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Sparkles size={24} className="text-yellow-300" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Recommandations IA</h3>
              <p className="text-sm text-white/80">Actions stratégiques basées sur l'analyse</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <p className="text-yellow-300 font-semibold mb-2">Segment {mainSegment.range}</p>
              <p className="text-sm text-white/90">Segment le plus important ({mainSegment.percentage}%). Développer des programmes de prévention ciblés pour maintenir l'engagement.</p>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <p className="text-emerald-300 font-semibold mb-2">Croissance 19-35 ans</p>
              <p className="text-sm text-white/90">Forte croissance détectée. Opportunité d'expansion des services de télémédecine pour ce groupe.</p>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <p className="text-orange-300 font-semibold mb-2">Patients à risque élevé</p>
              <p className="text-sm text-white/90">{riskSegments.find(r => r.level === 'Élevé')?.percentage}% nécessitent un suivi intensif. Allouer des ressources supplémentaires.</p>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <p className="text-pink-300 font-semibold mb-2">Équilibre des genres</p>
              <p className="text-sm text-white/90">{genderSegments[0]?.value}% {genderSegments[0]?.name.toLowerCase()}, {genderSegments[1]?.value}% {genderSegments[1]?.name.toLowerCase()}. Adapter la communication.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SegmentationTab;
