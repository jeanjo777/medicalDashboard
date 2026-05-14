import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Brain, TrendingUp, FileText, AlertCircle, Minimize2, Maximize2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import logger from '../utils/logger';
import { getCurrentMedicId } from '../utils/auth';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  prompt: string;
}

const AIMedicalAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Bonjour ! Je suis votre assistant médical IA. Comment puis-je vous aider aujourd\'hui ?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickActions: QuickAction[] = [
    {
      id: 'analyze-risk',
      label: 'Analyser cas à risque',
      icon: <AlertCircle size={16} />,
      prompt: 'Analyse les patients à risque élevé et suggère des actions prioritaires',
    },
    {
      id: 'generate-report',
      label: 'Générer rapport',
      icon: <FileText size={16} />,
      prompt: 'Génère un compte-rendu médical des activités du jour',
    },
    {
      id: 'trends',
      label: 'Tendances du jour',
      icon: <TrendingUp size={16} />,
      prompt: 'Analyse les tendances des consultations et statistiques d\'aujourd\'hui',
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const generateAIResponse = async (action: string): Promise<string> => {
    try {
      if (action === 'risk' || action.includes('risque')) {
        const { data } = await supabase
          .from('patients')
          .select('name, first_name, last_name, riskScore, primary_pathology, status')
          .eq('medic_id', getCurrentMedicId()!)
          .gte('riskScore', 70)
          .order('riskScore', { ascending: false })
          .limit(5);

        if (!data || data.length === 0) {
          return "✅ Aucun patient à risque élevé détecté actuellement. Tous les scores de risque sont inférieurs à 70.";
        }

        let response = `🔴 **${data.length} patient(s) à risque élevé détecté(s) :**\n\n`;
        data.forEach((p, i) => {
          const name = p.first_name && p.last_name ? `${p.first_name} ${p.last_name}` : p.name;
          response += `${i + 1}. **${name}** - Score: ${p.riskScore}/100 - ${p.primary_pathology || 'Pathologie non spécifiée'} (${p.status})\n`;
        });
        response += "\n💡 **Recommandation :** Planifier des consultations de suivi prioritaires pour ces patients.";
        return response;
      }

      if (action === 'report' || action.includes('rapport')) {
        const { data: stats } = await supabase
          .from('analytics_stats')
          .select('*')
          .order('date', { ascending: false })
          .limit(1);

        const { count: totalPatients } = await supabase
          .from('patients')
          .select('id', { count: 'exact', head: true })
          .eq('medic_id', getCurrentMedicId()!);

        const { count: totalAppointments } = await supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('medic_id', getCurrentMedicId()!);

        const stat = stats?.[0];
        let response = `📊 **Rapport d'activité :**\n\n`;
        response += `- Patients totaux : **${totalPatients || 0}**\n`;
        response += `- Rendez-vous totaux : **${totalAppointments || 0}**\n`;
        if (stat) {
          response += `- Patients consultés : **${stat.patients_consultes || 0}**\n`;
          response += `- Taux RDV honorés : **${stat.rdv_honores || 0}%**\n`;
          response += `- Cas à risque : **${stat.cas_risque || 0}**\n`;
        }
        response += "\n✅ Rapport généré avec succès.";
        return response;
      }

      if (action === 'trends' || action.includes('tendance')) {
        const { data: flux } = await supabase
          .from('analytics_flux_patients')
          .select('*')
          .order('annee', { ascending: false })
          .limit(6);

        if (!flux || flux.length === 0) {
          return "📈 Aucune donnée de tendance disponible. Les données seront générées au fil de l'activité.";
        }

        let response = `📈 **Analyse des tendances récentes :**\n\n`;
        flux.forEach(f => {
          response += `- **${f.mois}** : ${f.consultations} consultations, ${f.urgences} urgences, ${f.suivis} suivis\n`;
        });
        response += "\n💡 **Tendance :** Analyse basée sur les données réelles de votre activité.";
        return response;
      }

      return "🤖 Comment puis-je vous aider ? Vous pouvez me demander une analyse de risques, un rapport d'activité ou une analyse de tendances.";
    } catch (error) {
      logger.error('AI Assistant error:', error);
      return "⚠️ Erreur lors de la récupération des données. Veuillez réessayer.";
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userInput = inputValue;
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const responseContent = await generateAIResponse(userInput);
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "⚠️ Erreur lors de la récupération des données. Veuillez réessayer.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = async (action: QuickAction) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: action.label,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const responseContent = await generateAIResponse(action.prompt);
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "⚠️ Erreur lors de la récupération des données. Veuillez réessayer.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-blue-500 to-violet-600 text-white rounded-full shadow-2xl hover:shadow-blue-500/50 hover:scale-110 transition-all duration-300 flex items-center justify-center group"
      >
        <Brain size={28} className="group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
          3
        </span>
      </button>
    );
  }

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ${
        isMinimized
          ? 'bottom-6 right-6 w-80 h-16'
          : 'bottom-6 right-6 w-96 h-[600px]'
      }`}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 h-full flex flex-col overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-violet-600 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Brain size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold flex items-center gap-2">
                Assistant IA Médical
                <Sparkles size={16} className="animate-pulse" />
              </h3>
              <p className="text-white/80 text-xs">En ligne</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                    <p
                      className={`text-xs mt-2 ${
                        message.role === 'user'
                          ? 'text-blue-100'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {formatTimestamp(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-700 rounded-2xl p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-2 mb-3">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full transition-colors border border-gray-200 dark:border-gray-700"
                  >
                    {action.icon}
                    {action.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Posez votre question..."
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-violet-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIMedicalAssistant;
