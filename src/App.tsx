import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PortfolioProvider } from './contexts/PortfolioContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { OperationsPage } from './pages/OperationsPage';
import { FinanciamentoPage } from './pages/FinanciamentoPage';
import { ResgatePage } from './pages/ResgatePage';
import { ExtratosPage } from './pages/ExtratosPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <PortfolioProvider>
              <DashboardPage />
            </PortfolioProvider>
          </PrivateRoute>
        }
      />
      <Route
        path="/portfolio"
        element={
          <PrivateRoute>
            <PortfolioProvider>
              <PortfolioPage />
            </PortfolioProvider>
          </PrivateRoute>
        }
      />
      <Route
        path="/operacoes"
        element={
          <PrivateRoute>
            <PortfolioProvider>
              <OperationsPage />
            </PortfolioProvider>
          </PrivateRoute>
        }
      />
      <Route
        path="/financiamento"
        element={
          <PrivateRoute>
            <PortfolioProvider>
              <FinanciamentoPage />
            </PortfolioProvider>
          </PrivateRoute>
        }
      />
      <Route
        path="/resgate"
        element={
          <PrivateRoute>
            <PortfolioProvider>
              <ResgatePage />
            </PortfolioProvider>
          </PrivateRoute>
        }
      />
      <Route
        path="/extratos"
        element={
          <PrivateRoute>
            <PortfolioProvider>
              <ExtratosPage />
            </PortfolioProvider>
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
