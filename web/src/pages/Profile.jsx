import { useState } from 'react';
import {
  IoPersonOutline, IoLockClosedOutline, IoLogOutOutline,
  IoCreateOutline, IoShieldCheckmarkOutline, IoChevronForwardOutline,
  IoCheckmarkCircleOutline,
} from 'react-icons/io5';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';

function MenuItem({ icon: Icon, label, iconBg = 'bg-[rgba(75,65,225,0.1)]', iconColor = 'text-[#4b41e1]', onClick, right }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center justify-between p-4 hover:bg-[#f7f9fb] transition-colors last:rounded-b-2xl first:rounded-t-2xl">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon size={20} className={iconColor} />
        </div>
        <span className="text-sm font-medium text-[#091426]">{label}</span>
      </div>
      {right ?? <IoChevronForwardOutline size={18} className="text-[#75777d]" />}
    </button>
  );
}

export default function Profile() {
  const { user, refreshProfile, logout, saveAuth } = useAuth();

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
    e.preventDefault(); setEditLoading(true); setEditError(''); setEditSuccess('');
    try {
      const { data } = await authApi.updateProfile({ displayName: editForm.name });
      const payload = data.data ?? data;
      const updated = payload.user || payload;
      saveAuth(updated, localStorage.getItem('token'));
      setEditSuccess('Profile updated successfully.');
      setEditMode(false);
      await refreshProfile();
    } catch (err) { setEditError(err.response?.data?.message || 'Failed to update profile.'); }
    finally { setEditLoading(false); }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwError('New passwords do not match.'); return; }
    if (pwForm.newPassword.length < 8) { setPwError('New password must be at least 8 characters.'); return; }
    setPwLoading(true); setPwError(''); setPwSuccess('');
    try {
      await authApi.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwSuccess('Password changed successfully.');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { setPwError(err.response?.data?.message || 'Failed to change password.'); }
    finally { setPwLoading(false); }
  };

  const inputClass = "w-full bg-[#f2f4f6] border border-[#c5c6cd] rounded-xl px-4 py-3 text-sm text-[#091426] placeholder-[#75777d] focus:outline-none focus:ring-2 focus:ring-[#4b41e1] focus:border-transparent transition";
  const displayName = user?.displayName ?? 'User';
  const initial = displayName[0]?.toUpperCase() ?? 'U';

  return (
    <div className="p-4 sm:p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-[#091426] tracking-tight mb-6">Profile</h1>

      {/* Profile card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm mb-5 flex flex-col items-center text-center">
        <div className="relative mb-4">
          {user?.profileImage ? (
            <img src={user.profileImage} referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-full object-cover border-3 border-[#e2dfff]" alt="" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#4b41e1] flex items-center justify-center text-white text-3xl font-bold border-3 border-[#e2dfff]">
              {initial}
            </div>
          )}
          <div className="absolute bottom-0 right-0 bg-white rounded-full p-0.5">
            <IoCheckmarkCircleOutline size={22} className="text-[#00a472]" />
          </div>
        </div>
        <p className="text-xl font-bold text-[#091426]">{displayName}</p>
        <p className="text-sm text-[#75777d] mt-1">{user?.email ?? ''}</p>
        {editSuccess && <p className="text-sm text-[#00a472] mt-2">{editSuccess}</p>}
      </div>

      {/* Account section */}
      <p className="text-sm font-semibold text-[#091426] mb-2 ml-1">Account</p>
      <div className="bg-white rounded-2xl shadow-sm mb-5 divide-y divide-[#f2f4f6] overflow-hidden">
        <MenuItem icon={IoPersonOutline} label="Edit Profile" onClick={() => { setEditMode(p => !p); setEditSuccess(''); }} />
        <MenuItem icon={IoLockClosedOutline} label="Change Password"
          iconBg="bg-[rgba(216,227,251,1)]" iconColor="text-[#091426]"
          onClick={() => setPwOpen(p => !p)} />
      </div>

      {/* Edit profile form */}
      {editMode && (
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-5">
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {editError && <p className="text-sm text-[#ba1a1a]">{editError}</p>}
            <div>
              <label className="block text-xs font-semibold text-[#45474c] uppercase tracking-wide mb-1.5 ml-1">Display name</label>
              <input type="text" required value={editForm.name} onChange={e => setEditForm({ name: e.target.value })} className={inputClass} />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={editLoading}
                className="flex-1 bg-[#4b41e1] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#3323cc] disabled:opacity-60 transition-colors">
                {editLoading ? 'Saving…' : 'Save changes'}
              </button>
              <button type="button" onClick={() => setEditMode(false)}
                className="flex-1 border border-[#e0e3e5] text-sm text-[#45474c] py-2.5 rounded-xl hover:bg-[#f2f4f6] transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Change password form */}
      {pwOpen && (
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-5">
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {pwError && <p className="text-sm text-[#ba1a1a]">{pwError}</p>}
            {pwSuccess && <p className="text-sm text-[#00a472]">{pwSuccess}</p>}
            {['currentPassword', 'newPassword', 'confirmPassword'].map((field, i) => (
              <div key={field}>
                <label className="block text-xs font-semibold text-[#45474c] uppercase tracking-wide mb-1.5 ml-1">
                  {['Current password', 'New password', 'Confirm new password'][i]}
                </label>
                <input type="password" required value={pwForm[field]}
                  onChange={e => setPwForm(p => ({ ...p, [field]: e.target.value }))}
                  placeholder={['••••••••', 'Minimum 8 characters', 'Re-enter new password'][i]}
                  className={inputClass} />
              </div>
            ))}
            <button type="submit" disabled={pwLoading}
              className="w-full bg-[#4b41e1] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#3323cc] disabled:opacity-60 transition-colors">
              {pwLoading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>
      )}

      {/* Security section */}
      <p className="text-sm font-semibold text-[#091426] mb-2 ml-1">Security</p>
      <div className="bg-white rounded-2xl shadow-sm mb-5 overflow-hidden">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(75,65,225,0.1)] flex items-center justify-center">
              <IoShieldCheckmarkOutline size={20} className="text-[#4b41e1]" />
            </div>
            <span className="text-sm font-medium text-[#091426]">Two-factor authentication</span>
          </div>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${user?.twoFactorEnabled ? 'bg-[rgba(0,164,114,0.12)] text-[#00a472]' : 'bg-[#f2f4f6] text-[#75777d]'}`}>
            {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </div>

      {/* Sign out */}
      <button onClick={logout}
        className="w-full flex items-center justify-center gap-2 border border-[#ffdad6] text-[#ba1a1a] font-semibold py-3.5 rounded-2xl hover:bg-red-50 transition-colors mt-2 mb-4">
        <IoLogOutOutline size={18} /> Sign out
      </button>

      <p className="text-center text-xs text-[#75777d]">Version 1.0.0</p>
    </div>
  );
}
