/**
 * Medical Upgrade Card - UXBooster Style
 *
 * Promotional card for premium medical features
 */

import React from 'react';
import { Stethoscope, Sparkles } from 'lucide-react';

interface MedicalUpgradeCardProps {
  onUpgrade?: () => void;
}

const MedicalUpgradeCard: React.FC<MedicalUpgradeCardProps> = ({ onUpgrade }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 text-white shadow-lg">
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5" />
          <span className="text-xs font-medium opacity-90">Fonctionnalités Pro</span>
        </div>
        <h3 className="mb-1 text-xl sm:text-2xl font-bold">IA Médicale</h3>
        <p className="mb-4 text-sm opacity-90">
          Diagnostics assistés, prédictions et alertes intelligentes
        </p>
        <button
          onClick={onUpgrade}
          className="rounded-full bg-white px-5 py-2 text-xs font-semibold text-emerald-600 transition-all hover:scale-105 hover:shadow-md"
        >
          Découvrir
        </button>
      </div>

      {/* Decorative elements */}
      <div className="absolute -right-8 -bottom-4 opacity-20">
        <Stethoscope className="h-32 w-32" />
      </div>
      <div className="absolute right-16 top-4 opacity-30">
        <svg width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="25" fill="white" fillOpacity="0.2" />
          <circle cx="40" cy="20" r="15" fill="white" fillOpacity="0.15" />
        </svg>
      </div>
    </div>
  );
};

export default MedicalUpgradeCard;
