/**
 * Medical Radar Chart Component - UXBooster Style
 *
 * Displays medical metrics in a radar chart with tabs for:
 * - Patient Health Metrics
 * - Cabinet Performance Metrics
 */

import React, { useState } from 'react';
import { Activity, Building2 } from 'lucide-react';

interface MetricData {
  label: string;
  value: number;
  color: string;
}

interface MedicalRadarChartProps {
  patientMetrics?: MetricData[];
  cabinetMetrics?: MetricData[];
}

const defaultPatientMetrics: MetricData[] = [
  { label: 'Taux de suivi', value: 85, color: 'bg-emerald-500' },
  { label: 'Observance', value: 72, color: 'bg-emerald-500' },
  { label: 'Satisfaction', value: 91, color: 'bg-emerald-600' },
  { label: 'Urgences traitées', value: 68, color: 'bg-yellow-500' },
  { label: 'Consultations', value: 78, color: 'bg-emerald-500' },
  { label: 'Prévention', value: 65, color: 'bg-yellow-500' },
  { label: 'Récupération', value: 82, color: 'bg-emerald-500' },
];

const defaultCabinetMetrics: MetricData[] = [
  { label: 'RDV/jour', value: 88, color: 'bg-emerald-500' },
  { label: 'Temps attente', value: 45, color: 'bg-orange-500' },
  { label: 'Taux présence', value: 92, color: 'bg-emerald-600' },
  { label: 'Efficacité', value: 76, color: 'bg-emerald-500' },
  { label: 'Annulations', value: 18, color: 'bg-emerald-500' },
  { label: 'Nouveaux patients', value: 67, color: 'bg-yellow-500' },
  { label: 'Fidélisation', value: 89, color: 'bg-emerald-600' },
];

const MedicalRadarChart: React.FC<MedicalRadarChartProps> = ({
  patientMetrics = defaultPatientMetrics,
  cabinetMetrics = defaultCabinetMetrics,
}) => {
  const [activeTab, setActiveTab] = useState<'patient' | 'cabinet'>('patient');
  const metrics = activeTab === 'patient' ? patientMetrics : cabinetMetrics;

  // Calculate radar points
  const centerX = 150;
  const centerY = 150;
  const maxRadius = 120;
  const numPoints = metrics.length;

  const getPoint = (index: number, value: number) => {
    const angle = (index * 2 * Math.PI) / numPoints - Math.PI / 2;
    const radius = (value / 100) * maxRadius;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  const polygonPoints = metrics
    .map((m, i) => {
      const point = getPoint(i, m.value);
      return `${point.x},${point.y}`;
    })
    .join(' ');

  const gridCircles = [30, 60, 90, 120];

  return (
    <div className="rounded-2xl bg-[var(--bg-secondary)] p-4 sm:p-5 shadow-sm transition-colors duration-300">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-base sm:text-lg font-semibold theme-text-primary">
          Vue d'ensemble
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('patient')}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'patient'
              ? 'bg-emerald-500 text-white'
              : 'bg-[var(--bg-tertiary)] theme-text-secondary hover:bg-[var(--bg-input)]'
          }`}
        >
          <Activity className="h-3.5 w-3.5" />
          Santé Patients
        </button>
        <button
          onClick={() => setActiveTab('cabinet')}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'cabinet'
              ? 'bg-emerald-500 text-white'
              : 'bg-[var(--bg-tertiary)] theme-text-secondary hover:bg-[var(--bg-input)]'
          }`}
        >
          <Building2 className="h-3.5 w-3.5" />
          Performance Cabinet
        </button>
      </div>

      {/* Radar Chart */}
      <div className="relative mb-4 flex h-48 sm:h-56 items-center justify-center">
        <svg viewBox="0 0 300 300" className="h-full w-full">
          {/* Grid circles */}
          {gridCircles.map((r) => (
            <circle
              key={r}
              cx={centerX}
              cy={centerY}
              r={r}
              fill="none"
              stroke="var(--border-color)"
              strokeWidth="1"
            />
          ))}

          {/* Grid lines */}
          {metrics.map((_, i) => {
            const angle = (i * 2 * Math.PI) / numPoints - Math.PI / 2;
            const endX = centerX + maxRadius * Math.cos(angle);
            const endY = centerY + maxRadius * Math.sin(angle);
            return (
              <line
                key={i}
                x1={centerX}
                y1={centerY}
                x2={endX}
                y2={endY}
                stroke="var(--border-color)"
                strokeWidth="1"
              />
            );
          })}

          {/* Data polygon */}
          <polygon
            points={polygonPoints}
            fill={activeTab === 'patient' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)'}
            stroke={activeTab === 'patient' ? '#10b981' : '#3b82f6'}
            strokeWidth="2"
          />

          {/* Data points */}
          {metrics.map((m, i) => {
            const point = getPoint(i, m.value);
            return (
              <circle
                key={i}
                cx={point.x}
                cy={point.y}
                r="5"
                fill={activeTab === 'patient' ? '#10b981' : '#3b82f6'}
                className="drop-shadow-sm"
              />
            );
          })}

          {/* Labels */}
          {metrics.map((_, i) => {
            const angle = (i * 2 * Math.PI) / numPoints - Math.PI / 2;
            const labelRadius = maxRadius + 25;
            const x = centerX + labelRadius * Math.cos(angle);
            const y = centerY + labelRadius * Math.sin(angle);
            return (
              <text
                key={i}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[10px] font-medium"
                fill="var(--text-muted)"
              >
                {i + 1}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Metrics List */}
      <div className="space-y-2.5">
        {metrics.map((metric, index) => (
          <MetricRow
            key={index}
            number={String(index + 1)}
            label={metric.label}
            value={`${metric.value}%`}
            color={metric.color}
          />
        ))}
      </div>
    </div>
  );
};

interface MetricRowProps {
  number: string;
  label: string;
  value: string;
  color: string;
}

const MetricRow: React.FC<MetricRowProps> = ({ number, label, value }) => {
  const numericValue = parseInt(value);

  const getBarColor = () => {
    if (numericValue >= 80) return 'bg-emerald-500';
    if (numericValue >= 60) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <div className="flex items-center gap-2">
      <span className="w-4 text-xs font-medium theme-text-muted">{number}</span>
      <span className="flex-1 text-xs theme-text-secondary">{label}</span>
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-14 overflow-hidden rounded-full bg-[var(--bg-tertiary)]">
          <div
            className={`h-full ${getBarColor()} transition-all duration-500`}
            style={{ width: value }}
          />
        </div>
        <span className="w-9 text-right text-xs font-semibold theme-text-primary">
          {value}
        </span>
      </div>
    </div>
  );
};

export default MedicalRadarChart;
