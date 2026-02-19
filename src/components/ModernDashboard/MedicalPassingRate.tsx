/**
 * Medical Passing Rate - UXBooster Style
 *
 * Displays appointment/consultation completion rates
 */

import React from 'react';
import { FileText } from 'lucide-react';

interface MedicalPassingRateProps {
  complete: number;
  cancelled: number;
  pending: number;
  title?: string;
}

const MedicalPassingRate: React.FC<MedicalPassingRateProps> = ({
  complete = 72,
  cancelled = 12,
  pending = 16,
  title = "Taux de consultations",
}) => {
  return (
    <div className="rounded-2xl bg-[var(--bg-secondary)] p-4 shadow-sm transition-colors duration-300">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold theme-text-primary">{title}</h2>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg">
          <FileText className="h-3.5 w-3.5 theme-text-muted" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1 sm:gap-2 text-center">
        <div>
          <div className="mb-1 text-[10px] sm:text-xs theme-text-muted">Effectuées</div>
          <div className="text-lg sm:text-2xl font-bold theme-text-primary">{complete}%</div>
        </div>
        <div>
          <div className="mb-1 text-[10px] sm:text-xs theme-text-muted">Annulées</div>
          <div className="text-lg sm:text-2xl font-bold theme-text-primary">{cancelled}%</div>
        </div>
        <div>
          <div className="mb-1 text-[10px] sm:text-xs theme-text-muted">En attente</div>
          <div className="text-lg sm:text-2xl font-bold theme-text-primary">{pending}%</div>
        </div>
      </div>

      <div className="mt-4 flex h-2.5 overflow-hidden rounded-full">
        <div
          className="bg-emerald-500 transition-all duration-500"
          style={{ width: `${complete}%` }}
        />
        <div
          className="bg-orange-500 transition-all duration-500"
          style={{ width: `${cancelled}%` }}
        />
        <div
          className="bg-[var(--bg-tertiary)] transition-all duration-500"
          style={{ width: `${pending}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs flex-wrap">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="theme-text-secondary">Effectuées</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-orange-500" />
          <span className="theme-text-secondary">Annulées</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-[var(--bg-tertiary)]" />
          <span className="theme-text-secondary">En attente</span>
        </div>
      </div>
    </div>
  );
};

export default MedicalPassingRate;
