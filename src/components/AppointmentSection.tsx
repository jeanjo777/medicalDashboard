import React, { useState } from 'react';
import { Phone, Mail, Calendar, CheckCircle } from 'lucide-react';
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
      alert('Veuillez remplir tous les champs obligatoires.');
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Préparer les données pour Supabase
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

      // Sauvegarder dans Supabase
      const { error: supabaseError } = await supabase
        .from('appointment_requests')
        .insert([appointmentData]);

      if (supabaseError) {
        logger.error('Erreur Supabase:', supabaseError);
        throw new Error(supabaseError.message);
      }

      // Optionnel: envoyer également au webhook pour notification immédiate
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
      subtitle: "Disponible 7j/7 de 7h à 20h"
    },
    {
      icon: Phone,
      title: "Téléphone secondaire",
      value: "+225 07 47 52 42 26",
      subtitle: "Ligne alternative"
    },
    {
      icon: Mail,
      title: "Email principal",
      value: "simpliceake1975@gmail.com",
      subtitle: "Réponse sous 24h"
    },
    {
      icon: Mail,
      title: "Email secondaire",
      value: "simplice_ake@yahoo.fr",
      subtitle: "Email alternatif"
    },
    {
      icon: Calendar,
      title: "Horaires",
      value: "Lundi au vendredi : 7h - 20h",
      subtitle: "Samedi et dimanche : 8h - 18h"
    }
  ];

  const importantNotes = [
    "Pour les soins urgents, privilégiez le contact téléphonique",
    "Pensez à préparer votre carte d'assurance maladie et votre prescription médicale",
    "Annulation : merci de prévenir au moins 24h à l'avance"
  ];

  return (
    <section id="rendez-vous" className="py-12 sm:py-16 bg-secondary bg-opacity-20 section-mobile">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 font-heading">Prendre rendez-vous</h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
            Pour planifier un soin ou obtenir des informations, vous pouvez me contacter par téléphone 
            ou via le formulaire ci-dessous.
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          <div className="w-full lg:w-1/2">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6 font-heading">Formulaire de contact</h3>
              
              {!formSubmitted ? (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                    <div>
                      <label htmlFor="firstname" className="block text-gray-700 mb-2 font-medium text-sm sm:text-base">Prénom</label>
                      <input 
                        type="text" 
                        id="firstname"
                        name="firstname"
                        value={formData.firstname}
                        onChange={handleInputChange}
                        className="input-enhanced text-base" 
                        required 
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="lastname" className="block text-gray-700 mb-2 font-medium text-sm sm:text-base">Nom</label>
                      <input 
                        type="text" 
                        id="lastname"
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleInputChange}
                        className="input-enhanced text-base" 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4 sm:mb-6">
                    <label htmlFor="phone" className="block text-gray-700 mb-2 font-medium text-sm sm:text-base">Téléphone</label>
                    <input 
                      type="tel" 
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="input-enhanced text-base" 
                      required 
                    />
                  </div>
                  
                  <div className="mb-4 sm:mb-6">
                    <label htmlFor="email" className="block text-gray-700 mb-2 font-medium text-sm sm:text-base">Email</label>
                    <input 
                      type="email" 
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input-enhanced text-base" 
                      required 
                    />
                  </div>
                  
                  <div className="mb-4 sm:mb-6">
                    <label htmlFor="service" className="block text-gray-700 mb-2 font-medium text-sm sm:text-base">Type de soin</label>
                    <select 
                      id="service"
                      name="service"
                      value={formData.service}
                      onChange={handleInputChange}
                      className="input-enhanced text-base appearance-none"
                    >
                      {serviceOptions.map((option, index) => (
                        <option key={index} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-4 sm:mb-6">
                    <label htmlFor="message" className="block text-gray-700 mb-2 font-medium text-sm sm:text-base">Message / Précisions</label>
                    <textarea 
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="input-enhanced text-base resize-none"
                    ></textarea>
                  </div>
                  
                  <div className="mb-4 sm:mb-6">
                    <div className="custom-checkbox">
                      <input 
                        type="checkbox" 
                        id="consent"
                        name="consent"
                        checked={formData.consent}
                        onChange={handleInputChange}
                        required 
                      />
                      <label htmlFor="consent" className="text-gray-700 text-sm sm:text-base cursor-pointer">
                        J'accepte que mes données soient utilisées uniquement pour me recontacter
                      </label>
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="btn-primary w-full touch-target disabled:opacity-50 disabled:cursor-not-allowed"
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
                      'Envoyer ma demande'
                    )}
                  </button>
                  
                  {submitError && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 text-sm">{submitError}</p>
                      <div className="mt-2 flex flex-col sm:flex-row gap-2">
                        <a
                          href="tel:+2250505831146"
                          className="text-red-600 hover:text-red-800 font-medium text-sm underline"
                        >
                          Appelez-moi : 05 05 83 11 46
                        </a>
                        <a
                          href="mailto:simpliceake1975@gmail.com"
                          className="text-red-600 hover:text-red-800 font-medium text-sm underline"
                        >
                          Email : simpliceake1975@gmail.com
                        </a>
                      </div>
                    </div>
                  )}
                </form>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="text-green-500" size={window.innerWidth < 640 ? 24 : 32} />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Demande envoyée avec succès !</h3>
                  <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                    Merci {formData.firstname} pour votre message. Je vous recontacterai dans les plus brefs délais au {formData.phone}.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-blue-800 text-sm">
                      <strong>Prochaines étapes :</strong><br/>
                      • Je vous appellerai sous 24h pour confirmer le rendez-vous<br/>
                      • Préparez votre carte d'assurance et prescription médicale<br/>
                      • En cas d'urgence, appelez-moi directement au 05 05 83 11 46
                    </p>
                  </div>
                  <button 
                    onClick={resetForm}
                    className="btn-primary w-full sm:w-auto"
                  >
                    Envoyer un nouveau message
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="w-full lg:w-1/2">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6 font-heading">Informations de contact</h3>
              
              <div className="space-y-4 sm:space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-secondary flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                      <info.icon className="text-primary" size={18} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">{info.title}</h4>
                      <p className="text-gray-600 text-sm sm:text-base">{info.value}</p>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">{info.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6 font-heading">Informations importantes</h3>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">À retenir</h4>
                <ul className="space-y-2 text-gray-600">
                  {importantNotes.map((note, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="text-primary mr-2 mt-1 flex-shrink-0" size={16} />
                      <span className="leading-relaxed text-sm sm:text-base">{note}</span>
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

export default AppointmentSection;