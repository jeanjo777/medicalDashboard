import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ChartErrorProps {
  message?: string;
  onRetry?: () => void;
}

const ChartError: React.FC<ChartErrorProps> = ({
  message = "Erreur lors du chargement des données",
  onRetry
}) => {
  return (
    <div className="w-full h-64 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-red-500/20 rounded-full mb-4">
          <AlertCircle size={24} className="text-red-400" />
        </div>
        <p className="text-gray-400 mb-4">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Réessayer
          </button>
        )}
      </div>
    </div>
  );
};

export default ChartError;
