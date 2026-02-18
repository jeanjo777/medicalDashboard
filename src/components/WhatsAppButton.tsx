import React, { useState } from 'react';
import { MessageCircle, Phone, X } from 'lucide-react';

const WhatsAppButton: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleWhatsAppClick = () => {
    // WhatsApp number for Côte d'Ivoire
    const phoneNumber = "2250505831146"; // Format: country code + number without +
    const message = "Bonjour, je souhaiterais prendre rendez-vous pour des soins infirmiers.";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handlePhoneClick = () => {
    window.location.href = "tel:+2250505831146";
  };

  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 whatsapp-mobile">
      {/* Expanded menu */}
      <div className={`transition-all duration-300 ${isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <div className="bg-white rounded-2xl shadow-2xl p-3 sm:p-4 mb-4 border border-gray-100 min-w-max">
          <div className="text-center mb-3 sm:mb-4">
            <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Contactez-moi</h3>
            <p className="text-xs sm:text-sm text-gray-600">Disponible 7j/7</p>
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            <button
              onClick={handleWhatsAppClick}
              className="flex items-center w-full p-2 sm:p-3 bg-[#25D366] text-white rounded-xl hover:bg-[#20BA5A] transition-colors duration-300 group touch-target text-sm sm:text-base"
            >
              <MessageCircle size={18} className="mr-2 sm:mr-3 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">WhatsApp</span>
            </button>
            
            <button
              onClick={handlePhoneClick}
              className="flex items-center w-full p-2 sm:p-3 bg-primary text-white rounded-xl hover:bg-blue-600 transition-colors duration-300 group touch-target text-sm sm:text-base"
            >
              <Phone size={18} className="mr-2 sm:mr-3 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">Appeler</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main floating button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 touch-target ${
          isExpanded 
            ? 'bg-gray-600 hover:bg-gray-700' 
            : 'bg-gradient-to-br from-[#25D366] to-[#20BA5A] hover:from-[#20BA5A] hover:to-[#1BA84E] animate-pulse-glow'
        }`}
        aria-label={isExpanded ? "Fermer le menu de contact" : "Ouvrir le menu de contact"}
      >
        <div className="relative">
          <MessageCircle 
            className={`text-white transition-all duration-300 ${
              isExpanded ? 'opacity-0 rotate-180 scale-0' : 'opacity-100 rotate-0 scale-100'
            }`} 
            size={window.innerWidth < 640 ? 24 : 28} 
          />
          <X 
            className={`text-white absolute top-0 left-0 transition-all duration-300 ${
              isExpanded ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-180 scale-0'
            }`} 
            size={window.innerWidth < 640 ? 24 : 28} 
          />
        </div>
      </button>

      {/* Floating notification dot */}
      {!isExpanded && (
        <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full animate-bounce">
          <div className="w-full h-full bg-red-500 rounded-full animate-ping"></div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppButton;