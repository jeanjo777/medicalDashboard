import React, { useState } from 'react';
import { AlertTriangle, X, Phone } from 'lucide-react';

const EmergencyBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-red-600 to-red-500 text-white py-2.5 px-4 relative z-40 mt-[72px] sm:mt-[80px]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={14} className="animate-pulse" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 min-w-0">
            <span className="font-semibold text-sm whitespace-nowrap">Urgence vitale ?</span>
            <span className="text-xs sm:text-sm text-red-100 truncate">
              Appelez le 185 (SAMU) ou rendez-vous à l'hôpital le plus proche
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href="tel:185"
            className="bg-white text-red-600 px-3.5 py-1.5 rounded-lg font-semibold hover:bg-red-50 transition-colors duration-300 flex items-center text-xs gap-1.5"
          >
            <Phone size={13} />
            185
          </a>
          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors duration-300"
            aria-label="Fermer la bannière"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyBanner;
