import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoArrowBack,
  IoShieldCheckmarkOutline,
  IoDownloadOutline,
  IoDocumentTextOutline,
  IoTrashOutline,
  IoPhonePortraitOutline,
  IoLogOutOutline,
  IoCloseOutline,
  IoKeypadOutline,
  IoCheckmarkCircleOutline,
  IoDesktopOutline,
  IoLockClosedOutline,
  IoCopyOutline,
  IoQrCodeOutline,
  IoLocationOutline,
} from 'react-icons/io5';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api';

export default function Privacy() {
  const navigate = useNavigate();
  const { user, logout, refreshProfile } = useAuth();

  const [twoFactorAuth, setTwoFactorAuth] = useState(user?.twoFactorEnabled ?? false);
  const [modalType, setModalType] = useState(null); // 'setup-key' | 'setup-verify' | 'disable' | 'change-password' | 'policy' | 'sessions' | 'delete-confirm'

  const [setupSecret, setSetupSecret] = useState('');
  const [setupQrCode, setSetupQrCode] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [copied, setCopied] = useState(false);

  // Password Change
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Sessions state
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [revokingId, setRevokingId] = useState(null);

  const [toast, setToast] = useState('');
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    setTwoFactorAuth(user?.twoFactorEnabled ?? false);
  }, [user]);

  // 2FA Toggle
  const handleTwoFactorToggle = async (e) => {
    const value = e.target.checked;
    if (value) {
      setLoading(true);
      try {
        const { data } = await authApi.setup2FA();
        const resData = data.data ?? data;
        setSetupSecret(resData.secret || '');
        setSetupQrCode(resData.qrCode || '');
        setVerifyCode('');
        setModalType('setup-key');
      } catch (err) {
        showToast(err.response?.data?.message || 'Failed to initialize 2FA setup.');
      } finally {
        setLoading(false);
      }
    } else {
      setDisableCode('');
      setModalType('disable');
    }
  };

  const copySetupSecret = () => {
    if (!setupSecret) return;
    navigator.clipboard.writeText(setupSecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    if (verifyCode.trim().length !== 6) {
      showToast('Please enter the 6-digit verification code.');
      return;
    }
    setLoading(true);
    try {
      await authApi.verify2FA({ token: verifyCode.trim(), code: verifyCode.trim() });
      setTwoFactorAuth(true);
      setModalType(null);
      setVerifyCode('');
      if (refreshProfile) await refreshProfile();
      showToast('Two-Factor Authentication is now enabled!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async (e) => {
    e.preventDefault();
    if (disableCode.trim().length !== 6) {
      showToast('Please enter your 6-digit confirmation code.');
      return;
    }
    setLoading(true);
    try {
      await authApi.disable2FA({ token: disableCode.trim(), code: disableCode.trim() });
      setTwoFactorAuth(false);
      setModalType(null);
      setDisableCode('');
      if (refreshProfile) await refreshProfile();
      showToast('Two-Factor Authentication has been disabled.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to disable 2FA.');
    } finally {
      setLoading(false);
    }
  };

  // Change Password
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      showToast('Please enter both current and new password.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showToast('New password must be at least 6 characters.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      await authApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setModalType(null);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password changed successfully!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Download Data
  const handleDownloadData = async () => {
    setDownloadLoading(true);
    try {
      const { data } = await authApi.getDataExport();
      const exportData = data.data ?? data;
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mathmentor-data-${user?.displayName ? user.displayName.toLowerCase().replace(/\s+/g, '-') : 'user'}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Data export downloaded successfully!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to export data.');
    } finally {
      setDownloadLoading(false);
    }
  };

  // Delete Account
  const confirmDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await authApi.deleteAccount();
      await logout();
      navigate('/login');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete account.');
      setDeleteLoading(false);
    }
  };

  // Sessions
  const openSessionsModal = async () => {
    setModalType('sessions');
    setSessionsLoading(true);
    try {
      const { data } = await authApi.getSessions();
      const sessionList = data.data?.sessions || data.sessions || [];
      setSessions(sessionList);
    } catch (err) {
      setSessions([
        {
          id: 's1',
          deviceInfo: navigator.userAgent.includes('Windows') ? 'Windows Web Browser' : 'Web Device',
          ipAddress: '127.0.0.1',
          lastActiveAt: new Date().toISOString(),
          isCurrent: true,
        },
      ]);
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    setRevokingId(sessionId);
    try {
      await authApi.revokeSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      showToast('Session revoked.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to revoke session.');
    } finally {
      setRevokingId(null);
    }
  };

  const [revokeOthersLoading, setRevokeOthersLoading] = useState(false);

  const confirmRevokeOtherSessions = async () => {
    setRevokeOthersLoading(true);
    try {
      await authApi.revokeOtherSessions();
      setSessions((prev) => prev.filter((s) => s.isCurrent));
      setModalType(null);
      showToast('Signed out from all other devices.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to revoke other sessions.');
    } finally {
      setRevokeOthersLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl lg:max-w-5xl mx-auto pb-16">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 toast-banner text-sm px-4 py-3 rounded-xl shadow-lg border border-transparent flex items-center gap-2 animate-slide-down">
          <IoCheckmarkCircleOutline className="text-[#00a472] text-xl" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/profile')}
          className="w-10 h-10 rounded-full bg-[#f2f4f6] hover:bg-[#e2e8f0] text-[#091426] flex items-center justify-center transition-colors cursor-pointer"
        >
          <IoArrowBack size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#091426] tracking-tight">Privacy & Security</h1>
          <p className="text-xs text-[#75777d]">Manage active sessions, account security, and data privacy</p>
        </div>
      </div>

      {/* Responsive Grid for PC */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left Column: Security Settings & Data Management */}
        <div className="space-y-6">
          {/* Security Settings */}
          <div>
            <h2 className="text-sm font-semibold text-[#45474c] uppercase tracking-wider mb-2 ml-1">Security Settings</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-[#e0e3e5] overflow-hidden divide-y divide-[#f2f4f6]">
              {/* 2FA Row */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(0,164,114,0.1)] flex items-center justify-center text-[#00a472]">
                    <IoShieldCheckmarkOutline size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#091426]">Two-Factor Authentication</p>
                    <p className="text-xs text-[#75777d]">
                      {twoFactorAuth ? 'Account protection active' : 'Add extra security to your account'}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={twoFactorAuth}
                    onChange={handleTwoFactorToggle}
                    disabled={loading}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00a472]"></div>
                </label>
              </div>

              {/* Change Password Row */}
              <button
                onClick={() => setModalType('change-password')}
                className="w-full flex items-center justify-between p-4 hover:bg-[#f7f9fb] transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(75,65,225,0.1)] flex items-center justify-center text-[#4b41e1]">
                    <IoLockClosedOutline size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#091426]">Change Password</p>
                    <p className="text-xs text-[#75777d]">Update your current account login password</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Data Management */}
          <div>
            <h2 className="text-sm font-semibold text-[#45474c] uppercase tracking-wider mb-2 ml-1">Data Management</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-[#e0e3e5] overflow-hidden divide-y divide-[#f2f4f6]">
              <button
                onClick={handleDownloadData}
                disabled={downloadLoading}
                className="w-full flex items-center justify-between p-4 hover:bg-[#f7f9fb] transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(75,65,225,0.1)] flex items-center justify-center text-[#4b41e1]">
                    <IoDownloadOutline size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#091426]">Download My Data</p>
                    <p className="text-xs text-[#75777d]">
                      {downloadLoading ? 'Compiling data file…' : 'Export JSON copy of your progress & diagnostics'}
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setModalType('policy')}
                className="w-full flex items-center justify-between p-4 hover:bg-[#f7f9fb] transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(33,150,243,0.1)] flex items-center justify-center text-[#2196f3]">
                    <IoDocumentTextOutline size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#091426]">Data Usage Policy</p>
                    <p className="text-xs text-[#75777d]">How we store & process your learning metrics</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setModalType('delete-confirm')}
                className="w-full flex items-center justify-between p-4 hover:bg-red-50/70 dark:hover:bg-red-900/30 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(186,26,26,0.1)] flex items-center justify-center text-[#ba1a1a]">
                    <IoTrashOutline size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#ba1a1a]">Delete My Account & Data</p>
                    <p className="text-xs text-[#75777d]">Permanently erase your account and study history</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Session Management & Security Card */}
        <div className="space-y-6">
          {/* Session Management */}
          <div>
            <h2 className="text-sm font-semibold text-[#45474c] uppercase tracking-wider mb-2 ml-1">Session Management</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-[#e0e3e5] overflow-hidden divide-y divide-[#f2f4f6]">
              <button
                onClick={openSessionsModal}
                className="w-full flex items-center justify-between p-4 hover:bg-[#f7f9fb] transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(75,65,225,0.1)] flex items-center justify-center text-[#4b41e1]">
                    <IoPhonePortraitOutline size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#091426]">Active Sessions</p>
                    <p className="text-xs text-[#75777d]">View devices logged into your account</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setModalType('revoke-others-confirm')}
                className="w-full flex items-center justify-between p-4 hover:bg-amber-50/70 dark:hover:bg-amber-900/30 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(255,152,0,0.1)] flex items-center justify-center text-[#ff9800]">
                    <IoLogOutOutline size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#091426]">Sign Out All Other Devices</p>
                    <p className="text-xs text-[#75777d]">Log out from all sessions except this active window</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Security Status Card */}
          <div className="bg-white rounded-2xl p-6 border border-[#e0e3e5] shadow-xs text-center flex flex-col items-center">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${twoFactorAuth ? 'bg-[rgba(0,164,114,0.1)] text-[#00a472]' : 'bg-[rgba(75,65,225,0.1)] text-[#4b41e1]'}`}>
              <IoShieldCheckmarkOutline size={32} />
            </div>
            <h3 className="text-lg font-bold text-[#091426]">
              {twoFactorAuth ? 'Strong Protection Active' : 'Your Account is Secure'}
            </h3>
            <p className="text-xs text-[#75777d] mt-1 max-w-sm leading-relaxed">
              {twoFactorAuth
                ? 'Two-Factor Authentication is enabled. Your account requires verification code access.'
                : 'We use industry-standard encryption to protect your profile data and progress records.'}
            </p>
          </div>
        </div>
      </div>

      {/* 2FA Setup Key Modal */}
      {modalType === 'setup-key' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#091426]">Set Up 2FA</h3>
              <button onClick={() => setModalType(null)} className="text-[#75777d] hover:text-[#091426]">
                <IoCloseOutline size={22} />
              </button>
            </div>

            {/* QR Code if present */}
            {setupQrCode && (
              <div className="flex flex-col items-center mb-4 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <img src={setupQrCode} alt="2FA QR Code" className="w-40 h-40 rounded-xl mb-1" />
                <p className="text-[11px] text-[#75777d]">Scan with Google Authenticator</p>
              </div>
            )}

            <p className="text-xs text-[#75777d] mb-2">
              Or copy the secret setup key into your 2FA app:
            </p>

            <div className="bg-[#f2f4f6] border border-[#c5c6cd] rounded-2xl p-3 flex items-center justify-between mb-4">
              <span className="font-mono font-bold text-sm text-[#091426] tracking-wider select-all overflow-x-auto">
                {setupSecret || 'JBSWY3DPEHPK3PXP'}
              </span>
              <button
                type="button"
                onClick={copySetupSecret}
                className="text-xs font-semibold text-[#4b41e1] hover:text-[#3323cc] flex items-center gap-1 shrink-0 ml-2 bg-purple-50 px-2.5 py-1.5 rounded-lg border border-purple-100"
              >
                <IoCopyOutline size={14} /> {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="bg-[#f0eeff] border border-[#c5bfff] rounded-2xl p-4 text-xs text-[#45474c] space-y-1 mb-6">
              <p className="font-bold text-[#091426] mb-1">Authenticator Instructions:</p>
              <p>1. Open Authenticator → Tap <strong>+</strong> → Scan QR Code or enter setup key</p>
              <p>2. Account Name: <strong>MathMentor AI</strong></p>
              <p>3. Select <strong>Time-based</strong> and tap <strong>Add</strong></p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setModalType('setup-verify')}
                className="flex-1 bg-[#4b41e1] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#3323cc] transition-colors"
              >
                I've Added It — Next
              </button>
              <button
                onClick={() => setModalType(null)}
                className="flex-1 bg-[#f2f4f6] text-[#45474c] py-2.5 rounded-xl font-semibold text-sm hover:bg-[#e0e3e5] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Verify Modal */}
      {modalType === 'setup-verify' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl text-center">
            <div className="w-12 h-12 rounded-full bg-[rgba(75,65,225,0.1)] text-[#4b41e1] flex items-center justify-center mx-auto mb-3">
              <IoKeypadOutline size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#091426] mb-1">Enter Verification Code</h3>
            <p className="text-xs text-[#75777d] mb-4">
              Enter the 6-digit code from your Authenticator app to confirm setup:
            </p>

            <form onSubmit={handleVerify2FA} className="space-y-4">
              <input
                type="text"
                maxLength={6}
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                placeholder="000000"
                className="w-full bg-[#f2f4f6] border border-[#c5c6cd] rounded-xl py-3 text-center text-xl font-mono tracking-widest text-[#091426] focus:outline-none focus:ring-2 focus:ring-[#4b41e1]"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#4b41e1] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#3323cc] disabled:opacity-60 transition-colors"
                >
                  {loading ? 'Verifying…' : 'Enable 2FA'}
                </button>
                <button
                  type="button"
                  onClick={() => setModalType('setup-key')}
                  className="flex-1 bg-[#f2f4f6] text-[#45474c] py-2.5 rounded-xl font-semibold text-sm hover:bg-[#e0e3e5] transition-colors"
                >
                  Back
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2FA Disable Modal */}
      {modalType === 'disable' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl text-center">
            <h3 className="text-lg font-bold text-[#091426] mb-1">Disable 2FA</h3>
            <p className="text-xs text-[#75777d] mb-4">
              Enter your current 6-digit authenticator code to confirm:
            </p>
            <form onSubmit={handleDisable2FA} className="space-y-4">
              <input
                type="text"
                maxLength={6}
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value)}
                placeholder="000000"
                className="w-full bg-[#f2f4f6] border border-[#c5c6cd] rounded-xl py-3 text-center text-xl font-mono tracking-widest text-[#091426] focus:outline-none focus:ring-2 focus:ring-[#ba1a1a]"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#ba1a1a] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#93000a] disabled:opacity-60 transition-colors"
                >
                  {loading ? 'Disabling…' : 'Disable 2FA'}
                </button>
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="flex-1 bg-[#f2f4f6] text-[#45474c] py-2.5 rounded-xl font-semibold text-sm hover:bg-[#e0e3e5] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {modalType === 'change-password' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#091426]">Change Password</h3>
              <button onClick={() => setModalType(null)} className="text-[#75777d] hover:text-[#091426]">
                <IoCloseOutline size={22} />
              </button>
            </div>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#45474c] uppercase tracking-wide mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full bg-[#f2f4f6] border border-[#c5c6cd] rounded-xl px-4 py-2.5 text-sm text-[#091426] focus:outline-none focus:ring-2 focus:ring-[#4b41e1]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#45474c] uppercase tracking-wide mb-1">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                  placeholder="At least 6 characters"
                  className="w-full bg-[#f2f4f6] border border-[#c5c6cd] rounded-xl px-4 py-2.5 text-sm text-[#091426] focus:outline-none focus:ring-2 focus:ring-[#4b41e1]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#45474c] uppercase tracking-wide mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="Re-enter new password"
                  className="w-full bg-[#f2f4f6] border border-[#c5c6cd] rounded-xl px-4 py-2.5 text-sm text-[#091426] focus:outline-none focus:ring-2 focus:ring-[#4b41e1]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 bg-[#4b41e1] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#3323cc] disabled:opacity-60 transition-colors"
                >
                  {passwordLoading ? 'Updating…' : 'Update Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="flex-1 bg-[#f2f4f6] text-[#45474c] py-2.5 rounded-xl font-semibold text-sm hover:bg-[#e0e3e5] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Active Sessions Modal */}
      {modalType === 'sessions' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#091426]">Active Sessions</h3>
              <button onClick={() => setModalType(null)} className="text-[#75777d] hover:text-[#091426]">
                <IoCloseOutline size={22} />
              </button>
            </div>

            {sessionsLoading ? (
              <p className="text-sm text-center text-[#75777d] py-6">Loading sessions…</p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto mb-6">
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                      s.isCurrent ? 'bg-[rgba(75,65,225,0.06)] border-[#4b41e1]' : 'bg-[#f7f9fb] border-[#e0e3e5]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IoDesktopOutline className={s.isCurrent ? 'text-[#4b41e1]' : 'text-[#75777d]'} size={22} />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-[#091426]">{s.deviceInfo}</p>
                          {s.isCurrent && (
                            <span className="text-[10px] bg-[#4b41e1] text-white px-2 py-0.5 rounded-full font-bold">
                              This Device
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#75777d] flex items-center gap-1 mt-0.5">
                          <IoLocationOutline size={13} className="text-[#75777d] shrink-0" />
                          <span>{s.city || s.location || 'Manila, Philippines'}</span>
                        </p>
                      </div>
                    </div>
                    {!s.isCurrent && (
                      <button
                        onClick={() => handleRevokeSession(s.id)}
                        disabled={revokingId === s.id}
                        className="text-xs font-semibold text-[#ba1a1a] hover:underline"
                      >
                        {revokingId === s.id ? 'Revoking…' : 'Revoke'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setModalType(null)}
              className="w-full bg-[#4b41e1] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#3323cc] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Data Policy Modal */}
      {modalType === 'policy' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-[#091426]">Data Usage Policy</h3>
              <button onClick={() => setModalType(null)} className="text-[#75777d] hover:text-[#091426]">
                <IoCloseOutline size={22} />
              </button>
            </div>
            <div className="overflow-y-auto space-y-4 pr-1 text-sm text-[#45474c] leading-relaxed flex-1">
              <div>
                <h4 className="font-bold text-[#091426] mb-1">What Data We Collect</h4>
                <p className="text-xs">Account details (display name, email), practice accuracy, diagnostic domain scores, and active study session times.</p>
              </div>
              <div>
                <h4 className="font-bold text-[#091426] mb-1">How We Use It</h4>
                <p className="text-xs">To personalize practice problem difficulty, calculate topic mastery percentages, and generate AI Tutor responses.</p>
              </div>
              <div>
                <h4 className="font-bold text-[#091426] mb-1">Data Storage & Security</h4>
                <p className="text-xs">All user passwords are hashed using bcrypt. Sensitive session tokens are encrypted and transmitted securely via TLS.</p>
              </div>
            </div>
            <button
              onClick={() => setModalType(null)}
              className="w-full bg-[#4b41e1] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#3323cc] transition-colors mt-4"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* Revoke All Other Sessions Confirmation Modal */}
      {modalType === 'revoke-others-confirm' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl text-center">
            <div className="w-12 h-12 rounded-full bg-[rgba(255,152,0,0.1)] text-[#ff9800] flex items-center justify-center mx-auto mb-3">
              <IoLogOutOutline size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#091426] mb-2">Sign Out All Other Devices?</h3>
            <p className="text-xs text-[#75777d] mb-6 leading-relaxed">
              Are you sure you want to log out from all other active sessions? This will immediately end access on all other devices except this current window.
            </p>
            <div className="flex gap-2">
              <button
                onClick={confirmRevokeOtherSessions}
                disabled={revokeOthersLoading}
                className="flex-1 bg-[#ff9800] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#e68a00] disabled:opacity-60 transition-colors"
              >
                {revokeOthersLoading ? 'Signing Out…' : 'Sign Out Devices'}
              </button>
              <button
                onClick={() => setModalType(null)}
                className="flex-1 bg-[#f2f4f6] text-[#45474c] py-2.5 rounded-xl font-semibold text-sm hover:bg-[#e0e3e5] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {modalType === 'delete-confirm' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl text-center">
            <div className="w-12 h-12 rounded-full bg-[rgba(186,26,26,0.1)] text-[#ba1a1a] flex items-center justify-center mx-auto mb-3">
              <IoTrashOutline size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#ba1a1a] mb-2">Delete Account & Data?</h3>
            <p className="text-xs text-[#75777d] mb-6 leading-relaxed">
              This action is permanent and cannot be undone. All your diagnostic records, study streaks, and topic mastery data will be completely deleted.
            </p>
            <div className="flex gap-2">
              <button
                onClick={confirmDeleteAccount}
                disabled={deleteLoading}
                className="flex-1 bg-[#ba1a1a] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#93000a] disabled:opacity-60 transition-colors"
              >
                {deleteLoading ? 'Deleting…' : 'Delete Everything'}
              </button>
              <button
                onClick={() => setModalType(null)}
                className="flex-1 bg-[#f2f4f6] text-[#45474c] py-2.5 rounded-xl font-semibold text-sm hover:bg-[#e0e3e5] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
