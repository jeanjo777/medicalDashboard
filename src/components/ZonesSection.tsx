import React from 'react';
import { MapPin, Car, Clock, Info } from 'lucide-react';

const ZonesSection: React.FC = () => {
  const abidjanDistricts = [
    "Abidjan - Cocody",
    "Abidjan - Plateau", 
    "Abidjan - Marcory",
    "Abidjan - Treichville",
    "Abidjan - Adjamé"
  ];

  const surroundingAreas = [
    "Bingerville",
    "Anyama",
    "Songon",
    "Grand-Bassam"
  ];

  const importantInfo = [
    {
      icon: Clock,
      text: "Délai d'intervention : généralement sous 24h pour les nouveaux patients (selon disponibilité)"
    },
    {
      icon: Car,
      text: "Pour les zones hors secteur, merci de me contacter pour vérifier la possibilité d'intervention"
    },
    {
      icon: Info,
      text: "En cas d'urgence vitale, composez le 185 (SAMU) ou rendez-vous à l'hôpital le plus proche"
    }
  ];

  return (
    <section id="zones" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 font-heading">Zones d'intervention</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            J'interviens principalement dans les communes d'Abidjan et ses environs proches.
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/2">
            <div 
              className="bg-gradient-to-br from-primary/10 to-secondary rounded-lg overflow-hidden h-96 relative flex items-center justify-center"
            >
              <div className="text-center">
                <MapPin className="text-primary mx-auto mb-4" size={64} />
                <h3 className="text-2xl font-semibold text-gray-900 mb-2 font-heading">Carte d'Abidjan</h3>
                <p className="text-gray-600">Zone d'intervention principale</p>
              </div>
            </div>
          </div>
          
          <div className="w-full lg:w-1/2">
            <div className="bg-white p-8 rounded-lg shadow-md h-full">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 font-heading">Secteurs couverts</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <MapPin className="text-primary mr-2" size={20} />
                    Abidjan
                  </h4>
                  <ul className="space-y-2 text-gray-600 ml-6">
                    {abidjanDistricts.map((district, index) => (
                      <li key={index} className="leading-relaxed">{district}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <MapPin className="text-primary mr-2" size={20} />
                    Environs
                  </h4>
                  <ul className="space-y-2 text-gray-600 ml-6">
                    {surroundingAreas.map((area, index) => (
                      <li key={index} className="leading-relaxed">{area}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Informations importantes</h4>
                <ul className="space-y-2 text-gray-600">
                  {importantInfo.map((info, index) => (
                    <li key={index} className="flex items-start">
                      <info.icon className="text-primary mr-2 mt-1 flex-shrink-0" size={16} />
                      <span className="leading-relaxed">{info.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ZonesSection;