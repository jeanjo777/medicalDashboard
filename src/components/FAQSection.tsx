import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Clock, CreditCard, MapPin, Phone, Shield } from 'lucide-react';

const FAQSection: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqData = [
    {
      icon: Clock,
      question: "Quels sont vos horaires de disponibilité ?",
      answer: "Je suis disponible du lundi au vendredi de 7h à 20h, et les weekends de 8h à 18h. Pour les urgences, je peux intervenir en dehors de ces horaires selon ma disponibilité. N'hésitez pas à m'appeler pour vérifier."
    },
    {
      icon: CreditCard,
      question: "Quels sont vos tarifs et modes de paiement ?",
      answer: "Mes tarifs varient selon le type de soin et la distance. Je pratique les tarifs conventionnels. Les paiements peuvent se faire en espèces, par mobile money ou par virement. Une facture vous sera remise pour tout remboursement d'assurance."
    },
    {
      icon: MapPin,
      question: "Dans quelles zones intervenez-vous ?",
      answer: "J'interviens principalement dans toutes les communes d'Abidjan (Cocody, Plateau, Marcory, Treichville, Adjamé) ainsi que dans les environs proches comme Bingerville, Anyama, Songon et Grand-Bassam. Pour d'autres zones, contactez-moi pour vérifier la faisabilité."
    },
    {
      icon: Phone,
      question: "Comment prendre rendez-vous ?",
      answer: "Vous pouvez me contacter par téléphone au 05 05 83 11 46 ou 07 47 52 42 26, par WhatsApp, ou via le formulaire de contact sur ce site. Je réponds généralement dans l'heure pour organiser votre rendez-vous."
    },
    {
      icon: Shield,
      question: "Avez-vous besoin d'une prescription médicale ?",
      answer: "Pour certains soins comme les injections ou les prélèvements sanguins, une prescription médicale est obligatoire. Pour d'autres soins comme les pansements simples ou la surveillance, je peux intervenir en accès direct. En cas de doute, consultez votre médecin."
    },
    {
      icon: HelpCircle,
      question: "Que dois-je préparer avant votre visite ?",
      answer: "Préparez votre carte d'assurance maladie, vos prescriptions médicales, la liste de vos médicaments actuels, et un espace propre pour les soins. Si vous avez des allergies ou des antécédents particuliers, pensez à me le signaler lors de la prise de rendez-vous."
    },
    {
      icon: Clock,
      question: "Combien de temps dure une intervention ?",
      answer: "La durée varie selon le type de soin : 15-30 minutes pour une injection ou un prélèvement, 30-45 minutes pour un pansement complexe, et jusqu'à 1 heure pour un bilan complet ou des soins multiples. Je prends toujours le temps nécessaire pour un soin de qualité."
    },
    {
      icon: Phone,
      question: "Que faire en cas d'urgence vitale ?",
      answer: "En cas d'urgence vitale (arrêt cardiaque, hémorragie importante, détresse respiratoire), appelez immédiatement le 185 (SAMU) ou rendez-vous à l'hôpital le plus proche. Mon intervention concerne les soins programmés et le suivi, pas les urgences vitales."
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 bg-primary bg-opacity-10 text-primary rounded-full text-sm font-medium mb-4">
            Questions fréquentes
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-heading">
            Vos <span className="text-gradient">questions</span> les plus courantes
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Retrouvez ici les réponses aux questions que me posent le plus souvent mes patients
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {faqData.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <item.icon className="text-primary" size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 pr-4">
                      {item.question}
                    </h3>
                  </div>
                  <div className="flex-shrink-0">
                    {openItems.includes(index) ? (
                      <ChevronUp className="text-primary" size={24} />
                    ) : (
                      <ChevronDown className="text-gray-400" size={24} />
                    )}
                  </div>
                </button>
                
                <div className={`transition-all duration-300 ease-in-out ${
                  openItems.includes(index) 
                    ? 'max-h-96 opacity-100' 
                    : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-6 pb-6">
                    <div className="pl-14">
                      <p className="text-gray-600 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <HelpCircle className="text-primary mx-auto mb-4" size={48} />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Vous ne trouvez pas votre réponse ?
            </h3>
            <p className="text-gray-600 mb-6">
              N'hésitez pas à me contacter directement. Je serai ravi de répondre à toutes vos questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+2250505831146"
                className="btn-primary"
              >
                <Phone size={18} className="mr-2" />
                Appelez-moi
              </a>
              <a
                href="https://wa.me/2250505831146"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;