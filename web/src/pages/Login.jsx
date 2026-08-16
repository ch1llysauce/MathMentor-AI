import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { IoCalculatorOutline, IoMailOutline, IoLockClosedOutline, IoEyeOutline, IoEyeOffOutline, IoShieldCheckmarkOutline } from 'react-icons/io5';

function GoogleRegisterModal({ profile, idToken, onSuccess, onCancel }) {
  const [form, setForm] = useState({ displayName: profile.displayName || '', gradeLevel: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authApi.googleRegister({ idToken, displayName: form.displayName, gradeLevel: form.gradeLevel || undefined });
      onSuccess(data.data ?? data);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center px-4 pb-0 sm:pb-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-xl w-full max-w-md p-6 pb-8">
        <div className="w-10 h-1 bg-[#c5c6cd] rounded-full mx-auto mb-5 sm:hidden" />
        <div className="flex items-center gap-3 mb-5">
          {profile.profileImage ? (
            <img src={profile.profileImage} alt="" referrerPolicy="no-referrer" className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#e2dfff] flex items-center justify-center text-[#4b41e1] font-bold text-lg">
              {profile.displayName?.[0]?.toUpperCase() ?? 'G'}
            </div>
          )}
          <div>
            <p className="font-semibold text-[#091426]">{profile.displayName}</p>
            <p className="text-sm text-[#75777d]">{profile.email}</p>
          </div>
        </div>
        <h2 className="text-xl font-bold text-[#091426] mb-1">Complete your account</h2>
        <p className="text-sm text-[#45474c] mb-5">No MathMentor account found. Fill in the details below to create one.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-[#ba1a1a] bg-red-50 px-3 py-2 rounded-xl border border-red-100">{error}</p>}
          <div>
            <label className="block text-xs font-semibold text-[#45474c] uppercase tracking-wide mb-1.5 ml-1">Display name</label>
            <input type="text" required value={form.displayName}
              onChange={(e) => setForm(p => ({ ...p, displayName: e.target.value }))}
              className="w-full bg-[#f2f4f6] border border-[#c5c6cd] rounded-xl px-4 py-3 text-sm text-[#091426] focus:outline-none focus:ring-2 focus:ring-[#4b41e1] focus:border-transparent transition" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#45474c] uppercase tracking-wide mb-1.5 ml-1">Grade level <span className="text-[#75777d] normal-case font-normal">(optional)</span></label>
            <select value={form.gradeLevel} onChange={(e) => setForm(p => ({ ...p, gradeLevel: e.target.value }))}
              className="w-full bg-[#f2f4f6] border border-[#c5c6cd] rounded-xl px-4 py-3 text-sm text-[#091426] focus:outline-none focus:ring-2 focus:ring-[#4b41e1] focus:border-transparent transition">
              <option value="">Select grade level</option>
              <option value="Grade 11">Grade 11</option>
              <option value="Grade 12">Grade 12</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={loading}
              className="flex-1 bg-[#4b41e1] text-white font-semibold py-3 rounded-xl hover:bg-[#3323cc] disabled:opacity-60 transition-colors">
              {loading ? 'Creating…' : 'Create account'}
            </button>
            <button type="button" onClick={onCancel} disabled={loading}
              className="flex-1 border border-[#e0e3e5] text-[#45474c] font-semibold py-3 rounded-xl hover:bg-[#f2f4f6] disabled:opacity-60 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Login() {
  const { login, saveAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [twoFA, setTwoFA] = useState({ required: false, userId: '', code: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleRegister, setGoogleRegister] = useState(null);

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

  const handleGoogleSuccess = async ({ credential: idToken }) => {
    if (!idToken) { setError('Google sign-in failed — no credential received.'); return; }
    setGoogleLoading(true); setError('');
    try {
      const { data } = await authApi.googleAuth({ idToken });
      const payload = data.data ?? data;
      if (payload.requiresRegistration) { setGoogleRegister({ profile: payload.googleProfile, idToken }); return; }
      saveAuth(payload.user, payload.token);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-in failed. Please try again.');
    } finally { setGoogleLoading(false); }
  };

  const handleGoogleError = () => { setError('Google sign-in was cancelled or failed.'); setGoogleLoading(false); };

  const isAnyLoading = loading || googleLoading;

  return (
    <>
      {googleRegister && (
        <GoogleRegisterModal profile={googleRegister.profile} idToken={googleRegister.idToken}
          onSuccess={({ user, token }) => { saveAuth(user, token); setGoogleRegister(null); navigate(from, { replace: true }); }}
          onCancel={() => { setGoogleRegister(null); setGoogleLoading(false); }} />
      )}

      <div className="min-h-screen bg-[#f7f9fb] flex flex-col justify-center items-center px-4 relative overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute -top-48 -left-48 w-96 h-96 rounded-full bg-[rgba(75,65,225,0.08)] pointer-events-none" />
        <div className="absolute -bottom-48 -right-48 w-96 h-96 rounded-full bg-[rgba(75,65,225,0.08)] pointer-events-none" />

        <div className="w-full max-w-md relative">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#4b41e1] rounded-xl flex items-center justify-center shadow-md">
              <IoCalculatorOutline size={22} color="#fff" />
            </div>
            <span className="text-2xl font-bold text-[#091426] tracking-tight">MathMentor AI</span>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-[#e0e3e5] p-8">
            {!twoFA.required ? (
              <>
                <div className="mb-6">
                  <h1 className="text-xl font-bold text-[#091426]">Welcome back</h1>
                  <p className="text-sm text-[#45474c] mt-1">Access your personalized tutor dashboard.</p>
                </div>

                {error && (
                  <div className="bg-red-50 text-[#ba1a1a] text-sm px-4 py-3 rounded-xl border border-red-100 mb-5">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#45474c] uppercase tracking-wide mb-1.5 ml-1">Email</label>
                    <div className="relative">
                      <IoMailOutline size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#75777d]" />
                      <input id="email" name="email" type="email" autoComplete="email" required
                        value={form.email} onChange={handleChange} placeholder="e.g. johndoe@gmail.com"
                        className="w-full bg-[#f2f4f6] border border-[#c5c6cd] rounded-xl pl-11 pr-4 py-3 text-sm text-[#091426] placeholder-[#75777d] focus:outline-none focus:ring-2 focus:ring-[#4b41e1] focus:border-transparent transition" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-[#45474c] uppercase tracking-wide ml-1">Password</label>
                      <Link to="/forgot-password" className="text-xs text-[#4b41e1] hover:text-[#3323cc]">Forgot password?</Link>
                    </div>
                    <div className="relative">
                      <IoLockClosedOutline size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#75777d]" />
                      <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required
                        value={form.password} onChange={handleChange} placeholder="••••••••"
                        className="w-full bg-[#f2f4f6] border border-[#c5c6cd] rounded-xl pl-11 pr-12 py-3 text-sm text-[#091426] placeholder-[#75777d] focus:outline-none focus:ring-2 focus:ring-[#4b41e1] focus:border-transparent transition" />
                      <button type="button" onClick={() => setShowPassword(p => !p)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#75777d] hover:text-[#091426]">
                        {showPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={isAnyLoading}
                    className="w-full bg-[#4b41e1] text-white font-semibold py-3 rounded-xl hover:bg-[#3323cc] disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm mt-2">
                    {loading ? 'Signing in…' : 'Sign In'}
                  </button>
                </form>

                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#e0e3e5]" /></div>
                  <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-[#75777d]">or</span></div>
                </div>

                <div>
                  {googleLoading ? (
                    <div className="w-full flex items-center justify-center gap-3 border border-[#e0e3e5] bg-white text-[#45474c] text-sm py-3 px-4 rounded-xl">
                      <div className="w-4 h-4 border-2 border-[#c5c6cd] border-t-transparent rounded-full animate-spin" />
                      Signing in with Google…
                    </div>
                  ) : (
                    <div className="flex justify-center [&>div]:w-full [&>div>div]:w-full [&_iframe]:w-full">
                      <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError}
                        text="signin_with" shape="rectangular" width="360" useOneTap={false} />
                    </div>
                  )}
                </div>

                <p className="text-center text-sm text-[#45474c] mt-5">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-[#4b41e1] font-semibold hover:text-[#3323cc]">Create Account</Link>
                </p>
              </>
            ) : (
              <form onSubmit={handle2FASubmit} className="space-y-5">
                <div className="text-center mb-2">
                  <div className="w-16 h-16 rounded-full bg-[rgba(75,65,225,0.1)] flex items-center justify-center mx-auto mb-4">
                    <IoShieldCheckmarkOutline size={32} className="text-[#4b41e1]" />
                  </div>
                  <h1 className="text-xl font-bold text-[#091426]">Two-Factor Authentication</h1>
                  <p className="text-sm text-[#45474c] mt-1">Enter the 6-digit code from your authenticator app.</p>
                </div>
                {error && <div className="bg-red-50 text-[#ba1a1a] text-sm px-4 py-3 rounded-xl border border-red-100">{error}</div>}
                <input type="text" inputMode="numeric" maxLength={6} required
                  value={twoFA.code} onChange={(e) => setTwoFA(p => ({ ...p, code: e.target.value }))}
                  placeholder="000000"
                  className="w-full bg-[#f2f4f6] border border-[#c5c6cd] rounded-xl px-4 py-4 text-2xl font-bold text-center tracking-[0.5em] text-[#091426] placeholder-[#c5c6cd] focus:outline-none focus:ring-2 focus:ring-[#4b41e1] focus:border-transparent transition" />
                <button type="submit" disabled={loading}
                  className="w-full bg-[#4b41e1] text-white font-semibold py-3 rounded-xl hover:bg-[#3323cc] disabled:opacity-60 transition-colors">
                  {loading ? 'Verifying…' : 'Verify'}
                </button>
                <button type="button" onClick={() => setTwoFA({ required: false, userId: '', code: '' })}
                  className="w-full text-sm text-[#75777d] hover:text-[#45474c] py-2">
                  ← Back to login
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
