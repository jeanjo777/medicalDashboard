import React from 'react';

type PatientStatus = 'active' | 'in_treatment' | 'recovered' | 'inactive';

interface PatientStatusBadgeProps {
  status: PatientStatus;
  size?: 'sm' | 'md' | 'lg';
}

const PatientStatusBadge: React.FC<PatientStatusBadgeProps> = ({ status, size = 'md' }) => {
  const statusConfig = {
    active: {
      label: 'Actif',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-500',
      borderColor: 'border-blue-500/20',
      dotColor: 'bg-blue-500'
    },
    in_treatment: {
      label: 'En Traitement',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-500',
      borderColor: 'border-purple-500/20',
      dotColor: 'bg-purple-500'
    },
    recovered: {
      label: 'Guéri',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-500',
      borderColor: 'border-green-500/20',
      dotColor: 'bg-green-500'
    },
    inactive: {
      label: 'Inactif',
      bgColor: 'bg-gray-500/10',
      textColor: 'text-gray-500',
      borderColor: 'border-gray-500/20',
      dotColor: 'bg-gray-500'
    }
  };

  const sizeConfig = {
    sm: {
      padding: 'px-2 py-0.5',
      text: 'text-xs',
      dot: 'w-1.5 h-1.5'
    },
    md: {
      padding: 'px-2.5 py-1',
      text: 'text-xs',
      dot: 'w-2 h-2'
    },
    lg: {
      padding: 'px-3 py-1.5',
      text: 'text-sm',
      dot: 'w-2.5 h-2.5'
    }
  };

  const config = statusConfig[status];
  const sizeStyles = sizeConfig[size];

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        ${sizeStyles.padding}
        ${config.bgColor}
        ${config.textColor}
        border ${config.borderColor}
        rounded-full
        font-medium
        ${sizeStyles.text}
        transition-colors
      `}
    >
      <span className={`${sizeStyles.dot} ${config.dotColor} rounded-full`} />
      {config.label}
    </span>
  );
};

export default PatientStatusBadge;
