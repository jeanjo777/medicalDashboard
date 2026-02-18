import React, { useState } from 'react';
import { AlertTriangle, X, Phone } from 'lucide-react';

const EmergencyBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-red-600 text-white py-3 px-4 relative z-40 mt-32">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <AlertTriangle className="mr-3 animate-pulse" size={20} />
          <div className="flex flex-col sm:flex-row sm:items-center">
            <span className="font-medium mr-2">Urgence vitale ?</span>
            <span className="text-sm sm:text-base">
              Appelez le 185 (SAMU) ou rendez-vous à l'hôpital le plus proche
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <a
            href="tel:185"
            className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-300 flex items-center text-sm"
          >
            <Phone size={16} className="mr-2" />
            185
          </a>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white hover:text-gray-200 transition-colors duration-300"
            aria-label="Fermer la bannière"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyBanner;