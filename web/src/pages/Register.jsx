import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { IoCalculatorOutline, IoPersonOutline, IoMailOutline, IoLockClosedOutline, IoEyeOutline, IoEyeOffOutline, IoArrowForwardOutline } from 'react-icons/io5';

export default function Register() {
  const { register } = useAuth();
  const { primaryColor } = useTheme();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      await register({ displayName: form.name, email: form.email, password: form.password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const inputClass = "w-full bg-[#f2f4f6] dark:bg-[#27272a] border border-[#c5c6cd] dark:border-[#3f3f46] rounded-xl px-4 py-3 text-sm text-[#091426] dark:text-[#f4f4f5] placeholder-[#75777d] focus:outline-none focus:ring-2 focus:border-transparent transition";

  return (
    <div className="min-h-screen bg-[#f7f9fb] dark:bg-[#09090b] flex flex-col justify-center items-center px-4 relative overflow-hidden transition-colors duration-300">
      <div className="absolute -top-48 -left-48 w-96 h-96 rounded-full pointer-events-none transition-colors duration-300" style={{ backgroundColor: primaryColor, opacity: 0.15 }} />
      <div className="absolute -bottom-48 -right-48 w-96 h-96 rounded-full pointer-events-none transition-colors duration-300" style={{ backgroundColor: primaryColor, opacity: 0.15 }} />

      <div className="w-full max-w-md relative">
        <div className="flex items-center justify-center gap-3 mb-8">
          <img src="/logo.png" alt="MathMentor AI Logo" className="w-10 h-10 rounded-xl object-contain shadow-md" />
          <span className="text-2xl font-bold text-[#091426] dark:text-[#f4f4f5] tracking-tight">MathMentor AI</span>
        </div>

        <div className="bg-white dark:bg-[#18181b] rounded-3xl shadow-sm border border-[#e0e3e5] dark:border-[#27272a] p-8 transition-colors duration-300">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-[#091426] dark:text-[#f4f4f5]">Create your account</h1>
            <p className="text-sm text-[#45474c] dark:text-[#a1a1aa] mt-1">Start your personalized math learning journey.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-50 text-[#ba1a1a] text-sm px-4 py-3 rounded-xl border border-red-100">{error}</div>}

            <div>
              <label className="block text-xs font-semibold text-[#45474c] dark:text-[#a1a1aa] uppercase tracking-wide mb-1.5 ml-1">Display name</label>
              <div className="relative">
                <IoPersonOutline size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#75777d]" />
                <input name="name" type="text" autoComplete="name" required value={form.name} onChange={handleChange}
                  placeholder="Alex Rivera" className={`${inputClass} pl-11`} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#45474c] dark:text-[#a1a1aa] uppercase tracking-wide mb-1.5 ml-1">Email</label>
              <div className="relative">
                <IoMailOutline size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#75777d]" />
                <input name="email" type="email" autoComplete="email" required value={form.email} onChange={handleChange}
                  placeholder="alex@example.com" className={`${inputClass} pl-11`} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#45474c] dark:text-[#a1a1aa] uppercase tracking-wide mb-1.5 ml-1">Password</label>
              <div className="relative">
                <IoLockClosedOutline size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#75777d]" />
                <input name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required
                  value={form.password} onChange={handleChange} placeholder="Min. 8 characters"
                  className={`${inputClass} pl-11 pr-12`} />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#75777d] hover:text-[#091426] dark:hover:text-[#f4f4f5]">
                  {showPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#45474c] dark:text-[#a1a1aa] uppercase tracking-wide mb-1.5 ml-1">Confirm password</label>
              <div className="relative">
                <IoLockClosedOutline size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#75777d]" />
                <input name="confirmPassword" type={showConfirm ? 'text' : 'password'} autoComplete="new-password" required
                  value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter your password"
                  className={`${inputClass} pl-11 pr-12`} />
                <button type="button" onClick={() => setShowConfirm(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#75777d] hover:text-[#091426] dark:hover:text-[#f4f4f5]">
                  {showConfirm ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ backgroundColor: primaryColor }}
              className="w-full text-white font-semibold py-3 rounded-xl hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2 mt-2">
              {loading ? 'Creating account…' : <><span>Get Started</span><IoArrowForwardOutline size={16} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-[#45474c] dark:text-[#a1a1aa] mt-5">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: primaryColor }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
