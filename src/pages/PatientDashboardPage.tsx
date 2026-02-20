import React, { useEffect, useState } from 'react';
import { User, Calendar, Activity, Plus, TrendingUp } from 'lucide-react';
import logger from '../utils/logger';

interface PatientSummary {
  name: string;
  age: number;
  gender: string;
  profilePic: string;
  registeredAt: string;
  lastConsultations: Array<{
    id: string;
    date: string;
    topic: string;
    resultSummary: string;
    status: string;
  }>;
  chartsData: Array<{
    date: string;
    symptomCount: number;
  }>;
  totalConsultations: number;
}

const PatientDashboardPage = () => {
  const [summary, setSummary] = useState<PatientSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          window.location.replace('/login');
          return;
        }

        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-patient-summary`;

        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch patient data');
        }

        const data = await response.json();
        setSummary(data);
      } catch (err) {
        logger.error('Error:', err);
        setError('Impossible de charger les données du patient');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg max-w-md">
          <p className="font-semibold">Erreur</p>
          <p className="text-sm">{error || 'Une erreur est survenue'}</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
      reviewed: 'bg-blue-100 text-blue-800 border-blue-300',
    };
    const labels = {
      pending: 'En attente',
      completed: 'Terminé',
      reviewed: 'Vérifié',
    };
    return (
      <span className={`text-xs px-2 py-1 rounded-full border ${styles[status as keyof typeof styles] || styles.pending}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Tableau de bord</h1>
          <p className="text-gray-600">Bienvenue sur votre espace personnel de santé</p>
        </div>

        <div className="glass backdrop-blur-xl bg-white/60 rounded-2xl shadow-xl border border-white/50 p-8 mb-8 animate-fade-in-up">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src={summary.profilePic}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-primary/20 shadow-lg object-cover"
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{summary.name}</h2>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <User size={16} className="text-primary" />
                  <span>{summary.age} ans • {summary.gender === 'male' ? 'Homme' : summary.gender === 'female' ? 'Femme' : 'Autre'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={16} className="text-primary" />
                  <span>Inscrit le {summary.registeredAt}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity size={16} className="text-primary" />
                  <span>{summary.totalConsultations} consultation{summary.totalConsultations > 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="glass backdrop-blur-xl bg-white/60 rounded-2xl shadow-xl border border-white/50 p-6 animate-fade-in-up delay-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Activity className="text-primary" size={24} />
                Consultations récentes
              </h3>
            </div>
            {summary.lastConsultations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-sm">Aucune consultation pour le moment</p>
                <p className="text-xs mt-2">Commencez par créer votre première consultation</p>
              </div>
            ) : (
              <div className="space-y-4">
                {summary.lastConsultations.map((consult) => (
                  <div
                    key={consult.id}
                    className="bg-white/70 rounded-xl p-4 border border-gray-200 hover:border-primary/50 transition-all duration-300 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{consult.topic}</p>
                        <p className="text-xs text-gray-500 mt-1">{consult.date}</p>
                      </div>
                      {getStatusBadge(consult.status)}
                    </div>
                    <p className="text-xs text-gray-600 mt-2">{consult.resultSummary}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass backdrop-blur-xl bg-white/60 rounded-2xl shadow-xl border border-white/50 p-6 animate-fade-in-up delay-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="text-primary" size={24} />
                Statistiques
              </h3>
            </div>
            {summary.chartsData.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <TrendingUp size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-sm">Pas encore de données statistiques</p>
                <p className="text-xs mt-2">Créez des consultations pour voir vos statistiques</p>
              </div>
            ) : (
              <div className="space-y-4">
                {summary.chartsData.map((data, index) => {
                  const maxValue = Math.max(...summary.chartsData.map(d => d.symptomCount));
                  const height = maxValue > 0 ? (data.symptomCount / maxValue) * 100 : 0;

                  return (
                    <div key={index} className="flex items-end gap-3">
                      <div className="text-xs text-gray-600 font-medium w-20 text-right">
                        {data.date}
                      </div>
                      <div className="flex-1 bg-gray-100 rounded-lg h-8 relative overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-primary h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-3"
                          style={{ width: `${height}%` }}
                        >
                          {height > 20 && (
                            <span className="text-white text-xs font-bold">
                              {data.symptomCount}
                            </span>
                          )}
                        </div>
                      </div>
                      {height <= 20 && (
                        <span className="text-gray-700 text-xs font-bold w-6">
                          {data.symptomCount}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Consultation IA button hidden for now
        <div className="flex justify-center animate-fade-in-up delay-300">
          <button
            onClick={() => (window.location.href = '/consultation')}
            className="group relative bg-gradient-to-r from-primary to-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 group-hover:animate-shimmer"></div>
            <span className="relative z-10 flex items-center gap-2">
              <Plus size={20} />
              Nouvelle consultation IA
            </span>
          </button>
        </div>
        */}
      </div>
    </div>
  );
};

export default PatientDashboardPage;
