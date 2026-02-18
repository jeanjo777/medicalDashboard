import React, { useState, useEffect } from 'react';
import { Menu, X, User, Phone } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isMenuOpen && !target.closest('.mobile-menu-container')) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

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
    setIsMenuOpen(false); // Close menu after navigation
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled
        ? 'bg-white shadow-2xl border-b border-primary/10'
        : 'bg-white shadow-xl border-b border-white/20'
    }`}>
      <div className="container mx-auto px-4 py-4 sm:py-5 mobile-menu-container relative">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <button 
            onClick={() => scrollToSection('accueil')}
            className="flex items-center hover:opacity-90 transition-all duration-500 group z-50 relative"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary via-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative overflow-hidden">
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12"></div>
              <span className="text-white font-bold text-xl sm:text-2xl relative z-10 group-hover:scale-110 transition-transform duration-300">AS</span>
            </div>
            <div className="ml-3 sm:ml-4 hidden sm:block">
              <span className="text-gray-900 font-bold text-lg sm:text-xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-primary group-hover:to-blue-600 transition-all duration-500">
                Ake Achi Simplice
              </span>
              <div className="text-sm text-primary font-medium opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                Infirmier Diplômé d'État
              </div>
            </div>
          </button>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center relative z-10">
            <div className="radio-navigation bg-white rounded-2xl px-2 py-1 shadow-lg border border-primary/10">
              {[
                { name: 'Accueil', id: 'accueil' },
                { name: 'Services', id: 'services' },
                { name: 'À propos', id: 'apropos' },
                { name: 'Zones', id: 'zones' }
              ].map((item, index) => (
                <React.Fragment key={index}>
                  <input
                    id={`nav-${item.id}`}
                    name="navigation"
                    type="radio"
                    defaultChecked={index === 0}
                    onChange={() => scrollToSection(item.id)}
                  />
                  <label htmlFor={`nav-${item.id}`}>{item.name}</label>
                </React.Fragment>
              ))}

              <div className="glider-container">
                <div className="glider"></div>
              </div>
            </div>
          </nav>
          
          {/* CTA Button - Desktop */}
          <div className="hidden lg:flex items-center space-x-4 xl:space-x-6 relative z-10">
            <a
              href="tel:+2250505831146"
              className="flex items-center text-gray-600 hover:text-primary transition-all duration-300 px-3 py-2 rounded-lg hover:bg-gray-50 group"
            >
              <Phone size={18} className="mr-2 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-sm font-semibold">05 05 83 11 46</span>
            </a>
            <a
              href="/login"
              className="flex items-center text-gray-600 hover:text-primary transition-all duration-300 px-3 py-2 rounded-lg hover:bg-gray-50 group"
            >
              <User size={18} className="mr-2 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-sm font-semibold">Espace médecin</span>
            </a>
            <button
              onClick={() => scrollToSection('rendez-vous')}
              className="bg-gradient-to-r from-primary to-blue-600 text-white px-6 xl:px-8 py-3 xl:py-4 rounded-xl font-semibold text-sm xl:text-base hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 transition-all duration-500 relative overflow-hidden group"
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 group-hover:animate-shimmer"></div>
              <span className="relative z-10">Prendre rendez-vous</span>
            </button>
          </div>
          
          {/* Mobile Navigation Toggle */}
          <label className="lg:hidden hamburger cursor-pointer z-50 relative" aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}>
            <input
              type="checkbox"
              checked={isMenuOpen}
              onChange={toggleMenu}
            />
            <svg viewBox="0 0 32 32" className="h-12 w-12">
              <path
                className="line line-top-bottom"
                d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
              ></path>
              <path className="line" d="M7 16 27 16"></path>
            </svg>
          </label>
        </div>
        
        {/* Mobile Navigation Menu */}
        <div className={`lg:hidden transition-all duration-500 ease-in-out ${
          isMenuOpen
            ? 'max-h-screen opacity-100 mt-6 visible translate-y-0'
            : 'max-h-0 opacity-0 mt-0 invisible -translate-y-4'
        }`}>
          <div className="bg-white rounded-2xl shadow-2xl border border-primary/10 p-6 transform transition-all duration-500 relative overflow-hidden">
            <nav className="relative z-10">
              {/* Radio Navigation for Mobile - Vertical Layout */}
              <div className="radio-navigation-mobile mb-6">
                {[
                  { name: 'Accueil', id: 'accueil' },
                  { name: 'Services', id: 'services' },
                  { name: 'À propos', id: 'apropos' },
                  { name: 'Zones d\'intervention', id: 'zones' }
                ].map((item, index) => (
                  <React.Fragment key={index}>
                    <input
                      id={`nav-mobile-${item.id}`}
                      name="navigation-mobile"
                      type="radio"
                      defaultChecked={index === 0}
                      onChange={() => scrollToSection(item.id)}
                    />
                    <label htmlFor={`nav-mobile-${item.id}`}>{item.name}</label>
                  </React.Fragment>
                ))}

                <div className="glider-container-mobile">
                  <div className="glider-mobile"></div>
                </div>
              </div>

              {/* Mobile contact section */}
              <div className="pt-3 border-t border-primary/20 space-y-2 mt-3">
                <a
                  href="tel:+2250505831146"
                  className="flex items-center text-gray-600 hover:text-primary transition-all duration-300 py-3.5 px-5 rounded-xl hover:bg-primary/10 hover:shadow-md touch-target w-full group"
                >
                  <Phone size={20} className="mr-3 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-semibold">05 05 83 11 46</span>
                </a>
                <a
                  href="/login"
                  className="flex items-center text-gray-600 hover:text-primary transition-all duration-300 py-3.5 px-5 rounded-xl hover:bg-primary/10 hover:shadow-md touch-target w-full group"
                >
                  <User size={20} className="mr-3 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-semibold">Espace médecin</span>
                </a>
                <button
                  onClick={() => scrollToSection('rendez-vous')}
                  className="bg-gradient-to-r from-primary to-blue-600 text-white w-full py-3.5 px-6 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 touch-target relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12"></div>
                  <span className="relative z-10">Prendre rendez-vous</span>
                </button>
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
    </header>
  );
};

export default Header;