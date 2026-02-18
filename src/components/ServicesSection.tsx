import React, { useEffect, useRef } from 'react';
import { Syringe, TestTube, Ban as Bandage, Heart, Guitar as Hospital, UserCog, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

const ServicesSection: React.FC = () => {
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
      title: "Injections",
      description: "Administration d'injections intramusculaires, sous-cutanées ou intraveineuses sur prescription médicale.",
      features: [
        "Injections d'insuline",
        "Injections d'anticoagulants",
        "Autres médicaments injectables"
      ],
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      delay: "delay-100"
    },
    {
      icon: TestTube,
      title: "Prélèvements sanguins",
      description: "Réalisation de prises de sang à domicile sur prescription médicale, avec transport des échantillons au laboratoire.",
      features: [
        "Analyses de routine",
        "Bilans préopératoires",
        "Suivi de traitements"
      ],
      gradient: "from-green-500 to-green-600",
      bgGradient: "from-green-50 to-green-100",
      delay: "delay-200"
    },
    {
      icon: Bandage,
      title: "Pansements et soins de plaies",
      description: "Réalisation et renouvellement de pansements, soins de plaies chroniques ou post-opératoires.",
      features: [
        "Plaies post-chirurgicales",
        "Ulcères et escarres",
        "Brûlures"
      ],
      gradient: "from-red-500 to-red-600",
      bgGradient: "from-red-50 to-red-100",
      delay: "delay-300"
    },
    {
      icon: Heart,
      title: "Surveillance et suivi",
      description: "Surveillance des paramètres vitaux, contrôle de la glycémie, suivi de l'état général.",
      features: [
        "Tension artérielle",
        "Glycémie capillaire",
        "Saturation en oxygène"
      ],
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
      delay: "delay-100"
    },
    {
      icon: Hospital,
      title: "Accompagnement post-opératoire",
      description: "Suivi et soins après une intervention chirurgicale, pour faciliter votre convalescence à domicile.",
      features: [
        "Surveillance de cicatrices",
        "Ablation de fils ou d'agrafes",
        "Prévention des complications"
      ],
      gradient: "from-indigo-500 to-indigo-600",
      bgGradient: "from-indigo-50 to-indigo-100",
      delay: "delay-200"
    },
    {
      icon: UserCog,
      title: "Soins aux personnes âgées",
      description: "Assistance et soins spécifiques pour les personnes âgées, adaptés à leurs besoins particuliers.",
      features: [
        "Aide à la toilette",
        "Prévention d'escarres",
        "Surveillance de l'état général"
      ],
      gradient: "from-orange-500 to-orange-600",
      bgGradient: "from-orange-50 to-orange-100",
      delay: "delay-300"
    }
  ];

  return (
    <section id="soins" ref={sectionRef} className="py-20 bg-white fade-in-section relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-10 right-10 opacity-5">
          <Sparkles size={120} className="text-primary animate-pulse" />
        </div>
        <div className="absolute bottom-20 left-10 opacity-5">
          <Heart size={100} className="text-primary animate-float" />
        </div>
        <div className="absolute top-1/2 right-1/4 opacity-5">
          <Syringe size={80} className="text-primary animate-bounce" />
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="animate-fade-in-up">
            <span className="inline-block px-4 py-2 bg-primary bg-opacity-10 text-primary rounded-full text-sm font-medium mb-4">
              Expertise médicale
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-heading">
              Soins <span className="text-gradient">proposés</span>
            </h2>
          </div>
          <div className="animate-fade-in-up delay-200">
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Je propose une gamme complète de soins infirmiers, sur prescription médicale ou en accès direct, 
              pour répondre à tous vos besoins de santé avec excellence et bienveillance.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index}
              className={`service-card group animate-fade-in-up ${service.delay}`}
            >
              {/* Service icon header */}
              <div className={`h-24 bg-gradient-to-br ${service.bgGradient} flex items-center justify-center relative overflow-hidden`}>
                <div className={`w-16 h-16 bg-gradient-to-br ${service.gradient} rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  <service.icon className="text-white" size={32} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 group-hover:animate-shimmer"></div>
              </div>

              {/* Service content */}
              <div className="p-8 relative z-10">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4 font-heading group-hover:text-primary transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {service.description}
                </p>

                {/* Features list */}
                <ul className="text-gray-600 mb-8 space-y-3">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start group/item">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5 group-hover/item:scale-110 transition-transform duration-200">
                        <CheckCircle className="text-green-600" size={12} />
                      </div>
                      <span className="group-hover/item:text-gray-900 transition-colors duration-200">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => scrollToSection('rendez-vous')}
                  className="w-full bg-gradient-to-r from-primary to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300 group/btn relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    Prendre rendez-vous
                    <ArrowRight size={16} className="ml-2 group-hover/btn:translate-x-1 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover/btn:opacity-20 transform -skew-x-12 group-hover/btn:animate-shimmer"></div>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA section */}
        <div className="mt-20 text-center animate-fade-in-up delay-400">
          <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-primary opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4">Besoin d'un soin spécifique ?</h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                N'hésitez pas à me contacter pour discuter de vos besoins particuliers. 
                Je suis là pour vous accompagner avec professionnalisme et bienveillance.
              </p>
              <button
                onClick={() => scrollToSection('rendez-vous')}
                className="bg-white text-primary px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Contactez-moi
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;