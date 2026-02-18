import React from 'react';
import { Award, Clock, Heart } from 'lucide-react';

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
      text: "Diplômé INFAS Bouaké"
    },
    {
      icon: Clock,
      text: "+20 ans d'expérience"
    },
    {
      icon: Heart,
      text: "Approche humaine"
    }
  ];

  return (
    <section className="py-12 sm:py-16 bg-white section-mobile">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-12">
          <div className="w-full lg:w-1/2 order-2 lg:order-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 font-heading text-center lg:text-left">
              À propos d'Ake Achi Simplice
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mb-4 leading-relaxed text-center lg:text-left">
              Diplômé de l'Institut National de Formation des Agents de Santé (INFAS) de Bouaké en 2003, 
              je mets mon expertise au service de la santé en Côte d'Ivoire depuis plus de 20 ans.
            </p>
            <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed text-center lg:text-left">
              Mon parcours professionnel diversifié, du CHR d'Agboville à la PALMCI, m'a permis d'acquérir 
              une expertise solide dans différents domaines des soins infirmiers. Je m'engage à fournir 
              des soins de qualité avec professionnalisme et bienveillance.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-6 sm:mb-8 justify-center lg:justify-start">
              {highlights.map((highlight, index) => (
                <div key={index} className="flex items-center justify-center lg:justify-start">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mr-3">
                    <highlight.icon className="text-primary" size={20} />
                  </div>
                  <span className="text-gray-700 font-medium text-sm sm:text-base">{highlight.text}</span>
                </div>
              ))}
            </div>
            <div className="text-center lg:text-left">
              <button
                onClick={() => scrollToSection('apropos')}
                className="btn-secondary w-full sm:w-auto"
              >
                En savoir plus
              </button>
            </div>
          </div>
          <div className="w-full lg:w-1/2 order-1 lg:order-2">
            <img 
              src="/p17.png" 
              alt="Ake Achi Simplice - Infirmier Diplômé d'État" 
              className="rounded-lg shadow-lg w-full h-auto object-cover max-w-md mx-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutPreview;