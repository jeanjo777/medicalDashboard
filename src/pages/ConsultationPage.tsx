import React, { useState, useRef, useEffect } from 'react';
import { Send, Activity, Clock, AlertCircle, ArrowLeft, Loader, MessageCircle, AlertTriangle } from 'lucide-react';
import logger from '../utils/logger';

interface Message {
  from: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

const urgencyConfig: Record<UrgencyLevel, { label: string; color: string; bgColor: string; icon: boolean }> = {
  low: { label: 'Faible', color: 'text-green-700', bgColor: 'bg-green-50 border-green-200', icon: false },
  medium: { label: 'Modere', color: 'text-yellow-700', bgColor: 'bg-yellow-50 border-yellow-200', icon: false },
  high: { label: 'Eleve', color: 'text-orange-700', bgColor: 'bg-orange-50 border-orange-200', icon: true },
  critical: { label: 'Critique', color: 'text-red-700', bgColor: 'bg-red-50 border-red-200', icon: true },
};

const ConsultationPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [symptom, setSymptom] = useState('');
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState('medium');
  const [otherSigns, setOtherSigns] = useState('');
  const [loading, setLoading] = useState(false);
  const [consultationStarted, setConsultationStarted] = useState(false);
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [urgencyLevel, setUrgencyLevel] = useState<UrgencyLevel | null>(null);
  const [followUpMessage, setFollowUpMessage] = useState('');
  const [sendingFollowUp, setSendingFollowUp] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startConsultation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!symptom.trim()) {
      return;
    }

    setLoading(true);
    setConsultationStarted(true);

    const userMessage: Message = {
      from: 'user',
      text: `Symptômes: ${symptom}${duration ? ` | Durée: ${duration}` : ''}${intensity ? ` | Intensité: ${intensity}` : ''}${otherSigns ? ` | Autres signes: ${otherSigns}` : ''}`,
      timestamp: new Date(),
    };

    setMessages([userMessage]);

    try {
      // TEMP: Auth check disabled for testing
      const token = localStorage.getItem('auth_token') || 'mock-token-for-testing';
      // if (!token) {
      //   window.location.href = '/login';
      //   return;
      // }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-consultation`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symptoms: symptom,
          duration: duration || undefined,
          intensity: intensity || undefined,
          otherSigns: otherSigns || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data?.consultation) {
        // Store consultation ID for follow-up messages
        setConsultationId(data.consultation.id);
        setUrgencyLevel(data.consultation.urgencyLevel || 'medium');

        const aiMessage: Message = {
          from: 'ai',
          text: data.consultation.aiResponse || 'Analyse terminée.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);

        if (data.consultation.diagnosisSummary || data.consultation.recommendations) {
          setTimeout(() => {
            const summaryMessage: Message = {
              from: 'ai',
              text: `📋 Résumé: ${data.consultation.diagnosisSummary || 'N/A'}\n\n💡 Recommandations: ${data.consultation.recommendations || 'N/A'}`,
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, summaryMessage]);
          }, 1000);
        }
      } else {
        const errorMessage: Message = {
          from: 'ai',
          text: `Erreur: ${data.error || 'Une erreur est survenue'}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (err: unknown) {
      logger.error('Error:', err instanceof Error ? err : undefined);
      const errorMessage: Message = {
        from: 'ai',
        text: 'Impossible de se connecter au serveur. Veuillez réessayer.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const resetConsultation = () => {
    setMessages([]);
    setSymptom('');
    setDuration('');
    setIntensity('medium');
    setOtherSigns('');
    setConsultationStarted(false);
    setConsultationId(null);
    setUrgencyLevel(null);
    setFollowUpMessage('');
  };

  const sendFollowUpMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!followUpMessage.trim() || !consultationId) {
      return;
    }

    setSendingFollowUp(true);

    const userMessage: Message = {
      from: 'user',
      text: followUpMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setFollowUpMessage('');

    try {
      // TEMP: Auth check disabled for testing
      const token = localStorage.getItem('auth_token') || 'mock-token-for-testing';
      // if (!token) {
      //   window.location.href = '/login';
      //   return;
      // }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-consultation`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          consultation_id: consultationId,
          message: userMessage.text,
        }),
      });

      const data = await response.json();

      if (response.ok && data.message) {
        const aiMessage: Message = {
          from: 'ai',
          text: data.message.message,
          timestamp: new Date(data.message.created_at),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        const errorMessage: Message = {
          from: 'ai',
          text: data.error || 'Une erreur est survenue lors de l\'envoi du message.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (err: unknown) {
      logger.error('Follow-up error:', err instanceof Error ? err : undefined);
      const errorMessage: Message = {
        from: 'ai',
        text: 'Impossible de se connecter au serveur. Veuillez réessayer.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setSendingFollowUp(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-6">
          <a
            href="/patient-dashboard"
            className="inline-flex items-center text-gray-600 hover:text-primary transition-all duration-300 mb-4 group"
          >
            <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">Retour au tableau de bord</span>
          </a>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Consultation IA Médicale</h1>
          <p className="text-gray-600">Décrivez vos symptômes pour une analyse préliminaire</p>
        </div>

        {!consultationStarted ? (
          <div className="glass backdrop-blur-xl bg-white/60 rounded-2xl shadow-xl border border-white/50 p-8 animate-fade-in-up">
            <div className="mb-6">
              <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 px-4 py-3 rounded-lg text-sm">
                <p className="font-semibold mb-1 flex items-center gap-2">
                  <AlertCircle size={16} />
                  Information importante
                </p>
                <p className="text-xs leading-relaxed">
                  Cette consultation IA ne remplace pas un avis médical professionnel. En cas de symptômes graves,
                  contactez immédiatement un médecin ou les urgences.
                </p>
              </div>
            </div>

            <form onSubmit={startConsultation} className="space-y-6">
              <div className="animate-fade-in-up delay-100">
                <label htmlFor="symptom" className="block mb-2 text-sm font-semibold text-gray-700">
                  Symptômes principaux *
                </label>
                <div className="relative group">
                  <Activity size={18} className="absolute left-4 top-4 text-gray-400 group-focus-within:text-primary transition-colors duration-300" />
                  <textarea
                    id="symptom"
                    className="w-full pl-12 pr-4 py-3.5 bg-white/60 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 hover:bg-white/80 hover:shadow-md resize-none"
                    value={symptom}
                    onChange={(e) => setSymptom(e.target.value)}
                    placeholder="Décrivez vos symptômes en détail..."
                    rows={4}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up delay-200">
                <div>
                  <label htmlFor="duration" className="block mb-2 text-sm font-semibold text-gray-700">
                    Depuis quand ?
                  </label>
                  <div className="relative group">
                    <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-300" />
                    <input
                      id="duration"
                      type="text"
                      className="w-full pl-12 pr-4 py-3.5 bg-white/60 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 hover:bg-white/80 hover:shadow-md"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="Ex: 2 jours, 1 semaine..."
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="intensity" className="block mb-2 text-sm font-semibold text-gray-700">
                    Intensité
                  </label>
                  <select
                    id="intensity"
                    className="w-full px-4 py-3.5 bg-white/60 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 hover:bg-white/80 hover:shadow-md"
                    value={intensity}
                    onChange={(e) => setIntensity(e.target.value)}
                  >
                    <option value="low">Faible</option>
                    <option value="medium">Modérée</option>
                    <option value="high">Élevée</option>
                  </select>
                </div>
              </div>

              <div className="animate-fade-in-up delay-300">
                <label htmlFor="otherSigns" className="block mb-2 text-sm font-semibold text-gray-700">
                  Autres signes
                </label>
                <textarea
                  id="otherSigns"
                  className="w-full px-4 py-3.5 bg-white/60 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 hover:bg-white/80 hover:shadow-md resize-none"
                  value={otherSigns}
                  onChange={(e) => setOtherSigns(e.target.value)}
                  placeholder="Autres symptômes, contexte médical..."
                  rows={3}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !symptom.trim()}
                className="w-full bg-gradient-to-r from-primary to-blue-600 text-white py-3.5 rounded-xl font-bold hover:shadow-2xl transform hover:scale-105 transition-all duration-300 animate-fade-in-up delay-400 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 group-hover:animate-shimmer"></div>
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      Analyse en cours...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Lancer l'analyse IA
                    </>
                  )}
                </span>
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Urgency Badge */}
            {urgencyLevel && (
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${urgencyConfig[urgencyLevel].bgColor} animate-fade-in-up`}>
                {urgencyConfig[urgencyLevel].icon && (
                  <AlertTriangle className={urgencyConfig[urgencyLevel].color} size={20} />
                )}
                <div>
                  <p className={`text-sm font-semibold ${urgencyConfig[urgencyLevel].color}`}>
                    Niveau d'urgence: {urgencyConfig[urgencyLevel].label}
                  </p>
                  {urgencyLevel === 'critical' && (
                    <p className="text-xs text-red-600 mt-1">
                      Consultez immediatement un medecin ou rendez-vous aux urgences.
                    </p>
                  )}
                  {urgencyLevel === 'high' && (
                    <p className="text-xs text-orange-600 mt-1">
                      Une consultation medicale rapide est recommandee (24-48h).
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="glass backdrop-blur-xl bg-white/60 rounded-2xl shadow-xl border border-white/50 p-6 animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <MessageCircle size={20} className="text-primary" />
                  Conversation
                </h3>
                <button
                  onClick={resetConsultation}
                  className="text-sm text-primary hover:text-blue-700 font-semibold transition-colors duration-300"
                >
                  Nouvelle consultation
                </button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.from === 'user'
                          ? 'bg-gradient-to-r from-primary to-blue-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-800'
                      } shadow-md`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-semibold mb-1">
                            {msg.from === 'user' ? 'Vous' : 'Assistant IA'}
                          </p>
                          <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                          <p className={`text-xs mt-2 ${msg.from === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                            {msg.timestamp.toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {(loading || sendingFollowUp) && (
                  <div className="flex justify-start animate-fade-in-up">
                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-md">
                      <div className="flex items-center gap-2">
                        <Loader className="animate-spin text-primary" size={16} />
                        <p className="text-sm text-gray-600">
                          {loading ? "L'IA analyse vos symptômes..." : "Envoi en cours..."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Follow-up Message Input */}
              {consultationId && !loading && (
                <form onSubmit={sendFollowUpMessage} className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={followUpMessage}
                      onChange={(e) => setFollowUpMessage(e.target.value)}
                      placeholder="Posez une question de suivi..."
                      className="flex-1 px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
                      disabled={sendingFollowUp}
                    />
                    <button
                      type="submit"
                      disabled={sendingFollowUp || !followUpMessage.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {sendingFollowUp ? (
                        <Loader className="animate-spin" size={18} />
                      ) : (
                        <Send size={18} />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Continuez la conversation pour obtenir plus de details sur votre situation.
                  </p>
                </form>
              )}
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-700 px-4 py-3 rounded-lg text-sm animate-fade-in-up">
              <p className="font-semibold mb-1 flex items-center gap-2">
                <AlertCircle size={16} />
                Rappel important
              </p>
              <p className="text-xs leading-relaxed">
                Cette analyse est préliminaire. Consultez toujours un professionnel de santé pour un diagnostic précis
                et un traitement adapté.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationPage;
