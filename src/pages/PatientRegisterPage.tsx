import React, { useState } from 'react';
import { UserPlus, ArrowLeft, User, Mail, Calendar, Users } from 'lucide-react';
import logger from '../utils/logger';

const PatientRegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    age: '',
    gender: 'male',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [patientId, setPatientId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const apiUrl = `${window.location.origin}/functions/v1/register-patient`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          age: formData.age ? parseInt(formData.age) : undefined,
          gender: formData.gender,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setPatientId(data.patientId);
      } else {
        setError(data.error || 'Une erreur est survenue');
      }
    } catch (err) {
      logger.error('Error:', err);
      setError('Impossible de se connecter au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100"></div>

      <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 w-full max-w-md px-4">
        <a
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-primary transition-all duration-300 mb-6 group"
        >
          <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium">Retour à l'accueil</span>
        </a>

        <div className="glass backdrop-blur-xl bg-white/40 p-8 sm:p-10 rounded-2xl shadow-2xl border border-white/50 animate-fade-in-up">
          {!success ? (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <UserPlus size={32} className="text-white" />
                </div>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
                Créer un compte patient
              </h2>
              <p className="text-gray-600 text-center mb-4">
                Inscrivez-vous pour accéder aux consultations IA
              </p>

              <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 px-4 py-3 rounded-lg text-sm mb-6">
                <p className="font-semibold mb-1">Confidentialité</p>
                <p className="text-xs leading-relaxed">
                  Vos données personnelles sont sécurisées et protégées. Elles ne seront jamais partagées
                  avec des tiers sans votre consentement.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="animate-fade-in-up delay-100">
                  <label htmlFor="name" className="block mb-2 text-sm font-semibold text-gray-700">
                    Nom complet *
                  </label>
                  <div className="relative group">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-300" />
                    <input
                      id="name"
                      type="text"
                      className="w-full pl-12 pr-4 py-3.5 bg-white/60 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 hover:bg-white/80 hover:shadow-md"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Jean Dupont"
                      required
                    />
                  </div>
                </div>

                <div className="animate-fade-in-up delay-200">
                  <label htmlFor="email" className="block mb-2 text-sm font-semibold text-gray-700">
                    Adresse email *
                  </label>
                  <div className="relative group">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-300" />
                    <input
                      id="email"
                      type="email"
                      className="w-full pl-12 pr-4 py-3.5 bg-white/60 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 hover:bg-white/80 hover:shadow-md"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jean.dupont@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="animate-fade-in-up delay-300">
                    <label htmlFor="age" className="block mb-2 text-sm font-semibold text-gray-700">
                      Âge
                    </label>
                    <div className="relative group">
                      <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-300" />
                      <input
                        id="age"
                        type="number"
                        min="0"
                        max="150"
                        className="w-full pl-12 pr-4 py-3.5 bg-white/60 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 hover:bg-white/80 hover:shadow-md"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        placeholder="35"
                      />
                    </div>
                  </div>

                  <div className="animate-fade-in-up delay-300">
                    <label htmlFor="gender" className="block mb-2 text-sm font-semibold text-gray-700">
                      Sexe
                    </label>
                    <div className="relative group">
                      <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-300" />
                      <select
                        id="gender"
                        className="w-full pl-12 pr-4 py-3.5 bg-white/60 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 hover:bg-white/80 hover:shadow-md appearance-none"
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      >
                        <option value="male">Homme</option>
                        <option value="female">Femme</option>
                        <option value="child_boy">Enfant (Garçon)</option>
                        <option value="child_girl">Enfant (Fille)</option>
                        <option value="other">Autre</option>
                      </select>
                    </div>
                  </div>
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
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary to-blue-600 text-white py-3.5 rounded-xl font-bold hover:shadow-2xl transform hover:scale-105 transition-all duration-300 animate-fade-in-up delay-400 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 group-hover:animate-shimmer"></div>
                  <span className="relative z-10">
                    {loading ? 'Création en cours...' : 'Créer mon compte'}
                  </span>
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-600">
                <p>
                  Vous avez déjà un compte ?{' '}
                  <a href="/login" className="text-primary font-semibold hover:text-blue-700 transition-colors">
                    Se connecter
                  </a>
                </p>
              </div>
            </>
          ) : (
            <div className="text-center animate-fade-in-up">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <UserPlus size={32} className="text-white" />
                </div>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Compte créé avec succès !
              </h2>

              <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg text-sm mb-6 text-left">
                <p className="font-semibold mb-2">Bienvenue dans notre plateforme</p>
                <p className="text-xs leading-relaxed mb-2">
                  Votre compte patient a été créé avec succès. Vous pouvez maintenant accéder au tableau de bord
                  et créer vos consultations IA.
                </p>
                <p className="text-xs leading-relaxed">
                  <strong>ID patient :</strong> <code className="bg-green-100 px-2 py-1 rounded">{patientId}</code>
                </p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 px-4 py-3 rounded-lg text-sm mb-6 text-left">
                <p className="font-semibold mb-1">Prochaines étapes</p>
                <ul className="text-xs space-y-1 list-disc list-inside">
                  <li>Accédez à votre tableau de bord patient</li>
                  <li>Créez votre première consultation IA</li>
                  <li>Suivez l'historique de vos consultations</li>
                </ul>
              </div>

              <a
                href="/patient-dashboard"
                className="inline-flex items-center justify-center bg-gradient-to-r from-primary to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Accéder au tableau de bord
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientRegisterPage;
