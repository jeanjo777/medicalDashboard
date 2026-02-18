import React from 'react';

const ChartLoader: React.FC = () => {
  return (
    <div className="w-full h-64 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-400">Chargement des données...</p>
      </div>
    </div>
  );
};

export default ChartLoader;
