import React, { useState } from 'react';
import { Phone, Mail, Calendar, CheckCircle, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import logger from '../utils/logger';

const AppointmentSection: React.FC = () => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    phone: '',
    email: '',
    service: '',
    message: '',
    consent: false
  });

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    if (!formData.firstname || !formData.lastname || !formData.phone || !formData.email || !formData.consent) {
      setSubmitError('Veuillez remplir tous les champs obligatoires.');
      setIsSubmitting(false);
      return;
    }

    try {
      const appointmentData = {
        prenom: formData.firstname,
        nom: formData.lastname,
        telephone: formData.phone,
        email: formData.email,
        type_de_soin: formData.service || 'Non spécifié',
        message: formData.message || 'Aucun message spécifique',
        date_demande: new Date().toLocaleString('fr-FR', {
          timeZone: 'Africa/Abidjan',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        source: 'Site web - Formulaire de contact',
        statut: 'nouveau'
      };

      const { error: supabaseError } = await supabase
        .from('appointment_requests')
        .insert([appointmentData]);

      if (supabaseError) {
        logger.error('Erreur Supabase:', supabaseError);
        throw new Error(supabaseError.message);
      }

      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
      if (webhookUrl) {
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointmentData)
          });
        } catch {
          // Webhook optionnel — données déjà sauvegardées en base
        }
      }

      setFormSubmitted(true);
    } catch (error) {
      logger.error('Erreur lors de l\'enregistrement:', error);
      setSubmitError('Une erreur est survenue lors de l\'envoi. Veuillez réessayer ou me contacter directement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstname: '',
      lastname: '',
      phone: '',
      email: '',
      service: '',
      message: '',
      consent: false
    });
    setFormSubmitted(false);
    setSubmitError('');
  };

  const serviceOptions = [
    { value: '', label: 'Sélectionnez un type de soin' },
    { value: 'injections', label: 'Injections' },
    { value: 'prelevements', label: 'Prélèvements sanguins' },
    { value: 'pansements', label: 'Pansements et soins de plaies' },
    { value: 'surveillance', label: 'Surveillance et suivi' },
    { value: 'pediatrie', label: 'Soins pédiatriques' },
    { value: 'consultation', label: 'Consultation infirmière' },
    { value: 'autre', label: 'Autre (préciser)' }
  ];

  const contactInfo = [
    {
      icon: Phone,
      title: "Téléphone principal",
      value: "+225 05 05 83 11 46",
      subtitle: "Disponible 7j/7 de 7h à 20h",
      iconColor: "text-teal-600",
      iconBg: "bg-teal-50 border-teal-200/50"
    },
    {
      icon: Phone,
      title: "Téléphone secondaire",
      value: "+225 07 47 52 42 26",
      subtitle: "Ligne alternative",
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50 border-blue-200/50"
    },
    {
      icon: Mail,
      title: "Email principal",
      value: "simpliceake1975@gmail.com",
      subtitle: "Réponse sous 24h",
      iconColor: "text-rose-500",
      iconBg: "bg-rose-50 border-rose-200/50"
    },
    {
      icon: Mail,
      title: "Email secondaire",
      value: "simplice_ake@yahoo.fr",
      subtitle: "Email alternatif",
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50 border-purple-200/50"
    },
    {
      icon: Calendar,
      title: "Horaires",
      value: "Lundi au vendredi : 7h - 20h",
      subtitle: "Samedi et dimanche : 8h - 18h",
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50 border-amber-200/50"
    }
  ];

  const importantNotes = [
    "Pour les soins urgents, privilégiez le contact téléphonique",
    "Pensez à préparer votre carte d'assurance maladie et votre prescription médicale",
    "Annulation : merci de prévenir au moins 24h à l'avance"
  ];

  return (
    <section id="rendez-vous" className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-200/60 text-teal-700 rounded-full text-sm font-medium mb-5">
            Contact
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 font-heading leading-tight">
            Prendre <span className="text-teal-700">rendez-vous</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Pour planifier un soin ou obtenir des informations, vous pouvez me contacter par téléphone
            ou via le formulaire ci-dessous.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Form */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 font-heading">Formulaire de contact</h3>

              {!formSubmitted ? (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="firstname" className="block text-gray-700 mb-2 font-medium text-sm">Prénom</label>
                      <input
                        type="text"
                        id="firstname"
                        name="firstname"
                        value={formData.firstname}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:bg-white transition-all duration-300"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastname" className="block text-gray-700 mb-2 font-medium text-sm">Nom</label>
                      <input
                        type="text"
                        id="lastname"
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:bg-white transition-all duration-300"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="phone" className="block text-gray-700 mb-2 font-medium text-sm">Téléphone</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:bg-white transition-all duration-300"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 mb-2 font-medium text-sm">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:bg-white transition-all duration-300"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="service" className="block text-gray-700 mb-2 font-medium text-sm">Type de soin</label>
                    <select
                      id="service"
                      name="service"
                      value={formData.service}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:bg-white transition-all duration-300 appearance-none"
                    >
                      {serviceOptions.map((option, index) => (
                        <option key={index} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="message" className="block text-gray-700 mb-2 font-medium text-sm">Message / Précisions</label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:bg-white transition-all duration-300 resize-none"
                    ></textarea>
                  </div>

                  <div className="mb-5">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        id="consent"
                        name="consent"
                        checked={formData.consent}
                        onChange={handleInputChange}
                        className="mt-0.5 w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-400"
                        required
                      />
                      <span className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                        J'accepte que mes données soient utilisées uniquement pour me recontacter
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Envoi en cours...
                      </span>
                    ) : (
                      <>
                        Envoyer ma demande
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  {submitError && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-red-700 text-sm">{submitError}</p>
                      <div className="mt-2 flex flex-col sm:flex-row gap-2">
                        <a href="tel:+2250505831146" className="text-red-600 hover:text-red-800 font-medium text-xs underline">
                          Appelez-moi : 05 05 83 11 46
                        </a>
                        <a href="mailto:simpliceake1975@gmail.com" className="text-red-600 hover:text-red-800 font-medium text-xs underline">
                          Email : simpliceake1975@gmail.com
                        </a>
                      </div>
                    </div>
                  )}
                </form>
              ) : (
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-green-50 border border-green-200/50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <CheckCircle className="text-green-600" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Demande envoyée !</h3>
                  <p className="text-gray-600 mb-5 text-sm">
                    Merci {formData.firstname} pour votre message. Je vous recontacterai dans les plus brefs délais au {formData.phone}.
                  </p>
                  <div className="bg-blue-50 border border-blue-200/50 rounded-xl p-4 mb-6 text-left">
                    <p className="text-blue-800 text-xs sm:text-sm">
                      <strong>Prochaines étapes :</strong><br/>
                      &bull; Je vous appellerai sous 24h pour confirmer le rendez-vous<br/>
                      &bull; Préparez votre carte d'assurance et prescription médicale<br/>
                      &bull; En cas d'urgence, appelez-moi directement au 05 05 83 11 46
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold"
                  >
                    Envoyer un nouveau message
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Contact info */}
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 font-heading">Informations de contact</h3>

              <div className="space-y-5">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl ${info.iconBg} border flex items-center justify-center flex-shrink-0`}>
                      <info.icon className={info.iconColor} size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{info.title}</h4>
                      <p className="text-gray-600 text-sm">{info.value}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{info.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 sm:p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 font-heading">Informations importantes</h3>
              <div className="space-y-3">
                {importantNotes.map((note, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="text-teal-600" size={12} />
                    </div>
                    <span className="text-sm text-gray-600 leading-relaxed">{note}</span>
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

export default AppointmentSection;
