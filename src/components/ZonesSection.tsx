import React from 'react';
import { MapPin, Car, Clock, Info, CheckCircle } from 'lucide-react';

const ZonesSection: React.FC = () => {
  const abidjanDistricts = [
    "Cocody",
    "Plateau",
    "Marcory",
    "Treichville",
    "Adjamé"
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
      text: "Délai d'intervention : généralement sous 24h pour les nouveaux patients (selon disponibilité)",
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50 border-blue-200/50"
    },
    {
      icon: Car,
      text: "Pour les zones hors secteur, merci de me contacter pour vérifier la possibilité d'intervention",
      iconColor: "text-teal-600",
      iconBg: "bg-teal-50 border-teal-200/50"
    },
    {
      icon: Info,
      text: "En cas d'urgence vitale, composez le 185 (SAMU) ou rendez-vous à l'hôpital le plus proche",
      iconColor: "text-rose-500",
      iconBg: "bg-rose-50 border-rose-200/50"
    }
  ];

  return (
    <section id="zones" className="py-16 sm:py-20 lg:py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-200/60 text-teal-700 rounded-full text-sm font-medium mb-5">
            Couverture
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 font-heading leading-tight">
            Zones <span className="text-teal-700">d'intervention</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            J'interviens principalement dans les communes d'Abidjan et ses environs proches.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Map placeholder */}
          <div className="w-full lg:w-1/2">
            <div className="bg-gradient-to-br from-teal-50 to-blue-50 border border-teal-200/30 rounded-2xl overflow-hidden h-full min-h-[380px] relative flex items-center justify-center">
              {/* Decorative circles */}
              <div className="absolute inset-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-teal-200/30 rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 border-2 border-teal-200/40 rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-teal-300/50 rounded-full"></div>
              </div>
              <div className="text-center relative z-10">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4">
                  <MapPin className="text-teal-600" size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1 font-heading">Abidjan</h3>
                <p className="text-sm text-gray-500">Zone d'intervention principale</p>
              </div>
            </div>
          </div>

          {/* Info side */}
          <div className="w-full lg:w-1/2 space-y-6">
            {/* Districts */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-5 font-heading">Secteurs couverts</h3>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                    <MapPin className="text-teal-600" size={16} />
                    Abidjan
                  </h4>
                  <ul className="space-y-2">
                    {abidjanDistricts.map((district, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle size={14} className="text-teal-500 flex-shrink-0" />
                        {district}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                    <MapPin className="text-blue-600" size={16} />
                    Environs
                  </h4>
                  <ul className="space-y-2">
                    {surroundingAreas.map((area, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle size={14} className="text-blue-500 flex-shrink-0" />
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Important info */}
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 sm:p-8">
              <h4 className="font-bold text-gray-900 mb-4 text-sm">Informations importantes</h4>
              <div className="space-y-4">
                {importantInfo.map((info, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl ${info.iconBg} border flex items-center justify-center flex-shrink-0`}>
                      <info.icon className={info.iconColor} size={16} />
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{info.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ZonesSection;
