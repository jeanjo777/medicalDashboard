import React from 'react';
import { GraduationCap, FileText, Heart, Shield, MessageCircle, Users, Check, Building, Calendar } from 'lucide-react';

const AboutSection: React.FC = () => {
  const qualifications = [
    {
      icon: GraduationCap,
      title: "Sciences de la Nature",
      institution: "Université d'Abobo-Adjamé, 1996-1998"
    },
    {
      icon: FileText,
      title: "Diplôme d'État d'Infirmier",
      institution: "INFAS Bouaké, 12e promotion, 1999-2003"
    }
  ];

  const experience = [
    {
      period: "2003-2006",
      title: "CHR d'Agboville",
      description: "Service de pédiatrie",
      color: "bg-blue-500"
    },
    {
      period: "2006-2012",
      title: "SOTRA",
      description: "Société des Transports Abidjanais",
      color: "bg-teal-500"
    },
    {
      period: "Depuis 2012",
      title: "PALMCI Côte d'Ivoire",
      description: "Production et transformation de l'huile de palme",
      color: "bg-amber-500"
    }
  ];

  const philosophyValues = [
    {
      icon: Heart,
      title: "Approche humaine",
      description: "Je considère chaque patient dans sa globalité, en tenant compte de ses besoins physiques, psychologiques et sociaux.",
      iconColor: "text-rose-500",
      iconBg: "bg-rose-50 border-rose-200/50"
    },
    {
      icon: Shield,
      title: "Rigueur professionnelle",
      description: "J'applique les protocoles de soins avec précision et veille constamment à la qualité et à la sécurité des soins prodigués.",
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50 border-blue-200/50"
    },
    {
      icon: MessageCircle,
      title: "Communication claire",
      description: "J'explique chaque soin de façon compréhensible et reste à l'écoute des questions et préoccupations de mes patients.",
      iconColor: "text-teal-600",
      iconBg: "bg-teal-50 border-teal-200/50"
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "Je travaille en étroite collaboration avec les médecins et autres professionnels de santé pour une prise en charge coordonnée.",
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50 border-purple-200/50"
    }
  ];

  const commitments = [
    "Respecter scrupuleusement le secret professionnel",
    "Assurer la continuité des soins en coordination avec les autres professionnels de santé",
    "Me former régulièrement pour maintenir mes compétences à jour",
    "Respecter les horaires convenus et prévenir en cas de retard",
    "Adapter ma pratique aux besoins spécifiques de chaque patient"
  ];

  return (
    <section id="apropos" className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-200/60 text-teal-700 rounded-full text-sm font-medium mb-5">
            À propos
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 font-heading leading-tight">
            À propos de <span className="text-teal-700">moi</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Découvrez mon parcours professionnel et ma philosophie de soins.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-start">
          {/* Left column - Photo & Formation */}
          <div className="w-full lg:w-5/12">
            <div className="relative max-w-md mx-auto lg:mx-0 mb-8">
              <div className="absolute -inset-4 bg-gradient-to-br from-teal-100 to-blue-50 rounded-3xl -rotate-2"></div>
              <img
                src="/p12.png"
                alt="Ake Achi Simplice - Infirmier Diplômé d'État"
                className="relative rounded-2xl shadow-xl w-full h-auto object-cover z-10"
              />
            </div>

            {/* Formation */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-5 font-heading">Formation académique</h3>
              <div className="space-y-4">
                {qualifications.map((qual, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200/50 flex items-center justify-center flex-shrink-0">
                      <qual.icon className="text-teal-600" size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{qual.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{qual.institution}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column - Content */}
          <div className="w-full lg:w-7/12 space-y-8">
            {/* Parcours */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 font-heading">Mon parcours professionnel</h3>
              <p className="text-gray-600 mb-6 leading-relaxed text-sm sm:text-base">
                Après mes études en Sciences de la Nature à l'Université d'Abobo-Adjamé (1996-1998),
                j'ai poursuivi ma formation à l'Institut National de Formation des Agents de Santé (INFAS)
                de Bouaké où j'ai obtenu mon diplôme d'État d'infirmier en 2003.
              </p>

              {/* Timeline */}
              <div className="relative pl-6 border-l-2 border-gray-100 space-y-6">
                {experience.map((exp, index) => (
                  <div key={index} className="relative">
                    <div className={`absolute -left-[calc(0.75rem+1px)] w-3 h-3 ${exp.color} rounded-full border-2 border-white`}></div>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="text-teal-600" size={14} />
                      <span className="text-xs font-semibold text-teal-600">{exp.period}</span>
                    </div>
                    <h4 className="text-base font-bold text-gray-900">{exp.title}</h4>
                    <p className="text-sm text-gray-500">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Philosophie */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 font-heading">Ma philosophie de soins</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {philosophyValues.map((value, index) => (
                  <div key={index} className="flex flex-col">
                    <div className={`w-11 h-11 rounded-xl ${value.iconBg} border flex items-center justify-center mb-3`}>
                      <value.icon className={value.iconColor} size={20} />
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1.5">{value.title}</h4>
                    <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{value.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Engagements */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 font-heading">Engagement professionnel</h3>
              <p className="text-gray-600 mb-5 text-sm sm:text-base leading-relaxed">En tant qu'infirmier diplômé d'État, je m'engage à :</p>
              <ul className="space-y-3">
                {commitments.map((commitment, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="text-teal-600" size={12} />
                    </div>
                    <span className="text-sm text-gray-600 leading-relaxed">{commitment}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
