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
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
          <FileText className="h-3.5 w-3.5 text-gray-500" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="mb-1 text-[10px] text-gray-500">Effectuées</div>
          <div className="text-2xl font-bold text-gray-900">{complete}%</div>
        </div>
        <div>
          <div className="mb-1 text-[10px] text-gray-500">Annulées</div>
          <div className="text-2xl font-bold text-gray-900">{cancelled}%</div>
        </div>
        <div>
          <div className="mb-1 text-[10px] text-gray-500">En attente</div>
          <div className="text-2xl font-bold text-gray-900">{pending}%</div>
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
          className="bg-gray-300 transition-all duration-500"
          style={{ width: `${pending}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-center gap-4 text-[10px]">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-gray-600">Effectuées</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-orange-500" />
          <span className="text-gray-600">Annulées</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-gray-300" />
          <span className="text-gray-600">En attente</span>
        </div>
      </div>
    </div>
  );
};

export default MedicalPassingRate;
