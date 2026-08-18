import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoPersonOutline,
  IoLockClosedOutline,
  IoLogOutOutline,
  IoShieldCheckmarkOutline,
  IoSettingsOutline,
  IoHelpCircleOutline,
  IoInformationCircleOutline,
  IoChevronForwardOutline,
  IoCheckmarkCircleOutline,
  IoFlameOutline,
  IoFlame,
  IoRibbonOutline,
  IoSparklesOutline,
  IoSchoolOutline,
  IoGlobeOutline,
} from 'react-icons/io5';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import SignOutModal from '../components/SignOutModal';

function MenuCardItem({ icon: Icon, title, description, badgeText, badgeColor = 'bg-[#f2f4f6] text-[#45474c]', iconBg = 'bg-[rgba(75,65,225,0.1)]', iconColor = 'text-[#4b41e1]', onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-[#e0e3e5] hover:border-[#4b41e1]/40 hover:shadow-md hover:-translate-y-0.5 transition-all group text-left cursor-pointer"
    >
      <div className="flex items-center gap-3.5">
        <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
          <Icon size={22} className={iconColor} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-base font-bold text-[#091426] group-hover:text-[#4b41e1] transition-colors">{title}</p>
            {badgeText && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
                {badgeText}
              </span>
            )}
          </div>
          {description && <p className="text-xs text-[#75777d] mt-0.5 leading-relaxed">{description}</p>}
        </div>
      </div>
      <div className="w-8 h-8 rounded-full bg-[#f7f9fb] group-hover:bg-[#4b41e1] text-[#75777d] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
        <IoChevronForwardOutline size={16} />
      </div>
    </button>
  );
}

const BANNER_GRADIENTS = {
  indigo: 'from-[#4b41e1] via-[#3d33d0] to-[#2b1fb8]',
  emerald: 'from-[#00a472] via-[#008f63] to-[#00704d]',
  sunset: 'from-[#f59e0b] via-[#ea580c] to-[#dc2626]',
  ocean: 'from-[#0284c7] via-[#2563eb] to-[#4f46e5]',
  midnight: 'from-[#1e293b] via-[#0f172a] to-[#020617]',
  amethyst: 'from-[#9333ea] via-[#7c3aed] to-[#4c1d95]',
  rose: 'from-[#f43f5e] via-[#e11d48] to-[#9f1239]',
  aurora: 'from-[#06b6d4] via-[#0d9488] to-[#115e59]',
  unicorn: 'from-[#ec4899] via-[#8b5cf6] to-[#3b82f6]',
};

export default function Profile() {
  const navigate = useNavigate();
  const { user, refreshProfile, logout, saveAuth } = useAuth();
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: user?.displayName || '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState('');
  const [editError, setEditError] = useState('');

  const [pwOpen, setPwOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    setEditSuccess('');
    try {
      const { data } = await authApi.updateProfile({ displayName: editForm.name });
      const payload = data.data ?? data;
      const updated = payload.user || payload;
      saveAuth(updated, localStorage.getItem('token'));
      setEditSuccess('Profile updated successfully.');
      setEditMode(false);
      await refreshProfile();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setEditLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }
    if (pwForm.newPassword.length < 8) {
      setPwError('New password must be at least 8 characters.');
      return;
    }
    setPwLoading(true);
    setPwError('');
    setPwSuccess('');
    try {
      await authApi.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwSuccess('Password changed successfully.');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwOpen(false);
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPwLoading(false);
    }
  };

  const inputClass =
    'w-full bg-[#f2f4f6] border border-[#c5c6cd] rounded-xl px-4 py-3 text-sm text-[#091426] placeholder-[#75777d] focus:outline-none focus:ring-2 focus:ring-[#4b41e1] focus:border-transparent transition';
  const displayName = user?.displayName ?? 'User';
  const initial = displayName[0]?.toUpperCase() ?? 'U';

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Active Student';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto pb-24 sm:pb-28">
      {/* Header Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#091426] tracking-tight">Profile & Preferences</h1>
          <p className="text-sm text-[#75777d] mt-1">Manage your account settings, security options, and study preferences.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-[rgba(0,164,114,0.1)] text-[#00a472] px-3 py-1.5 rounded-full text-xs font-bold border border-[rgba(0,164,114,0.2)]">
            <IoCheckmarkCircleOutline size={16} /> Verified Account
          </span>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Hero User Identity Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className={`bg-gradient-to-br ${BANNER_GRADIENTS[user?.bannerTheme || 'indigo']} rounded-3xl p-6 text-white shadow-xl relative overflow-hidden transition-all duration-300`}>
            {/* Background Accent Graphic */}
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />

            <div className="flex flex-col items-center text-center relative z-10">
              <div className="relative mb-4">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    referrerPolicy="no-referrer"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white/30 shadow-md"
                    alt=""
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-4xl font-extrabold border-4 border-white/30 shadow-md">
                    {initial}
                  </div>
                )}
                <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-sm">
                  <IoCheckmarkCircleOutline size={20} className="text-[#00a472]" />
                </div>
              </div>

              <h2 className="text-2xl font-bold tracking-tight">{displayName}</h2>
              <p className="text-xs text-white/80 mt-1 font-medium">{user?.email ?? ''}</p>
            </div>
          </div>

          {/* Quick Details Card */}
          <div className="bg-white rounded-3xl p-5 border border-[#e0e3e5] shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs text-[#45474c] pb-2 border-b border-[#f2f4f6]">
              <span className="text-[#75777d]">Member Since</span>
              <span className="font-bold text-[#091426]">{memberSince}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#45474c] pb-2 border-b border-[#f2f4f6]">
              <span className="text-[#75777d]">Two-Factor Auth</span>
              <span className={`font-bold ${user?.twoFactorEnabled ? 'text-[#00a472]' : 'text-[#75777d]'}`}>
                {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#45474c]">
              <span className="text-[#75777d]">App Platform</span>
              <span className="font-bold text-[#091426]">Web Version 1.0.0</span>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Sub-Modules & Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account & Security Section */}
          <div>
            <h3 className="text-xs font-bold text-[#45474c] uppercase tracking-wider mb-3 ml-1">Account & Security</h3>
            <div className="space-y-3">
              <MenuCardItem
                icon={IoPersonOutline}
                title="Edit Profile & Password"
                description="Update display name, avatar, and security credentials"
                iconBg="bg-[rgba(75,65,225,0.1)]"
                iconColor="text-[#4b41e1]"
                onClick={() => navigate('/profile/edit')}
              />

              <MenuCardItem
                icon={IoShieldCheckmarkOutline}
                title="Privacy & Security"
                description="Manage 2FA verification, active login sessions, and data exports"
                badgeText={user?.twoFactorEnabled ? '2FA Active' : '2FA Recommended'}
                badgeColor={user?.twoFactorEnabled ? 'bg-[rgba(0,164,114,0.15)] text-[#00a472]' : 'bg-[rgba(255,152,0,0.15)] text-[#ff9800]'}
                iconBg="bg-[rgba(0,164,114,0.1)]"
                iconColor="text-[#00a472]"
                onClick={() => navigate('/profile/privacy')}
              />
            </div>
          </div>

          {/* Application Preferences Section */}
          <div>
            <h3 className="text-xs font-bold text-[#45474c] uppercase tracking-wider mb-3 ml-1">Preferences</h3>
            <div className="space-y-3">
              <MenuCardItem
                icon={IoSettingsOutline}
                title="App Settings"
                description="Configure dark mode, offline cache mode, and app preferences"
                iconBg="bg-[rgba(33,150,243,0.1)]"
                iconColor="text-[#2196f3]"
                onClick={() => navigate('/profile/settings')}
              />
            </div>
          </div>

          {/* Support & Information Section */}
          <div>
            <h3 className="text-xs font-bold text-[#45474c] uppercase tracking-wider mb-3 ml-1">Support & Knowledge Base</h3>
            <div className="space-y-3">
              <MenuCardItem
                icon={IoHelpCircleOutline}
                title="Help & FAQs"
                description="Instant search, categorized guides, direct email support & feedback"
                iconBg="bg-[rgba(75,65,225,0.1)]"
                iconColor="text-[#4b41e1]"
                onClick={() => navigate('/profile/faq')}
              />

              <MenuCardItem
                icon={IoInformationCircleOutline}
                title="About MathMentor AI"
                description="App mission, curriculum details, core features & legal terms of service"
                iconBg="bg-[rgba(0,164,114,0.1)]"
                iconColor="text-[#00a472]"
                onClick={() => navigate('/profile/about')}
              />

              <MenuCardItem
                icon={IoGlobeOutline}
                title="Visit Home Page"
                description="View the MathMentor AI public landing page & product overview"
                iconBg="bg-[rgba(75,65,225,0.08)]"
                iconColor="text-[#4b41e1]"
                onClick={() => navigate('/')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sign Out Button & Version at bottom of screen */}
      <div className="mt-8">
        <button
          onClick={() => setShowSignOutModal(true)}
          className="w-full flex items-center justify-center gap-2 border border-[#ffdad6] text-[#ba1a1a] bg-white dark:bg-[#1a2333] dark:border-red-900/40 font-bold py-3.5 rounded-2xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shadow-xs cursor-pointer"
        >
          <IoLogOutOutline size={20} /> Sign Out
        </button>
        <p className="text-center text-xs text-[#75777d] dark:text-[#64748b] mt-3">
          Version 1.0.0
        </p>
      </div>

      {/* Sign Out Confirmation Dialogue */}
      <SignOutModal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={async () => {
          await logout();
          navigate('/');
        }}
      />
    </div>
  );
}
