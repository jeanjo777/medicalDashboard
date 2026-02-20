import React from 'react';
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin, ArrowRight } from 'lucide-react';

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
    <footer className="bg-gray-900 text-white relative overflow-hidden">
      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)`,
        backgroundSize: '32px 32px'
      }}></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main footer */}
        <div className="py-12 sm:py-16">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
            {/* Brand */}
            <div className="lg:w-1/3">
              <button
                type="button"
                onClick={() => scrollToSection('accueil')}
                className="flex items-center mb-5 group"
              >
                <div className="w-11 h-11 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center mr-3 group-hover:scale-105 transition-transform duration-300">
                  <span className="text-white font-bold text-lg">AS</span>
                </div>
                <div>
                  <span className="text-white font-bold text-lg">Ake Achi Simplice</span>
                  <div className="text-teal-400 text-xs font-medium">Infirmier Diplômé d'État</div>
                </div>
              </button>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs mb-6">
                Des soins professionnels et de qualité, à domicile, en Côte d'Ivoire. Plus de 20 ans au service de votre santé.
              </p>
              {/* Social links */}
              <div className="flex gap-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                    aria-label={social.label}
                  >
                    <social.icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:flex-1">
              <div>
                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Navigation</h3>
                <ul className="space-y-2.5">
                  {navigationLinks.map((link, index) => (
                    <li key={index}>
                      <button
                        type="button"
                        onClick={() => scrollToSection(link.id)}
                        className="text-gray-400 hover:text-teal-400 transition-colors duration-300 text-sm flex items-center gap-1.5 group"
                      >
                        <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all duration-300" />
                        {link.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Contact</h3>
                <ul className="space-y-2.5">
                  {contactInfo.map((contact, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-400 text-sm">
                      <contact.icon size={14} className="text-gray-500 flex-shrink-0" />
                      <span>{contact.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Horaires</h3>
                <ul className="space-y-2.5 text-gray-400 text-sm">
                  {scheduleInfo.map((schedule, index) => (
                    <li key={index}>{schedule}</li>
                  ))}
                  <li className="text-teal-400 font-semibold mt-3">Urgences: 7j/7</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <p className="text-gray-500 text-xs">
                &copy; 2025 Ake Achi Simplice - Infirmier Diplômé d'État. Tous droits réservés.
              </p>
              <a
                href="/login"
                className="text-teal-400 hover:text-teal-300 transition-colors text-xs font-medium"
              >
                Espace médecin
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
