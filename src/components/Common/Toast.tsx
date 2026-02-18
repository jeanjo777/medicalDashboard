import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast,
    };

    setToasts((prev) => [...prev, newToast]);

    if (newToast.duration) {
      setTimeout(() => {
        hideToast(id);
      }, newToast.duration);
    }
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const getToastIcon = (type: ToastType) => {
    const iconProps = { size: 20, strokeWidth: 2 };
    switch (type) {
      case 'success':
        return <CheckCircle {...iconProps} className="text-green-400" />;
      case 'error':
        return <XCircle {...iconProps} className="text-red-400" />;
      case 'warning':
        return <AlertCircle {...iconProps} className="text-orange-400" />;
      case 'info':
        return <Info {...iconProps} className="text-blue-400" />;
    }
  };

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'border-green-500/50 bg-green-500/10';
      case 'error':
        return 'border-red-500/50 bg-red-500/10';
      case 'warning':
        return 'border-orange-500/50 bg-orange-500/10';
      case 'info':
        return 'border-blue-500/50 bg-blue-500/10';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <div
        className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-md"
        role="region"
        aria-label="Notifications"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              flex items-start gap-3 p-4 rounded-lg border backdrop-blur-sm
              ${getToastStyles(toast.type)}
              animate-in slide-in-from-right-5 fade-in duration-300
            `}
            role="alert"
            aria-atomic="true"
          >
            <div className="flex-shrink-0 mt-0.5">{getToastIcon(toast.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm">{toast.title}</p>
              {toast.message && (
                <p className="text-gray-300 text-xs mt-1">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => hideToast(toast.id)}
              className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
              aria-label="Fermer la notification"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
