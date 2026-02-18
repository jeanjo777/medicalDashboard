import React from 'react';
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const navigationLinks = [
    { name: 'Accueil', id: 'accueil' },
    { name: 'Services', id: 'services' },
    { name: 'À propos', id: 'apropos' },
    { name: 'Zones d\'intervention', id: 'zones' },
    { name: 'Prendre rendez-vous', id: 'rendez-vous' }
  ];

  const contactInfo = [
    { icon: Phone, text: '+225 05 05 83 11 46' },
    { icon: Phone, text: '+225 07 47 52 42 26' },
    { icon: Mail, text: 'simpliceake1975@gmail.com' },
    { icon: Mail, text: 'simplice_ake@yahoo.fr' },
    { icon: MapPin, text: 'Abidjan et environs' }
  ];

  const scheduleInfo = [
    'Lundi - Vendredi: 7h - 20h',
    'Samedi - Dimanche: 8h - 18h'
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' }
  ];

  return (
    <footer className="bg-gray-900 text-white py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row justify-between mb-8 sm:mb-12 footer-mobile">
          <div className="mb-6 sm:mb-8 lg:mb-0 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center mr-3">
                <span className="text-primary font-bold text-lg sm:text-xl">AS</span>
              </div>
              <span className="text-lg sm:text-xl font-semibold font-heading">Ake Achi Simplice</span>
            </div>
            <p className="text-gray-400 max-w-xs leading-relaxed mx-auto lg:mx-0 text-sm sm:text-base">
              Infirmier Diplômé d'État, je propose des soins professionnels et de qualité en Côte d'Ivoire.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 text-center lg:text-left">
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 font-heading">Navigation</h3>
              <ul className="space-y-2">
                {navigationLinks.map((link, index) => (
                  <li key={index}>
                    <button
                      onClick={() => scrollToSection(link.id)}
                      className="text-gray-400 hover:text-white transition-colors text-left text-sm sm:text-base touch-target"
                    >
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 font-heading">Contact</h3>
              <ul className="space-y-2">
                {contactInfo.map((contact, index) => (
                  <li key={index} className="flex items-center text-gray-400 justify-center lg:justify-start">
                    <contact.icon className="mr-2 flex-shrink-0" size={14} />
                    <span className="text-sm sm:text-base">{contact.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 font-heading">Horaires</h3>
              <ul className="space-y-2 text-gray-400">
                {scheduleInfo.map((schedule, index) => (
                  <li key={index} className="text-sm sm:text-base">{schedule}</li>
                ))}
                <li className="text-white mt-4 font-medium text-sm sm:text-base">Urgences: 7j/7</li>
              </ul>
            </div>
          </div>
        </div>
        
        <hr className="border-gray-800 mb-6 sm:mb-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4 mb-4 md:mb-0">
            <p className="text-gray-500 text-sm sm:text-base">
              &copy; 2025 Ake Achi Simplice - Infirmier Diplômé d'État. Tous droits réservés.
            </p>
            <a
              href="/login"
              className="text-primary hover:text-blue-400 transition-colors text-sm font-medium underline"
            >
              Accéder à l'espace médecin
            </a>
          </div>

          <div className="flex space-x-4 sm:space-x-6">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                className="text-gray-400 hover:text-white transition-colors touch-target"
                aria-label={social.label}
              >
                <social.icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;