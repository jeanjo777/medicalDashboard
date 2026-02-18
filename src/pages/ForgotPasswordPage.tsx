import React, { useState } from 'react';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import logger from '../utils/logger';

const ForgotPasswordPage = () => {
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const doctorEmail = 'simpliceake1975@gmail.com';

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-reset-password`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: doctorEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmailSent(true);
        logger.info('Reset link:', data.resetLink);
      } else {
        setError(data.error || 'Une erreur est survenue');
      }
    } catch (err) {
      logger.error('Error:', err);
      setError('Impossible de se connecter au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100"></div>

      <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 w-full max-w-md px-4">
        <a
          href="/login"
          className="inline-flex items-center text-gray-600 hover:text-primary transition-all duration-300 mb-6 group"
        >
          <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium">Retour à la connexion</span>
        </a>

        <div className="glass backdrop-blur-xl bg-white/40 p-8 sm:p-10 rounded-2xl shadow-2xl border border-white/50 animate-fade-in-up">
          {!emailSent ? (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Mail size={32} className="text-white" />
                </div>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
                Mot de passe oublié
              </h2>
              <p className="text-gray-600 text-center mb-4">
                Un lien de réinitialisation sera envoyé à votre adresse email professionnelle
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 px-4 py-3 rounded-lg text-sm mb-6">
                <p className="font-semibold mb-1">Confidentialité</p>
                <p className="text-xs leading-relaxed">
                  Cette adresse email est utilisée uniquement pour la récupération de votre compte médecin professionnel.
                  Vos données sont sécurisées et ne sont jamais partagées. Les tokens de réinitialisation sont automatiquement
                  supprimés après utilisation ou expiration (30 minutes).
                </p>
              </div>

              <form onSubmit={handleReset} className="space-y-5">
                <div className="animate-fade-in-up delay-100">
                  <label htmlFor="email" className="block mb-2 text-sm font-semibold text-gray-700">
                    Adresse email
                  </label>
                  <div className="relative group">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={doctorEmail}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-700 cursor-not-allowed"
                      disabled
                      readOnly
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Cette adresse est pré-configurée pour le compte médecin
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg text-sm animate-fade-in-up">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-semibold">Erreur</p>
                        <p className="text-xs mt-0.5">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-primary to-blue-600 text-white py-3.5 rounded-xl font-bold hover:shadow-2xl transform hover:scale-105 transition-all duration-300 animate-fade-in-up delay-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 group-hover:animate-shimmer"></div>
                  <span className="relative z-10">
                    {isLoading ? 'Envoi en cours...' : 'Recevoir le lien de réinitialisation'}
                  </span>
                </button>
              </form>
            </>
          ) : (
            <div className="text-center animate-fade-in-up">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <CheckCircle size={32} className="text-white" />
                </div>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Email envoyé !
              </h2>

              <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg text-sm mb-6 text-left">
                <p className="font-semibold mb-2">Lien de réinitialisation envoyé</p>
                <p className="text-xs leading-relaxed mb-2">
                  Un lien de réinitialisation sécurisé a été envoyé à l'adresse <strong>{doctorEmail}</strong>.
                </p>
                <p className="text-xs leading-relaxed">
                  Vérifiez votre boîte de réception et cliquez sur le lien pour réinitialiser votre mot de passe.
                </p>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-700 px-4 py-3 rounded-lg text-sm mb-6 text-left">
                <p className="font-semibold mb-1 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Expiration dans 30 minutes
                </p>
                <p className="text-xs leading-relaxed">
                  Pour votre sécurité, ce lien expirera automatiquement dans 30 minutes et ne peut être utilisé qu'une seule fois.
                  Après utilisation, il sera automatiquement supprimé de nos serveurs.
                </p>
              </div>

              <a
                href="/login"
                className="inline-flex items-center justify-center bg-gradient-to-r from-primary to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Retour à la connexion
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
