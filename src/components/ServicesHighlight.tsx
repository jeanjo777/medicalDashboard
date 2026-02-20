import React, { useEffect, useRef, useCallback } from 'react';
import { Syringe, Stethoscope, Heart, ArrowRight } from 'lucide-react';

const ServicesHighlight: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  // 3D tilt effect on cards
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const card = cardsRef.current[index];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / centerY * -8;
    const rotateY = (x - centerX) / centerX * 8;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
  }, []);

  const handleMouseLeave = useCallback((index: number) => {
    const card = cardsRef.current[index];
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('is-visible');
        });
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const services = [
    {
      icon: Syringe,
      title: "Injections et prélèvements",
      description: "Administration d'injections, prises de sang et autres prélèvements dans le confort de votre domicile.",
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50 border-blue-200/50",
      accent: "bg-blue-500",
      glowColor: "rgba(59, 130, 246, 0.15)",
      number: "01"
    },
    {
      icon: Stethoscope,
      title: "Pansements et soins de plaies",
      description: "Soins des plaies chroniques ou post-opératoires, changements de pansements et surveillance de l'évolution.",
      iconColor: "text-teal-600",
      iconBg: "bg-teal-50 border-teal-200/50",
      accent: "bg-teal-500",
      glowColor: "rgba(20, 184, 166, 0.15)",
      number: "02"
    },
    {
      icon: Heart,
      title: "Surveillance et suivi",
      description: "Contrôle des paramètres vitaux, suivi de traitements et accompagnement post-hospitalisation.",
      iconColor: "text-rose-500",
      iconBg: "bg-rose-50 border-rose-200/50",
      accent: "bg-rose-500",
      glowColor: "rgba(244, 63, 94, 0.15)",
      number: "03"
    }
  ];

  return (
    <section ref={sectionRef} className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-gray-50 to-white section-reveal relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-200/60 text-teal-700 rounded-full text-sm font-medium mb-5">
              Nos services
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 font-heading leading-tight">
              Services <span className="text-gradient-animated">principaux</span>
            </h2>
          </div>
          <div className="animate-fade-in-up delay-200">
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Une gamme complète de soins infirmiers, adaptés à vos besoins spécifiques
              et délivrés avec professionnalisme.
            </p>
          </div>
        </div>

        {/* Services Grid with 3D tilt */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {services.map((service, index) => (
            <div
              key={index}
              className="group animate-slide-up-spring"
              style={{ animationDelay: `${(index + 1) * 150}ms` }}
            >
              <div
                ref={(el) => { cardsRef.current[index] = el; }}
                onMouseMove={(e) => handleMouseMove(e, index)}
                onMouseLeave={() => handleMouseLeave(index)}
                className="relative bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 h-full transition-all duration-300 overflow-hidden card-shine"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"
                  style={{ boxShadow: `inset 0 0 60px ${service.glowColor}` }}
                ></div>

                {/* Top accent line */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${service.accent} opacity-0 group-hover:opacity-100 transition-all duration-300 origin-left group-hover:scale-x-100 scale-x-0`}></div>

                {/* Number */}
                <span className="text-6xl font-bold text-gray-100 absolute top-4 right-6 select-none group-hover:text-gray-200/50 transition-colors duration-300">
                  {service.number}
                </span>

                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl ${service.iconBg} border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 icon-hover-spin relative z-10`}>
                  <service.icon className={service.iconColor} size={26} />
                </div>

                {/* Content */}
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 font-heading group-hover:text-teal-700 transition-colors duration-300 relative z-10">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base relative z-10">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center animate-fade-in-up delay-400">
          <button
            onClick={() => scrollToSection('services')}
            className="btn-primary btn-ripple inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl group"
          >
            Voir tous les soins
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ServicesHighlight;
