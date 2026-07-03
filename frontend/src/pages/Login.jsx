import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Utensils } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

// Konsistensi tema visual baru
const TEAL = '#0F5C50';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setIsLoading(true);
    const result = await loginWithGoogle(credentialResponse.credential);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const result = await login(email, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10" style={{ boxShadow: '0 2px 24px rgba(43,33,24,0.04)' }}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5" style={{ backgroundColor: 'rgba(15, 92, 80, 0.08)' }}>
              <Utensils size={32} style={{ color: TEAL }} strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-display font-bold" style={{ color: '#1A202C' }}>Selamat Datang</h1>
            <p className="mt-2 font-medium text-sm" style={{ color: 'rgba(43,33,24,0.6)' }}>Masuk untuk melanjutkan memesan</p>
          </div>

          {error && (
            <div className="border text-red-600 bg-red-50 rounded-2xl p-4 mb-6 text-sm font-medium" style={{ borderColor: 'rgba(229,62,62,0.15)' }}>
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: '#1A202C' }}>
                Alamat Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-3.5 border-none rounded-2xl text-ink placeholder-ink/40 transition-all text-sm focus:outline-none"
                style={{ backgroundColor: '#F7F5F0' }}
                onFocus={(e) => { e.target.style.boxShadow = `0 0 0 2px ${TEAL}20`; }}
                onBlur={(e) => { e.target.style.boxShadow = 'none'; }}
                placeholder="kamu@email.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-sm font-semibold" style={{ color: '#1A202C' }}>
                  Password
                </label>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-3.5 border-none rounded-2xl text-ink placeholder-ink/40 transition-all text-sm focus:outline-none"
                style={{ backgroundColor: '#F7F5F0' }}
                onFocus={(e) => { e.target.style.boxShadow = `0 0 0 2px ${TEAL}20`; }}
                onBlur={(e) => { e.target.style.boxShadow = 'none'; }}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full text-white py-3.5 rounded-full font-bold text-base shadow-sm transition-all active:scale-[0.98] ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
              style={{ backgroundColor: TEAL }}
              onMouseEnter={e => { if(!isLoading) e.currentTarget.style.backgroundColor = '#0B4A40'; }}
              onMouseLeave={e => { if(!isLoading) e.currentTarget.style.backgroundColor = TEAL; }}
            >
              {isLoading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center space-x-4">
            <div className="h-px bg-ink/10 flex-1" style={{ backgroundColor: 'rgba(43,33,24,0.08)' }}></div>
            <span className="text-xs font-medium" style={{ color: 'rgba(43,33,24,0.4)' }}>atau</span>
            <div className="h-px bg-ink/10 flex-1" style={{ backgroundColor: 'rgba(43,33,24,0.08)' }}></div>
          </div>

          <div className="mt-6 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                setError('Google Login failed');
              }}
              shape="pill"
              text="continue_with"
              size="large"
            />
          </div>

          <p className="text-center mt-6 font-medium text-sm" style={{ color: 'rgba(43,33,24,0.6)' }}>
            Belum punya akun?{' '}
            <Link to="/register" className="font-bold hover:underline" style={{ color: TEAL }}>
              Daftar gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;