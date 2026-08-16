import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IoCalculatorOutline, IoPersonOutline, IoMailOutline, IoLockClosedOutline, IoEyeOutline, IoEyeOffOutline, IoArrowForwardOutline } from 'react-icons/io5';

export default function Register() {
  const { register } = useAuth();
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

  const inputClass = "w-full bg-[#f2f4f6] border border-[#c5c6cd] rounded-xl px-4 py-3 text-sm text-[#091426] placeholder-[#75777d] focus:outline-none focus:ring-2 focus:ring-[#4b41e1] focus:border-transparent transition";

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      <div className="absolute -top-48 -left-48 w-96 h-96 rounded-full bg-[rgba(75,65,225,0.08)] pointer-events-none" />
      <div className="absolute -bottom-48 -right-48 w-96 h-96 rounded-full bg-[rgba(75,65,225,0.08)] pointer-events-none" />

      <div className="w-full max-w-md relative">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#091426] rounded-xl flex items-center justify-center shadow-md">
            <IoCalculatorOutline size={20} color="#fff" />
          </div>
          <span className="text-2xl font-bold text-[#091426] tracking-tight">MathMentor AI</span>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-[#e0e3e5] p-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-[#091426]">Create your account</h1>
            <p className="text-sm text-[#45474c] mt-1">Start your personalized math learning journey.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-50 text-[#ba1a1a] text-sm px-4 py-3 rounded-xl border border-red-100">{error}</div>}

            <div>
              <label className="block text-xs font-semibold text-[#45474c] uppercase tracking-wide mb-1.5 ml-1">Display name</label>
              <div className="relative">
                <IoPersonOutline size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#75777d]" />
                <input name="name" type="text" autoComplete="name" required value={form.name} onChange={handleChange}
                  placeholder="Alex Rivera" className={`${inputClass} pl-11`} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#45474c] uppercase tracking-wide mb-1.5 ml-1">Email</label>
              <div className="relative">
                <IoMailOutline size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#75777d]" />
                <input name="email" type="email" autoComplete="email" required value={form.email} onChange={handleChange}
                  placeholder="alex@example.com" className={`${inputClass} pl-11`} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#45474c] uppercase tracking-wide mb-1.5 ml-1">Password</label>
              <div className="relative">
                <IoLockClosedOutline size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#75777d]" />
                <input name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required
                  value={form.password} onChange={handleChange} placeholder="Min. 8 characters"
                  className={`${inputClass} pl-11 pr-12`} />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#75777d] hover:text-[#091426]">
                  {showPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#45474c] uppercase tracking-wide mb-1.5 ml-1">Confirm password</label>
              <div className="relative">
                <IoLockClosedOutline size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#75777d]" />
                <input name="confirmPassword" type={showConfirm ? 'text' : 'password'} autoComplete="new-password" required
                  value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter your password"
                  className={`${inputClass} pl-11 pr-12`} />
                <button type="button" onClick={() => setShowConfirm(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#75777d] hover:text-[#091426]">
                  {showConfirm ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#4b41e1] text-white font-semibold py-3 rounded-xl hover:bg-[#3323cc] disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2 mt-2">
              {loading ? 'Creating account…' : <><span>Get Started</span><IoArrowForwardOutline size={16} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-[#45474c] mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-[#4b41e1] font-semibold hover:text-[#3323cc]">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
