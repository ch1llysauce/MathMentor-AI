import { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack, IoPersonOutline, IoMailOutline, IoLockClosedOutline, IoEyeOutline, IoEyeOffOutline, IoCameraOutline } from 'react-icons/io5';
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
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const initial = (displayName || user?.displayName || '?').charAt(0).toUpperCase();
  const inputClass = "w-full bg-bg-card border border-border-main rounded-xl px-11 py-3 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all";

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto pb-16">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full bg-bg-hover hover:bg-bg-hover text-text-main flex items-center justify-center transition-colors">
          <IoArrowBack size={20} />
        </button>
        <h1 className="text-2xl font-bold text-text-main tracking-tight">Edit Profile</h1>
      </div>
      <form onSubmit={handleSave} className="space-y-8">
        <div className="flex flex-col items-center">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-sm overflow-hidden bg-primary flex items-center justify-center">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-white">{initial}</span>
              )}
            </div>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <IoCameraOutline size={28} className="text-white mb-1" />
              <span className="text-[10px] text-white font-semibold">Upload</span>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
          </div>
          <p className="text-xs text-text-muted mt-3">Tap to upload a new profile picture</p>
        </div>

        {error && (
          <div className="bg-red-50 text-danger p-4 rounded-xl text-sm border border-red-100 font-medium">
            {error}
          </div>
        )}

        <div>
          <h3 className="text-xs font-bold text-text-main uppercase tracking-wider mb-4 ml-1">Personal Information</h3>
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-xs font-semibold text-text-main uppercase tracking-wide mb-1.5 ml-1">Display Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <IoPersonOutline size={18} className="text-text-muted" />
                </div>
                <input type="text" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="relative">
              <label className="block text-xs font-semibold text-text-main uppercase tracking-wide mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <IoMailOutline size={18} className="text-text-muted" />
                </div>
                <input type="email" disabled value={user?.email || ''} className="w-full bg-bg-hover border border-border-main rounded-xl px-11 py-3 text-sm text-text-muted cursor-not-allowed" />
              </div>
              <p className="text-xs text-text-muted mt-2 ml-1">Email cannot be changed.</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-text-main uppercase tracking-wider mb-4 ml-1">Change Password</h3>
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-xs font-semibold text-text-main uppercase tracking-wide mb-1.5 ml-1">Current Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <IoLockClosedOutline size={18} className="text-text-muted" />
                </div>
                <input type={showCurrent ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" className={inputClass} />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-muted hover:text-text-main">
                  {showCurrent ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                </button>
              </div>
            </div>
            <div className="relative">
              <label className="block text-xs font-semibold text-text-main uppercase tracking-wide mb-1.5 ml-1">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <IoLockClosedOutline size={18} className="text-text-muted" />
                </div>
                <input type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" className={inputClass} />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-muted hover:text-text-main">
                  {showNew ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                </button>
              </div>
            </div>
            <div className="relative">
              <label className="block text-xs font-semibold text-text-main uppercase tracking-wide mb-1.5 ml-1">Confirm New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <IoLockClosedOutline size={18} className="text-text-muted" />
                </div>
                <input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" className={inputClass} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-muted hover:text-text-main">
                  {showConfirm ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                </button>
              </div>
              <p className="text-xs text-text-muted mt-2 ml-1">Leave blank to keep current password.</p>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button type="submit" disabled={!hasChanges || isSaving} className="w-full bg-primary text-white py-3.5 rounded-2xl font-bold hover:bg-primary-dark disabled:opacity-50 disabled:hover:bg-primary transition-all shadow-sm">
            {isSaving ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
        <div className="pt-4 border-t border-border-main">
          <button type="button" onClick={() => alert("Please contact support@mathmentor.ai to delete your account.")} className="w-full bg-bg-hover text-danger py-3.5 rounded-2xl font-bold hover:bg-red-100 transition-all">
            Delete Account
          </button>
        </div>
      </form>
    </div>
  );
}
