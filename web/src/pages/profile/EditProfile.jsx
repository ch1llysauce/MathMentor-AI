import { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoArrowBack,
  IoPersonOutline,
  IoMailOutline,
  IoLockClosedOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoCameraOutline,
  IoCheckmarkCircleOutline,
} from 'react-icons/io5';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api';

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successToast, setSuccessToast] = useState('');
  const fileInputRef = useRef(null);

  const hasChanges = useMemo(() => {
    const nameChanged = displayName.trim() !== (user?.displayName || '');
    const imageChanged = profileImage !== (user?.profileImage || '');
    const passwordStarted = currentPassword.length > 0 || newPassword.length > 0 || confirmPassword.length > 0;
    return nameChanged || imageChanged || passwordStarted;
  }, [displayName, profileImage, currentPassword, newPassword, confirmPassword, user]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 400;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
        setProfileImage(compressedBase64);
        setError('');
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Display name cannot be empty');
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword && !currentPassword) {
      setError('Please enter your current password to set a new one');
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      const nameChanged = displayName.trim() !== user?.displayName;
      const imageChanged = profileImage !== (user?.profileImage || '');
      if (nameChanged || imageChanged) {
        await authApi.updateProfile({ displayName: displayName.trim(), profileImage });
        await refreshProfile();
      }
      if (newPassword && currentPassword) {
        await authApi.changePassword({ currentPassword, newPassword });
      }
      setSuccessToast('Profile updated successfully!');
      setTimeout(() => {
        navigate('/profile');
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const initial = (displayName || user?.displayName || '?').charAt(0).toUpperCase();

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto pb-16">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 bg-white dark:bg-[#1a2333] text-[#091426] dark:text-white text-sm px-4 py-3 rounded-xl shadow-lg border border-[#00a472] flex items-center gap-2 animate-slide-down">
          <IoCheckmarkCircleOutline className="text-[#00a472] text-xl" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/profile')}
          className="w-10 h-10 rounded-full bg-[#f2f4f6] dark:bg-[#252f40] hover:bg-[#e2e8f0] dark:hover:bg-[#323f54] text-[#091426] dark:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <IoArrowBack size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#091426] dark:text-white tracking-tight">Edit Profile</h1>
          <p className="text-xs text-[#75777d]">Manage your account details and password preferences</p>
        </div>
      </div>

      {/* PC Responsive 2-Column Layout */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Avatar & Profile Card (4 Columns on PC) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1a2333] border border-[#e0e3e5] dark:border-[#2d3748] rounded-3xl p-6 shadow-sm text-center flex flex-col items-center">
          <div className="relative group mb-4">
            <div className="w-32 h-32 rounded-full border-4 border-[#4b41e1]/20 shadow-md overflow-hidden bg-[#4b41e1] flex items-center justify-center">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl font-bold text-white">{initial}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <IoCameraOutline size={32} className="text-white mb-1" />
              <span className="text-xs text-white font-semibold">Change Photo</span>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
          </div>

          <h2 className="text-lg font-bold text-[#091426] dark:text-white">{displayName || 'User'}</h2>
          <p className="text-xs text-[#75777d] mt-0.5">{user?.email}</p>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 w-full bg-[#f2f4f6] dark:bg-[#252f40] hover:bg-[#e2e8f0] dark:hover:bg-[#323f54] text-[#091426] dark:text-white text-xs font-semibold py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            Upload New Picture
          </button>

          <p className="text-[11px] text-[#75777d] mt-3">
            JPG, PNG or GIF. Max 10MB.
          </p>
        </div>

        {/* Right Column: Information & Security Forms (8 Columns on PC) */}
        <div className="lg:col-span-8 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-[#ba1a1a] dark:text-red-300 p-4 rounded-2xl text-sm border border-red-200 dark:border-red-800/40 font-medium">
              {error}
            </div>
          )}

          {/* Personal Information Card */}
          <div className="bg-white dark:bg-[#1a2333] border border-[#e0e3e5] dark:border-[#2d3748] rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-[#45474c] dark:text-[#a0aec0] uppercase tracking-wider mb-4">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Display Name */}
              <div>
                <label className="block text-xs font-semibold text-[#091426] dark:text-white uppercase tracking-wide mb-1.5 ml-1">
                  Display Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#75777d]">
                    <IoPersonOutline size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-[#f2f4f6] dark:bg-[#252f40] border border-[#e0e3e5] dark:border-[#2d3748] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#091426] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4b41e1] transition-all"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-[#091426] dark:text-white uppercase tracking-wide mb-1.5 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#75777d]">
                    <IoMailOutline size={18} />
                  </div>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full bg-[#e0e3e5]/60 dark:bg-[#1e2736] border border-[#c5c6cd]/50 dark:border-[#2d3748] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#75777d] cursor-not-allowed"
                  />
                </div>
                <p className="text-[11px] text-[#75777d] mt-1 ml-1">Email cannot be changed.</p>
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="bg-white dark:bg-[#1a2333] border border-[#e0e3e5] dark:border-[#2d3748] rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-[#45474c] dark:text-[#a0aec0] uppercase tracking-wider mb-4">
              Change Password
            </h3>
            <div className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-semibold text-[#091426] dark:text-white uppercase tracking-wide mb-1.5 ml-1">
                  Current Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#75777d]">
                    <IoLockClosedOutline size={18} />
                  </div>
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full bg-[#f2f4f6] dark:bg-[#252f40] border border-[#e0e3e5] dark:border-[#2d3748] rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#091426] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4b41e1] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#75777d] hover:text-[#091426] dark:hover:text-white"
                  >
                    {showCurrent ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                  </button>
                </div>
              </div>

              {/* Grid for New & Confirm Password on PC */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold text-[#091426] dark:text-white uppercase tracking-wide mb-1.5 ml-1">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#75777d]">
                      <IoLockClosedOutline size={18} />
                    </div>
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full bg-[#f2f4f6] dark:bg-[#252f40] border border-[#e0e3e5] dark:border-[#2d3748] rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#091426] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4b41e1] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#75777d] hover:text-[#091426] dark:hover:text-white"
                    >
                      {showNew ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-xs font-semibold text-[#091426] dark:text-white uppercase tracking-wide mb-1.5 ml-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#75777d]">
                      <IoLockClosedOutline size={18} />
                    </div>
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full bg-[#f2f4f6] dark:bg-[#252f40] border border-[#e0e3e5] dark:border-[#2d3748] rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#091426] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4b41e1] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#75777d] hover:text-[#091426] dark:hover:text-white"
                    >
                      {showConfirm ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-[#75777d] ml-1">Leave blank to keep current password.</p>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="px-6 py-3 rounded-2xl font-semibold text-sm bg-[#f2f4f6] dark:bg-[#252f40] hover:bg-[#e0e3e5] dark:hover:bg-[#323f54] text-[#45474c] dark:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!hasChanges || isSaving}
              className="px-8 py-3 rounded-2xl font-bold text-sm bg-[#4b41e1] text-white hover:bg-[#3323cc] disabled:opacity-50 disabled:hover:bg-[#4b41e1] transition-all shadow-sm cursor-pointer"
            >
              {isSaving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
