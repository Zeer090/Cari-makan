import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChefHat } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

// Konsistensi tema visual — sama dengan Login.jsx & Navbar
const TEAL = '#0F5C50';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    role: 'customer'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register, login, loginWithGoogle } = useAuth();
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      return setError('Password dan konfirmasi password tidak cocok.');
    }
    setIsLoading(true);
    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);
    if (result.success) {
      const loginResult = await login(formData.email, formData.password);
      if (loginResult.success) {
        navigate('/');
      } else {
        navigate('/login');
      }
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  const fieldStyle = {
    backgroundColor: '#F7F5F0',
  };
  const handleFocus = (e) => { e.target.style.boxShadow = `0 0 0 2px ${TEAL}20`; };
  const handleBlur = (e) => { e.target.style.boxShadow = 'none'; };
  const inputClass = "block w-full px-4 py-3.5 border-none rounded-2xl text-ink placeholder-ink/40 transition-all text-sm focus:outline-none";
  const labelClass = "block text-sm font-semibold mb-2";

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10" style={{ boxShadow: '0 2px 24px rgba(43,33,24,0.04)' }}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5" style={{ backgroundColor: 'rgba(15, 92, 80, 0.08)' }}>
              <ChefHat size={32} style={{ color: TEAL }} strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-display font-bold" style={{ color: '#1A202C' }}>Buat Akun</h1>
            <p className="mt-2 font-medium text-sm" style={{ color: 'rgba(43,33,24,0.6)' }}>Mulai perjalanan kulinermu bersama kami</p>
          </div>

          {error && (
            <div className="border text-red-600 bg-red-50 rounded-2xl p-4 mb-6 text-sm font-medium" style={{ borderColor: 'rgba(229,62,62,0.15)' }}>
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className={labelClass} style={{ color: '#1A202C' }}>Nama Lengkap</label>
              <input
                id="name" name="name" type="text" required
                value={formData.name} onChange={handleChange}
                className={inputClass} style={fieldStyle}
                onFocus={handleFocus} onBlur={handleBlur}
                placeholder="Nama kamu"
              />
            </div>

            <div>
              <label htmlFor="email" className={labelClass} style={{ color: '#1A202C' }}>Alamat Email</label>
              <input
                id="email" name="email" type="email" required
                value={formData.email} onChange={handleChange}
                className={inputClass} style={fieldStyle}
                onFocus={handleFocus} onBlur={handleBlur}
                placeholder="kamu@email.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className={labelClass} style={{ color: '#1A202C' }}>Password</label>
                <input
                  id="password" name="password" type="password" required
                  value={formData.password} onChange={handleChange}
                  className={inputClass} style={fieldStyle}
                  onFocus={handleFocus} onBlur={handleBlur}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className={labelClass} style={{ color: '#1A202C' }}>Konfirmasi</label>
                <input
                  id="confirmPassword" name="confirmPassword" type="password" required
                  value={formData.confirmPassword} onChange={handleChange}
                  className={inputClass} style={fieldStyle}
                  onFocus={handleFocus} onBlur={handleBlur}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full text-white py-3.5 rounded-full font-bold text-base shadow-sm transition-all active:scale-[0.98] ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
              style={{ backgroundColor: TEAL }}
              onMouseEnter={e => { if (!isLoading) e.currentTarget.style.backgroundColor = '#0B4A40'; }}
              onMouseLeave={e => { if (!isLoading) e.currentTarget.style.backgroundColor = TEAL; }}
            >
              {isLoading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center space-x-4">
            <div className="h-px flex-1" style={{ backgroundColor: 'rgba(43,33,24,0.08)' }}></div>
            <span className="text-xs font-medium" style={{ color: 'rgba(43,33,24,0.4)' }}>atau</span>
            <div className="h-px flex-1" style={{ backgroundColor: 'rgba(43,33,24,0.08)' }}></div>
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
            Sudah punya akun?{' '}
            <Link to="/login" className="font-bold hover:underline" style={{ color: TEAL }}>
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
