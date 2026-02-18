import React from 'react';
import { GraduationCap, FileText, User, Heart, Shield, MessageCircle, Users, Check, Building, Calendar } from 'lucide-react';

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
      icon: Building,
      period: "2003-2006",
      title: "CHR d'Agboville",
      description: "Service de pédiatrie",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Building,
      period: "2006-2012",
      title: "SOTRA",
      description: "Société des Transports Abidjanais",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Building,
      period: "Depuis 2012",
      title: "PALMCI Côte d'Ivoire",
      description: "Production et transformation de l'huile de palme",
      color: "from-orange-500 to-orange-600"
    }
  ];

  const philosophyValues = [
    {
      icon: Heart,
      title: "Approche humaine",
      description: "Je considère chaque patient dans sa globalité, en tenant compte de ses besoins physiques, psychologiques et sociaux."
    },
    {
      icon: Shield,
      title: "Rigueur professionnelle",
      description: "J'applique les protocoles de soins avec précision et veille constamment à la qualité et à la sécurité des soins prodigués."
    },
    {
      icon: MessageCircle,
      title: "Communication claire",
      description: "J'explique chaque soin de façon compréhensible et reste à l'écoute des questions et préoccupations de mes patients."
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "Je travaille en étroite collaboration avec les médecins et autres professionnels de santé pour assurer une prise en charge coordonnée."
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
    <section id="apropos" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 font-heading">À propos de moi</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Découvrez mon parcours professionnel et ma philosophie de soins.
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <div className="w-full lg:w-1/3">
            <img 
              src="/p12.png" 
              alt="Ake Achi Simplice - Infirmier Diplômé d'État" 
              className="rounded-lg shadow-lg w-full h-auto object-cover mb-8"
            />
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 font-heading">Formation académique</h3>
              <ul className="space-y-4">
                {qualifications.map((qual, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                      <qual.icon className="text-primary" size={16} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{qual.title}</h4>
                      <p className="text-sm text-gray-600">{qual.institution}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="w-full lg:w-2/3">
            <div className="bg-white p-8 rounded-lg shadow-md mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4 font-heading">Mon parcours professionnel</h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Après mes études en Sciences de la Nature à l'Université d'Abobo-Adjamé (1996-1998), 
                j'ai poursuivi ma formation à l'Institut National de Formation des Agents de Santé (INFAS) 
                de Bouaké où j'ai obtenu mon diplôme d'État d'infirmier en 2003.
              </p>
              
              <div className="space-y-6">
                {experience.map((exp, index) => (
                  <div key={index} className="flex items-start">
                    <div className={`w-12 h-12 bg-gradient-to-br ${exp.color} rounded-full flex items-center justify-center mr-4 flex-shrink-0 shadow-lg`}>
                      <exp.icon className="text-white" size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Calendar className="text-primary mr-2" size={16} />
                        <span className="text-sm font-medium text-primary">{exp.period}</span>
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-1">{exp.title}</h4>
                      <p className="text-gray-600">{exp.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4 font-heading">Ma philosophie de soins</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {philosophyValues.map((value, index) => (
                  <div key={index} className="flex flex-col">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                      <value.icon className="text-primary" size={24} />
                    </div>
                    <h4 className="text-xl font-medium text-gray-900 mb-2 font-heading">{value.title}</h4>
                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4 font-heading">Engagement professionnel</h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">En tant qu'infirmier diplômé d'État, je m'engage à :</p>
              <ul className="space-y-3 text-gray-600">
                {commitments.map((commitment, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="text-primary mr-3 mt-1 flex-shrink-0" size={20} />
                    <span className="leading-relaxed">{commitment}</span>
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