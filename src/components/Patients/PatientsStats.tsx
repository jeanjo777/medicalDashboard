import React from 'react';
import { Users, Activity, AlertTriangle, TrendingUp, Calendar, UserCheck } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PatientsStatsProps {
  patients: any[];
}

const PatientsStats: React.FC<PatientsStatsProps> = ({ patients }) => {
  const totalPatients = patients.length;
  const totalConsultations = patients.reduce((acc, p) => acc + (p.totalConsultations || 0), 0);
  const pendingConsultations = patients.reduce((acc, p) => acc + (p.pendingConsultations || 0), 0);
  const highRiskPatients = patients.filter(p => p.riskScore && p.riskScore >= 70).length;

  const genderData = [
    { name: 'Hommes', value: patients.filter(p => p.gender === 'male').length, color: '#3b82f6' },
    { name: 'Femmes', value: patients.filter(p => p.gender === 'female').length, color: '#ec4899' },
    { name: 'Garçons', value: patients.filter(p => p.gender === 'child_boy').length, color: '#f59e0b' },
    { name: 'Filles', value: patients.filter(p => p.gender === 'child_girl').length, color: '#f97316' },
    { name: 'Autres', value: patients.filter(p => p.gender === 'other' || !p.gender).length, color: '#8b5cf6' },
  ].filter(item => item.value > 0);

  const ageGroups = [
    { name: '0-18 ans', value: patients.filter(p => p.age && p.age <= 18).length, color: '#10b981' },
    { name: '19-35 ans', value: patients.filter(p => p.age && p.age > 18 && p.age <= 35).length, color: '#3b82f6' },
    { name: '36-50 ans', value: patients.filter(p => p.age && p.age > 35 && p.age <= 50).length, color: '#f59e0b' },
    { name: '51-65 ans', value: patients.filter(p => p.age && p.age > 50 && p.age <= 65).length, color: '#ef4444' },
    { name: '66+ ans', value: patients.filter(p => p.age && p.age > 65).length, color: '#8b5cf6' },
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{payload[0].name}</p>
          <p className="text-sm text-primary dark:text-blue-400">
            {payload[0].value} patient{payload[0].value > 1 ? 's' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-xl border border-white/50 dark:border-gray-700/50 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
              <Users size={24} className="text-white" />
            </div>
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{totalPatients}</span>
          </div>
          <h3 className="text-gray-600 dark:text-gray-300 font-medium">Patients totaux</h3>
        </div>

        <div className="glass backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-xl border border-white/50 dark:border-gray-700/50 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600">
              <Activity size={24} className="text-white" />
            </div>
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{totalConsultations}</span>
          </div>
          <h3 className="text-gray-600 dark:text-gray-300 font-medium">Consultations totales</h3>
        </div>

        <div className="glass backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-xl border border-white/50 dark:border-gray-700/50 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-yellow-500 to-yellow-600">
              <TrendingUp size={24} className="text-white" />
            </div>
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{pendingConsultations}</span>
          </div>
          <h3 className="text-gray-600 dark:text-gray-300 font-medium">En attente</h3>
        </div>

        <div className="glass backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-xl border border-white/50 dark:border-gray-700/50 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600">
              <AlertTriangle size={24} className="text-white" />
            </div>
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{highRiskPatients}</span>
          </div>
          <h3 className="text-gray-600 dark:text-gray-300 font-medium">Patients à risque</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-xl border border-white/50 dark:border-gray-700/50 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Répartition par sexe</h3>
          {genderData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-500 dark:text-gray-400">
              Aucune donnée disponible
            </div>
          )}
        </div>

        <div className="glass backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-xl border border-white/50 dark:border-gray-700/50 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Répartition par âge</h3>
          {ageGroups.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={ageGroups}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ageGroups.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-500 dark:text-gray-400">
              Aucune donnée disponible
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientsStats;
