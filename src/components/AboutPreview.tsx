import React from 'react';
import { Award, Clock, Heart, ArrowRight, MapPin } from 'lucide-react';

const AboutPreview: React.FC = () => {
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

  const highlights = [
    {
      icon: Award,
      text: "Diplômé INFAS Bouaké",
      color: "text-teal-600",
      bg: "bg-teal-50 border-teal-200/50"
    },
    {
      icon: Clock,
      text: "+20 ans d'expérience",
      color: "text-blue-600",
      bg: "bg-blue-50 border-blue-200/50"
    },
    {
      icon: Heart,
      text: "Approche humaine",
      color: "text-rose-500",
      bg: "bg-rose-50 border-rose-200/50"
    },
    {
      icon: MapPin,
      text: "Abidjan, Côte d'Ivoire",
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-200/50"
    }
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white section-mobile overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

          {/* Photo side */}
          <div className="w-full lg:w-5/12 order-1 lg:order-2">
            <div className="relative max-w-md mx-auto">
              {/* Decorative background shape */}
              <div className="absolute -inset-4 bg-gradient-to-br from-teal-100 to-blue-50 rounded-3xl -rotate-3"></div>
              <div className="relative">
                <img
                  src="/p12.png"
                  alt="Ake Achi Simplice - Infirmier Diplômé d'État"
                  className="rounded-2xl shadow-xl w-full h-auto object-cover relative z-10"
                />
                {/* Decorative dot pattern */}
                <div className="absolute -bottom-6 -right-6 w-24 h-24 opacity-20 hidden sm:block" style={{
                  backgroundImage: 'radial-gradient(circle, #0E7490 1.5px, transparent 1.5px)',
                  backgroundSize: '12px 12px'
                }}></div>
              </div>
            </div>
          </div>

          {/* Text side */}
          <div className="w-full lg:w-7/12 order-2 lg:order-1">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-200/60 text-teal-700 rounded-full text-sm font-medium mb-5">
              À propos
            </span>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-5 font-heading text-center lg:text-left leading-tight">
              Un professionnel de santé <span className="text-teal-700">dévoué</span>
            </h2>

            <p className="text-base sm:text-lg text-gray-600 mb-4 leading-relaxed text-center lg:text-left">
              Diplômé de l'Institut National de Formation des Agents de Santé (INFAS) de Bouaké en 2003,
              je mets mon expertise au service de la santé en Côte d'Ivoire depuis plus de 20 ans.
            </p>
            <p className="text-base sm:text-lg text-gray-600 mb-8 leading-relaxed text-center lg:text-left">
              Mon parcours professionnel diversifié, du CHR d'Agboville à la PALMCI, m'a permis d'acquérir
              une expertise solide dans différents domaines des soins infirmiers.
            </p>

            {/* Highlights grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
              {highlights.map((highlight, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow duration-300">
                  <div className={`w-10 h-10 rounded-xl ${highlight.bg} border flex items-center justify-center flex-shrink-0`}>
                    <highlight.icon className={highlight.color} size={18} />
                  </div>
                  <span className="text-gray-700 font-medium text-sm">{highlight.text}</span>
                </div>
              ))}
            </div>

            <div className="text-center lg:text-left">
              <button
                onClick={() => scrollToSection('apropos')}
                className="btn-secondary inline-flex items-center gap-2 px-6 py-3 rounded-xl group"
              >
                En savoir plus
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutPreview;
