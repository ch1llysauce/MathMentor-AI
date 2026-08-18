import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authApi } from '../services/api';
import { IoCalculatorOutline, IoMailOutline, IoLockClosedOutline, IoEyeOutline, IoEyeOffOutline, IoShieldCheckmarkOutline } from 'react-icons/io5';

export default function Login() {
  const { login, saveAuth } = useAuth();
  const { primaryColor } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [twoFA, setTwoFA] = useState({ required: false, userId: '', code: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e) => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const result = await login(form);
      if (result.requires2FA) { setTwoFA(p => ({ ...p, required: true, userId: result.userId })); return; }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally { setLoading(false); }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const { data } = await authApi.validate2FA({ userId: twoFA.userId, token: twoFA.code });
      const payload = data.data ?? data;
      saveAuth(payload.user, payload.token);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code.');
    } finally { setLoading(false); }
  };

  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setError('');
      try {
        const { data } = await authApi.googleAuth({ accessToken: tokenResponse.access_token });
        const payload = data.data ?? data;
        saveAuth(payload.user, payload.token);
        navigate(from, { replace: true });
      } catch (err) {
        setError(err.response?.data?.message || 'Google sign-in failed. Please try again.');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      setError('Google sign-in was cancelled or failed.');
      setGoogleLoading(false);
    },
  });

  const isAnyLoading = loading || googleLoading;

  return (
    <div className="min-h-screen bg-[#f7f9fb] dark:bg-[#09090b] flex flex-col justify-center items-center px-4 relative overflow-hidden transition-colors duration-300">
        {/* Ambient glows */}
        <div className="absolute -top-48 -left-48 w-96 h-96 rounded-full pointer-events-none transition-colors duration-300" style={{ backgroundColor: primaryColor, opacity: 0.15 }} />
        <div className="absolute -bottom-48 -right-48 w-96 h-96 rounded-full pointer-events-none transition-colors duration-300" style={{ backgroundColor: primaryColor, opacity: 0.15 }} />

        <div className="w-full max-w-md relative">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <img src="/logo.png" alt="MathMentor AI Logo" className="w-10 h-10 rounded-xl object-contain shadow-md" />
            <span className="text-2xl font-bold text-[#091426] dark:text-[#f4f4f5] tracking-tight">MathMentor AI</span>
          </div>

          <div className="bg-white dark:bg-[#18181b] rounded-3xl shadow-sm border border-[#e0e3e5] dark:border-[#27272a] p-8 transition-colors duration-300">
            {!twoFA.required ? (
              <>
                <div className="mb-6">
                  <h1 className="text-xl font-bold text-[#091426] dark:text-[#f4f4f5]">Welcome back</h1>
                  <p className="text-sm text-[#45474c] dark:text-[#a1a1aa] mt-1">Access your personalized tutor dashboard.</p>
                </div>

                {error && (
                  <div className="bg-red-50 text-[#ba1a1a] text-sm px-4 py-3 rounded-xl border border-red-100 mb-5">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#45474c] dark:text-[#a1a1aa] uppercase tracking-wide mb-1.5 ml-1">Email</label>
                    <div className="relative">
                      <IoMailOutline size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#75777d]" />
                      <input id="email" name="email" type="email" autoComplete="email" required
                        value={form.email} onChange={handleChange} placeholder="e.g. johndoe@gmail.com"
                        className="w-full bg-[#f2f4f6] dark:bg-[#27272a] border border-[#c5c6cd] dark:border-[#3f3f46] rounded-xl pl-11 pr-4 py-3 text-sm text-[#091426] dark:text-[#f4f4f5] placeholder-[#75777d] focus:outline-none focus:ring-2 focus:border-transparent transition" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-[#45474c] dark:text-[#a1a1aa] uppercase tracking-wide ml-1">Password</label>
                      <Link to="/forgot-password" className="text-xs hover:underline" style={{ color: primaryColor }}>Forgot password?</Link>
                    </div>
                    <div className="relative">
                      <IoLockClosedOutline size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#75777d]" />
                      <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required
                        value={form.password} onChange={handleChange} placeholder="••••••••"
                        className="w-full bg-[#f2f4f6] dark:bg-[#27272a] border border-[#c5c6cd] dark:border-[#3f3f46] rounded-xl pl-11 pr-12 py-3 text-sm text-[#091426] dark:text-[#f4f4f5] placeholder-[#75777d] focus:outline-none focus:ring-2 focus:border-transparent transition" />
                      <button type="button" onClick={() => setShowPassword(p => !p)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#75777d] hover:text-[#091426] dark:hover:text-[#f4f4f5]">
                        {showPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={isAnyLoading} style={{ backgroundColor: primaryColor }}
                    className="w-full text-white font-semibold py-3 rounded-xl hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm mt-2">
                    {loading ? 'Signing in…' : 'Sign In'}
                  </button>
                </form>

                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#e0e3e5] dark:border-[#27272a]" /></div>
                  <div className="relative flex justify-center"><span className="bg-white dark:bg-[#18181b] px-3 text-xs text-[#75777d]">or</span></div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => triggerGoogleLogin()}
                    disabled={isAnyLoading}
                    className="w-full flex items-center justify-center gap-3 bg-white dark:bg-[#27272a] border border-[#c5c6cd] dark:border-[#3f3f46] text-[#091426] dark:text-[#f4f4f5] font-semibold py-3 px-4 rounded-xl transition-all shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {googleLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Signing in with Google…</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                        </svg>
                        <span>Sign in with Google</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-center text-sm text-[#45474c] dark:text-[#a1a1aa] mt-5">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-semibold hover:underline" style={{ color: primaryColor }}>Create Account</Link>
                </p>
              </>
            ) : (
              <form onSubmit={handle2FASubmit} className="space-y-5">
                <div className="text-center mb-2">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${primaryColor}20` }}>
                    <IoShieldCheckmarkOutline size={32} style={{ color: primaryColor }} />
                  </div>
                  <h1 className="text-xl font-bold text-[#091426] dark:text-[#f4f4f5]">Two-Factor Authentication</h1>
                  <p className="text-sm text-[#45474c] dark:text-[#a1a1aa] mt-1">Enter the 6-digit code from your authenticator app.</p>
                </div>
                {error && <div className="bg-red-50 text-[#ba1a1a] text-sm px-4 py-3 rounded-xl border border-red-100">{error}</div>}
                <input type="text" inputMode="numeric" maxLength={6} required
                  value={twoFA.code} onChange={(e) => setTwoFA(p => ({ ...p, code: e.target.value }))}
                  placeholder="000000"
                  className="w-full bg-[#f2f4f6] dark:bg-[#27272a] border border-[#c5c6cd] dark:border-[#3f3f46] rounded-xl px-4 py-4 text-2xl font-bold text-center tracking-[0.5em] text-[#091426] dark:text-[#f4f4f5] placeholder-[#c5c6cd] focus:outline-none focus:ring-2 focus:border-transparent transition" />
                <button type="submit" disabled={loading} style={{ backgroundColor: primaryColor }}
                  className="w-full text-white font-semibold py-3 rounded-xl hover:opacity-90 disabled:opacity-60 transition-all">
                  {loading ? 'Verifying…' : 'Verify'}
                </button>
                <button type="button" onClick={() => setTwoFA({ required: false, userId: '', code: '' })}
                  className="w-full text-sm text-[#75777d] hover:text-[#45474c] dark:hover:text-[#f4f4f5] py-2">
                  ← Back to login
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
  );
}
