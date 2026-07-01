import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TrendingUp, Mail, Chrome } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function LoginPage() {
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const getErrorMessage = (code: string) => {
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Email ou senha inválidos.';
      case 'auth/operation-not-allowed':
        return 'Login por email não está habilitado. Ative no Firebase Console → Authentication → Sign-in method.';
      case 'auth/too-many-requests':
        return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
      case 'auth/network-request-failed':
        return 'Erro de conexão. Verifique sua internet.';
      case 'auth/unauthorized-domain':
        return 'Domínio não autorizado no Firebase Console → Authentication → Settings → Authorized domains.';
      case 'auth/popup-blocked':
        return 'Popup bloqueado pelo navegador. Permita popups para este site.';
      case 'auth/popup-closed-by-user':
        return 'Login cancelado.';
      default:
        return `Erro inesperado (${code}). Tente novamente.`;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/');
    } catch (err: any) {
      setError(getErrorMessage(err?.code ?? ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err: any) {
      setError(getErrorMessage(err?.code ?? ''));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-4">
            <TrendingUp size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">BNE Investimentos</h1>
          <p className="text-gray-400 mt-2">Gerencie sua carteira com inteligência</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Entrar na conta</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" loading={loading} size="lg">
              <Mail size={18} />
              Entrar com email
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-sm text-gray-500">ou</span>
            </div>
          </div>

          <Button
            variant="secondary"
            className="w-full"
            size="lg"
            loading={googleLoading}
            onClick={handleGoogle}
          >
            <Chrome size={18} />
            Entrar com Google
          </Button>

          <p className="text-center text-sm text-gray-500 mt-6">
            Não tem uma conta?{' '}
            <Link to="/cadastro" className="text-primary-600 font-medium hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
