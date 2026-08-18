import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { IoCalculatorOutline, IoMailOutline, IoLockClosedOutline, IoArrowBackOutline, IoCheckmarkCircleOutline, IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';

const STEPS = ['Email', 'Verify Code', 'New Password'];

export default function ForgotPassword() {
  const { primaryColor } = useTheme();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [passwords, setPasswords] = useState({ newPassword: '', confirm: '' });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await authApi.forgotPassword({ email }); setStep(2); }
    catch (err) { setError(err.response?.data?.message || 'Failed to send reset email.'); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const { data } = await authApi.verifyResetOtp({ email, otp });
      const payload = data.data ?? data;
      setOtpToken(payload.resetToken || payload.token || '');
      setStep(3);
    }
    catch (err) { setError(err.response?.data?.message || 'Invalid or expired code.'); }
    finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) { setError('Passwords do not match.'); return; }
    if (passwords.newPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setError(''); setLoading(true);
    try {
      await authApi.resetPassword({ email, otp, newPassword: passwords.newPassword, resetToken: otpToken });
      setSuccess('Password reset successfully. You can now sign in.');
    }
    catch (err) { setError(err.response?.data?.message || 'Failed to reset password.'); }
    finally { setLoading(false); }
  };

  const inputClass = "w-full bg-[#f2f4f6] dark:bg-[#27272a] border border-[#c5c6cd] dark:border-[#3f3f46] rounded-xl px-4 py-3 text-sm text-[#091426] dark:text-[#f4f4f5] placeholder-[#75777d] focus:outline-none focus:ring-2 focus:border-transparent transition";

  return (
    <div className="min-h-screen bg-[#f7f9fb] dark:bg-[#09090b] flex flex-col justify-center items-center px-4 relative overflow-hidden transition-colors duration-300">
      <div className="absolute -top-48 -left-48 w-96 h-96 rounded-full pointer-events-none transition-colors duration-300" style={{ backgroundColor: primaryColor, opacity: 0.15 }} />
      <div className="absolute -bottom-48 -right-48 w-96 h-96 rounded-full pointer-events-none transition-colors duration-300" style={{ backgroundColor: primaryColor, opacity: 0.15 }} />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <img src="/logo.png" alt="MathMentor AI Logo" className="w-10 h-10 rounded-xl object-contain shadow-md" />
          <span className="text-2xl font-bold text-[#091426] dark:text-[#f4f4f5] tracking-tight">MathMentor AI</span>
        </div>

        <div className="bg-white dark:bg-[#18181b] rounded-3xl shadow-sm border border-[#e0e3e5] dark:border-[#27272a] p-8 transition-colors duration-300">
          {success ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-[rgba(0,164,114,0.12)] flex items-center justify-center mx-auto mb-4">
                <IoCheckmarkCircleOutline size={36} className="text-[#00a472]" />
              </div>
              <h2 className="text-xl font-bold text-[#091426] dark:text-[#f4f4f5] mb-2">Password Reset!</h2>
              <p className="text-sm text-[#45474c] dark:text-[#a1a1aa] mb-6">{success}</p>
              <Link to="/login" style={{ backgroundColor: primaryColor }}
                className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-all">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              {/* Step indicator */}
              <div className="flex items-center justify-center gap-3 mb-6 max-w-xs mx-auto">
                {STEPS.map((s, i) => (
                  <div key={s} className={`flex items-center gap-3 ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors"
                      style={{
                        backgroundColor: i + 1 < step ? '#00a472' : i + 1 === step ? primaryColor : '#f2f4f6',
                        color: i + 1 <= step ? '#ffffff' : '#75777d'
                      }}>
                      {i + 1 < step ? '✓' : i + 1}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 rounded-full ${i + 1 < step ? 'bg-[#00a472]' : 'bg-[#f2f4f6] dark:bg-[#27272a]'}`} />
                    )}
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <h1 className="text-xl font-bold text-[#091426] dark:text-[#f4f4f5]">
                  {step === 1 ? 'Reset your password' : step === 2 ? 'Enter verification code' : 'Set new password'}
                </h1>
                <p className="text-sm text-[#45474c] dark:text-[#a1a1aa] mt-1">
                  {step === 1 ? "We'll send a reset code to your email." :
                   step === 2 ? `Enter the 6-digit code sent to ${email}.` :
                   'Choose a strong new password.'}
                </p>
              </div>

              {error && (
                <div className="bg-red-50 text-[#ba1a1a] text-sm px-4 py-3 rounded-xl border border-red-100 mb-5">{error}</div>
              )}

              {step === 1 && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#45474c] dark:text-[#a1a1aa] uppercase tracking-wide mb-1.5 ml-1">Email</label>
                    <div className="relative">
                      <IoMailOutline size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#75777d]" />
                      <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com" className={`${inputClass} pl-11`} />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} style={{ backgroundColor: primaryColor }}
                    className="w-full text-white font-semibold py-3 rounded-xl hover:opacity-90 disabled:opacity-60 transition-all mt-2">
                    {loading ? 'Sending…' : 'Send Reset Code'}
                  </button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#45474c] dark:text-[#a1a1aa] uppercase tracking-wide mb-1.5 ml-1">OTP Code</label>
                    <input type="text" inputMode="numeric" maxLength={6} required value={otp}
                      onChange={e => setOtp(e.target.value)} placeholder="000000"
                      className={`${inputClass} text-center text-2xl font-bold tracking-[0.5em] py-4`} />
                  </div>
                  <button type="submit" disabled={loading} style={{ backgroundColor: primaryColor }}
                    className="w-full text-white font-semibold py-3 rounded-xl hover:opacity-90 disabled:opacity-60 transition-all">
                    {loading ? 'Verifying…' : 'Verify Code'}
                  </button>
                  <button type="button" onClick={() => { setStep(1); setError(''); }}
                    className="w-full flex items-center justify-center gap-1 text-sm text-[#75777d] hover:text-[#45474c] dark:hover:text-[#f4f4f5] py-2">
                    <IoArrowBackOutline size={14} /> Back
                  </button>
                </form>
              )}

              {step === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#45474c] dark:text-[#a1a1aa] uppercase tracking-wide mb-1.5 ml-1">New password</label>
                    <div className="relative">
                      <IoLockClosedOutline size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#75777d]" />
                      <input type={showNewPassword ? 'text' : 'password'} required value={passwords.newPassword}
                        onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                        placeholder="Minimum 8 characters" className={`${inputClass} pl-11 pr-12`} />
                      <button type="button" onClick={() => setShowNewPassword(p => !p)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#75777d] hover:text-[#091426] dark:hover:text-[#f4f4f5]">
                        {showNewPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#45474c] dark:text-[#a1a1aa] uppercase tracking-wide mb-1.5 ml-1">Confirm new password</label>
                    <div className="relative">
                      <IoLockClosedOutline size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#75777d]" />
                      <input type={showConfirmPassword ? 'text' : 'password'} required value={passwords.confirm}
                        onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                        placeholder="Re-enter password" className={`${inputClass} pl-11 pr-12`} />
                      <button type="button" onClick={() => setShowConfirmPassword(p => !p)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#75777d] hover:text-[#091426] dark:hover:text-[#f4f4f5]">
                        {showConfirmPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={loading} style={{ backgroundColor: primaryColor }}
                    className="w-full text-white font-semibold py-3 rounded-xl hover:opacity-90 disabled:opacity-60 transition-all mt-2">
                    {loading ? 'Resetting…' : 'Reset Password'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        {!success && (
          <p className="text-center text-sm text-[#45474c] dark:text-[#a1a1aa] mt-6">
            Remembered it?{' '}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: primaryColor }}>Sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
}
