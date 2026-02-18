import React, { useEffect, useRef } from 'react';
import { ArrowRight, Play, Sparkles, Heart, Shield } from 'lucide-react';

const Hero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const floatingElements = [
    { icon: Heart, delay: '0s', position: 'top-20 left-10' },
    { icon: Shield, delay: '2s', position: 'top-40 right-20' },
    { icon: Sparkles, delay: '4s', position: 'bottom-40 left-20' },
  ];

  return (
    <section 
      id="accueil" 
      ref={heroRef}
      className="pt-20 sm:pt-24 lg:pt-0 relative min-h-screen flex items-center overflow-hidden fade-in-section"
    >
      {/* Dynamic gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100 animate-gradient"></div>

      {/* Background image with proper mobile handling */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
        style={{
          backgroundImage: "url('https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop')",
          backgroundAttachment: window.innerWidth > 768 ? 'fixed' : 'scroll'
        }}
      />

      {/* Enhanced background overlay with glassmorphism effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/60 to-transparent backdrop-blur-sm"></div>
      
      {/* Floating decorative elements - Hidden on mobile */}
      {floatingElements.map((element, index) => (
        <div
          key={index}
          className={`absolute ${element.position} floating-element opacity-30 hidden xl:block`}
          style={{ animationDelay: element.delay }}
        >
          <div className="relative">
            <element.icon size={48} className="text-primary drop-shadow-lg" />
            <div className="absolute inset-0 blur-xl bg-primary/20"></div>
          </div>
        </div>
      ))}

      {/* Animated background particles - Reduced on mobile */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(window.innerWidth > 768 ? 8 : 4)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              width: `${Math.random() * 6 + 4}px`,
              height: `${Math.random() * 6 + 4}px`,
              background: `radial-gradient(circle, rgba(79, 147, 206, ${Math.random() * 0.3 + 0.2}), transparent)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${4 + i}s`,
              boxShadow: `0 0 20px rgba(79, 147, 206, ${Math.random() * 0.3 + 0.2})`
            }}
          />
        ))}
      </div>
      
      {/* Main content container with proper mobile constraints */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-16 xl:py-20 relative z-10 w-full max-w-7xl">
        <div className="w-full lg:w-1/2 xl:w-3/5 hero-content text-center lg:text-left">
          <div className="animate-fade-in-up">
            <h1 className="text-3xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-3 sm:mb-4 font-heading leading-tight">
              <span className="text-gradient">Ake Achi Simplice</span>
            </h1>
          </div>
          
          <div className="animate-fade-in-up delay-200">
            <h2 className="text-xl sm:text-xl md:text-2xl lg:text-3xl font-semibold text-primary mb-4 sm:mb-6 font-heading">
              Infirmier Diplômé d'État
            </h2>
          </div>
          
          <div className="animate-fade-in-up delay-300">
            <p className="text-base sm:text-base lg:text-lg text-gray-700 mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Des soins professionnels et attentionnés, avec plus de 20 ans d'expérience 
              dans le domaine de la santé en Côte d'Ivoire.
            </p>
          </div>
          
          {/* Buttons with proper mobile layout */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-fade-in-up delay-400 justify-center lg:justify-start max-w-md sm:max-w-none mx-auto lg:mx-0">
            <button
              onClick={() => scrollToSection('rendez-vous')}
              className="btn-primary group relative overflow-hidden w-full sm:w-auto flex-shrink-0 shadow-xl hover:shadow-2xl"
            >
              <span className="relative z-10 flex items-center justify-center">
                Prendre rendez-vous
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 group-hover:animate-shimmer"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            <button
              onClick={() => scrollToSection('services')}
              className="btn-secondary group w-full sm:w-auto flex-shrink-0 shadow-lg hover:shadow-xl"
            >
              <Play size={16} className="mr-2 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300" />
              Découvrir mes services
            </button>
          </div>

          {/* Trust indicators with mobile optimization */}
          <div className="mt-8 sm:mt-8 lg:mt-12 animate-fade-in-up delay-500">
            <div className="grid grid-cols-1 sm:flex sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-4 lg:gap-6 text-sm sm:text-sm text-gray-600">
              <div className="flex items-center justify-center sm:justify-start group cursor-default">
                <div className="w-10 h-10 sm:w-10 sm:h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mr-3 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                  <Shield size={18} className="text-green-600 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="font-medium">Diplômé d'État</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start group cursor-default">
                <div className="w-10 h-10 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mr-3 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                  <Heart size={18} className="text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="font-medium">20+ ans d'expérience</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start group cursor-default">
                <div className="w-10 h-10 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mr-3 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                  <Sparkles size={18} className="text-amber-600 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="font-medium">Expertise reconnue</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator - Hidden on mobile */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden sm:block">
        <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-primary rounded-full flex justify-center">
          <div className="w-1 h-2 sm:h-3 bg-primary rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;