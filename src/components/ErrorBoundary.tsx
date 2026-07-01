import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white rounded-lg shadow p-6 space-y-3">
            <h1 className="text-lg font-semibold text-gray-900">Algo deu errado</h1>
            <p className="text-sm text-gray-600">
              Ocorreu um erro ao carregar a aplicação. Verifique o console do navegador para mais detalhes.
            </p>
            <pre className="text-xs text-red-600 bg-red-50 rounded p-3 overflow-auto whitespace-pre-wrap">
              {this.state.error.message}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
