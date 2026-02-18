import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import logger from '../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('[ErrorBoundary] Error caught:', error);
    logger.error('[ErrorBoundary] Error info:', errorInfo);
    logger.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);

    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    logger.info('[ErrorBoundary] Resetting error state');
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      logger.info('[ErrorBoundary] Rendering error UI');

      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-red-500/50 rounded-xl p-8 max-w-2xl w-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-600/10 rounded-lg flex items-center justify-center">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Une erreur s'est produite</h1>
                <p className="text-gray-400 text-sm">
                  Le composant a rencontré une erreur inattendue
                </p>
              </div>
            </div>

            {this.state.error && (
              <div className="mb-6">
                <h3 className="text-white font-semibold mb-2">Message d'erreur:</h3>
                <pre className="bg-[#0f172a] text-red-400 p-4 rounded-lg text-sm overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </div>
            )}

            {this.state.errorInfo && (
              <details className="mb-6">
                <summary className="text-white font-semibold cursor-pointer hover:text-blue-400">
                  Détails techniques (cliquer pour afficher)
                </summary>
                <pre className="bg-[#0f172a] text-gray-400 p-4 rounded-lg text-xs overflow-auto mt-2 max-h-64">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-4">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Recharger la page
              </button>
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 bg-[#334155] text-white rounded-lg hover:bg-[#475569] transition-colors font-medium"
              >
                Retour
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
