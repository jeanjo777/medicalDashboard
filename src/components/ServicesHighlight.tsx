import React, { useEffect, useRef } from 'react';
import { Syringe, Stethoscope, Heart, ArrowRight, Sparkles } from 'lucide-react';

const ServicesHighlight: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

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

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const services = [
    {
      icon: Syringe,
      title: "Injections et prélèvements",
      description: "Administration d'injections, prises de sang et autres prélèvements dans le confort de votre domicile.",
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      iconBg: "bg-blue-500",
      delay: "delay-100"
    },
    {
      icon: Stethoscope,
      title: "Pansements et soins de plaies",
      description: "Soins des plaies chroniques ou post-opératoires, changements de pansements et surveillance de l'évolution.",
      gradient: "from-green-500 to-green-600",
      bgGradient: "from-green-50 to-green-100",
      iconBg: "bg-green-500",
      delay: "delay-200"
    },
    {
      icon: Heart,
      title: "Surveillance et suivi",
      description: "Contrôle des paramètres vitaux, suivi de traitements et accompagnement post-hospitalisation.",
      gradient: "from-red-500 to-red-600",
      bgGradient: "from-red-50 to-red-100",
      iconBg: "bg-red-500",
      delay: "delay-300"
    }
  ];

  return (
    <section ref={sectionRef} className="py-8 sm:py-12 lg:py-16 xl:py-20 bg-gradient-to-br from-gray-50 to-blue-50 fade-in-section relative overflow-hidden">
      {/* Background decorative elements - Hidden on mobile */}
      <div className="absolute top-10 right-10 opacity-10 hidden lg:block">
        <Sparkles size={100} className="text-primary animate-pulse" />
      </div>
      <div className="absolute bottom-10 left-10 opacity-10 hidden lg:block">
        <Heart size={80} className="text-primary animate-float" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="animate-fade-in-up">
            <span className="inline-block px-3 py-1 sm:px-4 sm:py-2 bg-primary bg-opacity-10 text-primary rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
              Services d'excellence
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-6 font-heading leading-tight">
              Services <span className="text-primary">principaux</span>
            </h2>
          </div>
          <div className="animate-fade-in-up delay-200">
            <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed px-2 sm:px-0 font-medium">
              Je propose une gamme complète de soins infirmiers, adaptés à vos besoins spécifiques 
              et délivrés avec professionnalisme et bienveillance.
            </p>
          </div>
        </div>
        
        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 lg:mb-16">
          {services.map((service, index) => (
            <div 
              key={index}
              className={`group cursor-pointer animate-fade-in-up ${service.delay}`}
            >
              {/* Service Card */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden h-full transform hover:-translate-y-2 hover:scale-105 border border-gray-100">
                
                {/* Icon Header */}
                <div className={`h-16 sm:h-20 lg:h-24 bg-gradient-to-br ${service.bgGradient} flex items-center justify-center relative overflow-hidden`}>
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 ${service.iconBg} rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    <service.icon className="text-white" size={24} />
                  </div>
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 group-hover:animate-shimmer"></div>
                </div>
                
                {/* Content */}
                <div className="p-4 sm:p-6 lg:p-8 bg-white">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 text-center font-heading group-hover:text-primary transition-colors duration-300 leading-tight">
                    {service.title}
                  </h3>
                  <p className="text-gray-700 text-center leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base font-medium">
                    {service.description}
                  </p>
                  
                  {/* Decorative line */}
                  <div className="flex justify-center">
                    <div className={`w-12 sm:w-16 h-1 bg-gradient-to-r ${service.gradient} rounded-full group-hover:w-16 sm:group-hover:w-20 transition-all duration-300`}></div>
                  </div>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl sm:rounded-2xl pointer-events-none"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* CTA Button */}
        <div className="text-center animate-fade-in-up delay-400">
          <button
            onClick={() => scrollToSection('services')}
            className="inline-flex items-center justify-center bg-gradient-to-r from-primary to-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-medium text-sm sm:text-base lg:text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 group relative overflow-hidden w-full sm:w-auto max-w-xs sm:max-w-none mx-auto shadow-md"
          >
            <span className="relative z-10 flex items-center justify-center font-semibold">
              Voir tous les soins
              <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 group-hover:animate-shimmer"></div>
          </button>
        </div>
      </div>
    </section>
  );
};

export default ServicesHighlight;