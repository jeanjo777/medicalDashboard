import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Lock, Eye, EyeOff, Loader2, Activity } from 'lucide-react';
import logger from '../utils/logger';

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-login`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      logger.info('[LOGIN] Response received:', {
        status: response.status,
        ok: response.ok,
        success: data.success,
        hasToken: !!data.token,
        hasUser: !!data.user
      });

      if (response.ok && data.success) {
        logger.info('[LOGIN] Authentication successful');
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard', { replace: true });
      } else {
        if (response.status === 429) {
          setError(data.error || 'Trop de tentatives. Veuillez réessayer plus tard');
        } else {
          setError('Identifiant ou mot de passe incorrect');
        }
      }
    } catch (err) {
      logger.error('Login error:', err);
      setError('Impossible de se connecter au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-cyan-50"></div>

      {/* Floating shapes */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-600/8 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl"></div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Back to home */}
        <a
          href="/"
          className="inline-flex items-center text-gray-500 hover:text-cyan-700 transition-all duration-200 mb-6 group"
        >
          <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
          <span className="font-medium text-sm">Retour à l'accueil</span>
        </a>

        {/* Login card */}
        <div className="backdrop-blur-xl bg-white/70 p-8 sm:p-10 rounded-2xl shadow-xl border border-white/60 animate-fade-in-up">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-600/20">
              <Activity size={30} className="text-white" strokeWidth={2.5} />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1 text-center font-heading">
            Medical AI
          </h2>
          <p className="text-gray-500 text-sm text-center mb-8">Connectez-vous à votre tableau de bord</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="username" className="block mb-2 text-sm font-semibold text-gray-700">
                Nom d'utilisateur
              </label>
              <div className="relative group">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-600 transition-colors duration-200" />
                <input
                  id="username"
                  type="text"
                  className="w-full pl-12 pr-4 py-3.5 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-600/30 focus:border-cyan-600 transition-all duration-200 text-gray-900 placeholder:text-gray-400"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Entrez votre nom d'utilisateur"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-semibold text-gray-700">
                Mot de passe
              </label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-600 transition-colors duration-200" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-12 pr-12 py-3.5 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-600/30 focus:border-cyan-600 transition-all duration-200 text-gray-900 placeholder:text-gray-400"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Entrez votre mot de passe"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-600 transition-colors duration-200 cursor-pointer"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm text-center flex items-center justify-center gap-2" role="alert">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-700 to-teal-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-600/20 transition-all duration-200 relative overflow-hidden cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading && <Loader2 size={18} className="animate-spin" />}
                {isLoading ? 'Connexion en cours...' : 'Se connecter'}
              </span>
            </button>

            <div className="text-center">
              <a
                href="/forgot-password"
                className="text-sm text-cyan-700 hover:text-cyan-800 font-medium transition-colors duration-200 hover:underline"
              >
                Mot de passe oublié ?
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
