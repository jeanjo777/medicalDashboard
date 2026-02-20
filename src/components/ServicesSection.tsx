import React, { useEffect, useRef } from 'react';
import { Syringe, TestTube, Ban as Bandage, Heart, Guitar as Hospital, UserCog, CheckCircle, ArrowRight } from 'lucide-react';

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
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50 border-blue-200/50",
      number: "01"
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
      iconColor: "text-green-600",
      iconBg: "bg-green-50 border-green-200/50",
      number: "02"
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
      iconColor: "text-rose-500",
      iconBg: "bg-rose-50 border-rose-200/50",
      number: "03"
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
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50 border-purple-200/50",
      number: "04"
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
      iconColor: "text-indigo-600",
      iconBg: "bg-indigo-50 border-indigo-200/50",
      number: "05"
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
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50 border-amber-200/50",
      number: "06"
    }
  ];

  return (
    <section id="soins" ref={sectionRef} className="py-16 sm:py-20 lg:py-24 bg-white fade-in-section relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-200/60 text-teal-700 rounded-full text-sm font-medium mb-5">
              Expertise médicale
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 font-heading leading-tight">
              Soins <span className="text-teal-700">proposés</span>
            </h2>
          </div>
          <div className="animate-fade-in-up delay-200">
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Une gamme complète de soins infirmiers, sur prescription médicale ou en accès direct,
              pour répondre à tous vos besoins de santé.
            </p>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group animate-fade-in-up"
              style={{ animationDelay: `${(index % 3 + 1) * 100}ms` }}
            >
              <div className="relative bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 h-full hover:shadow-xl hover:border-gray-200 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                {/* Number */}
                <span className="text-6xl font-bold text-gray-100 absolute top-4 right-6 select-none group-hover:text-gray-200 transition-colors duration-300">
                  {service.number}
                </span>

                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl ${service.iconBg} border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className={service.iconColor} size={26} />
                </div>

                {/* Content */}
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 font-heading group-hover:text-teal-700 transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-5">
                  {service.description}
                </p>

                {/* Features list */}
                <ul className="space-y-2.5 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="text-teal-500 mr-2.5 flex-shrink-0" size={15} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => scrollToSection('rendez-vous')}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold group/btn"
                >
                  Prendre rendez-vous
                  <ArrowRight size={15} className="group-hover/btn:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 sm:mt-20 animate-fade-in-up delay-400">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 sm:p-10 text-center relative overflow-hidden">
            {/* Subtle pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }}></div>
            <div className="relative z-10">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Besoin d'un soin spécifique ?</h3>
              <p className="text-gray-400 mb-6 max-w-2xl mx-auto text-sm sm:text-base">
                N'hésitez pas à me contacter pour discuter de vos besoins particuliers.
                Je suis là pour vous accompagner avec professionnalisme et bienveillance.
              </p>
              <button
                onClick={() => scrollToSection('rendez-vous')}
                className="bg-white text-gray-900 px-8 py-3.5 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
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
