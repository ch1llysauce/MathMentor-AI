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
  IoCloseOutline,
  IoAddOutline,
  IoRemoveOutline,
  IoWarningOutline,
  IoTrashOutline,
  IoAlertCircleOutline,
  IoKeyOutline,
} from 'react-icons/io5';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { authApi } from '../../services/api';

const BANNER_THEMES = [
  { id: 'indigo', name: 'Indigo', cssGradient: 'linear-gradient(135deg, #4b41e1 0%, #3d33d0 50%, #2b1fb8 100%)' },
  { id: 'emerald', name: 'Emerald', cssGradient: 'linear-gradient(135deg, #00a472 0%, #008f63 50%, #00704d 100%)' },
  { id: 'sunset', name: 'Sunset', cssGradient: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 50%, #dc2626 100%)' },
  { id: 'ocean', name: 'Ocean', cssGradient: 'linear-gradient(135deg, #0284c7 0%, #2563eb 50%, #4f46e5 100%)' },
  { id: 'midnight', name: 'Obsidian', cssGradient: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #020617 100%)' },
  { id: 'amethyst', name: 'Amethyst', cssGradient: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 50%, #4c1d95 100%)' },
  { id: 'rose', name: 'Rose', cssGradient: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 50%, #9f1239 100%)' },
  { id: 'aurora', name: 'Aurora', cssGradient: 'linear-gradient(135deg, #06b6d4 0%, #0d9488 50%, #115e59 100%)' },
  { id: 'unicorn', name: 'Unicorn', cssGradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%)' },
];

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, refreshProfile, saveAuth, logout } = useAuth();
  const { setAccentTheme } = useTheme();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [bannerTheme, setBannerTheme] = useState(user?.bannerTheme || 'indigo');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [successToast, setSuccessToast] = useState('');
  const fileInputRef = useRef(null);
  const rawImgRef = useRef(null);

  // Image Cropper Modal State
  const [cropModalSrc, setCropModalSrc] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Confirmation Modals State
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordSuccessModal, setShowPasswordSuccessModal] = useState(false);

  const hasChanges = useMemo(() => {
    const nameChanged = displayName.trim() !== (user?.displayName || '');
    const imageChanged = profileImage !== (user?.profileImage || '');
    const bannerChanged = bannerTheme !== (user?.bannerTheme || 'indigo');
    const passwordStarted = currentPassword.length > 0 || newPassword.length > 0 || confirmPassword.length > 0;
    return nameChanged || imageChanged || bannerChanged || passwordStarted;
  }, [displayName, profileImage, bannerTheme, currentPassword, newPassword, confirmPassword, user]);

  const handleCancel = () => {
    if (hasChanges) {
      setShowDiscardModal(true);
    } else {
      navigate('/profile');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setCropModalSrc(reader.result);
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setError('');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
    setDragStart({ x: clientX - pan.x, y: clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
    setPan({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const applyCrop = () => {
    const img = rawImgRef.current;
    if (!img) return;

    const CROP_SIZE = 400;
    const canvas = document.createElement('canvas');
    canvas.width = CROP_SIZE;
    canvas.height = CROP_SIZE;
    const ctx = canvas.getContext('2d');

    const PREVIEW_SIZE = 280;
    const minDim = Math.min(img.naturalWidth, img.naturalHeight);
    const srcCropDiameter = minDim / zoom;

    const scale = minDim / PREVIEW_SIZE;
    const centerX = (img.naturalWidth / 2) - (pan.x * scale / zoom);
    const centerY = (img.naturalHeight / 2) - (pan.y * scale / zoom);

    const srcX = Math.max(0, Math.min(img.naturalWidth - srcCropDiameter, centerX - (srcCropDiameter / 2)));
    const srcY = Math.max(0, Math.min(img.naturalHeight - srcCropDiameter, centerY - (srcCropDiameter / 2)));

    ctx.drawImage(img, srcX, srcY, srcCropDiameter, srcCropDiameter, 0, 0, CROP_SIZE, CROP_SIZE);
    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
    setProfileImage(compressedBase64);
    setCropModalSrc(null);
  };

  const handleSaveClick = (e) => {
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
    setError('');
    setShowSaveModal(true);
  };

  const executeSave = async () => {
    setShowSaveModal(false);
    setIsSaving(true);
    setError('');
    try {
      const nameChanged = displayName.trim() !== user?.displayName;
      const imageChanged = profileImage !== (user?.profileImage || '');
      const bannerChanged = bannerTheme !== (user?.bannerTheme || 'indigo');
      if (nameChanged || imageChanged || bannerChanged) {
        const { data } = await authApi.updateProfile({ displayName: displayName.trim(), profileImage, bannerTheme });
        const payload = data.data ?? data;
        const updatedUser = payload.user || payload;
        if (updatedUser) {
          saveAuth(updatedUser, localStorage.getItem('token'));
        }
        await refreshProfile();
      }
      let passwordChanged = false;
      if (newPassword && currentPassword) {
        await authApi.changePassword({ currentPassword, newPassword });
        passwordChanged = true;
      }

      if (passwordChanged) {
        setShowPasswordSuccessModal(true);
        return;
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

  const handlePasswordSuccessLogout = async () => {
    setShowPasswordSuccessModal(false);
    await logout();
    navigate('/login');
  };

  const executeDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await authApi.deleteAccount();
      await logout();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account. Please try again.');
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
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

      {/* Image Crop Modal */}
      {cropModalSrc && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a2333] border border-[#e0e3e5] dark:border-[#2d3748] rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#091426] dark:text-white">Adjust & Crop Photo</h3>
              <button
                type="button"
                onClick={() => setCropModalSrc(null)}
                className="text-[#75777d] hover:text-[#091426] dark:hover:text-white p-1 rounded-lg"
              >
                <IoCloseOutline size={22} />
              </button>
            </div>

            <p className="text-xs text-[#75777d] dark:text-gray-400 mb-4">
              Drag to reposition your photo and use the slider to zoom in or out.
            </p>

            {/* Crop Circle Frame */}
            <div
              className="relative w-[280px] h-[280px] mx-auto rounded-full overflow-hidden border-4 border-[#4b41e1] shadow-inner bg-black cursor-grab active:cursor-grabbing select-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchMove={handleMouseMove}
              onTouchEnd={handleMouseUp}
            >
              <img
                ref={rawImgRef}
                src={cropModalSrc}
                alt="Crop preview"
                className="absolute top-1/2 left-1/2 max-w-none origin-center pointer-events-none transition-transform duration-75"
                style={{
                  transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  maxHeight: '280px',
                }}
              />
            </div>

            {/* Zoom Slider */}
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(1, z - 0.2))}
                className="p-1.5 rounded-lg bg-[#f2f4f6] dark:bg-[#252f40] text-[#091426] dark:text-white hover:bg-[#e0e3e5] dark:hover:bg-[#323f54]"
              >
                <IoRemoveOutline size={16} />
              </button>
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-[#4b41e1] cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
                className="p-1.5 rounded-lg bg-[#f2f4f6] dark:bg-[#252f40] text-[#091426] dark:text-white hover:bg-[#e0e3e5] dark:hover:bg-[#323f54]"
              >
                <IoAddOutline size={16} />
              </button>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCropModalSrc(null)}
                className="px-5 py-2.5 rounded-xl font-semibold text-xs bg-[#f2f4f6] dark:bg-[#252f40] text-[#45474c] dark:text-white hover:bg-[#e0e3e5] dark:hover:bg-[#323f54] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyCrop}
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#4b41e1] text-white hover:bg-[#3323cc] transition-colors shadow-sm cursor-pointer"
              >
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Changes Confirmation Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a2333] border border-[#e0e3e5] dark:border-[#2d3748] rounded-3xl p-6 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[rgba(75,65,225,0.1)] text-[#4b41e1] flex items-center justify-center">
                  <IoCheckmarkCircleOutline size={22} />
                </div>
                <h3 className="text-lg font-bold text-[#091426] dark:text-white">Save Changes?</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="text-[#75777d] hover:text-[#091426] dark:hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <IoCloseOutline size={22} />
              </button>
            </div>

            <p className="text-sm text-[#45474c] dark:text-gray-300 mb-6 leading-relaxed">
              Are you sure you want to save your updated profile details and preferences?
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-xs bg-[#f2f4f6] dark:bg-[#252f40] text-[#45474c] dark:text-white hover:bg-[#e0e3e5] dark:hover:bg-[#323f54] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeSave}
                disabled={isSaving}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs bg-[#4b41e1] text-white hover:bg-[#3323cc] transition-colors shadow-sm cursor-pointer"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a2333] border border-[#e0e3e5] dark:border-[#2d3748] rounded-3xl p-6 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950/60 text-[#ba1a1a] dark:text-red-400 flex items-center justify-center">
                  <IoTrashOutline size={22} />
                </div>
                <h3 className="text-lg font-bold text-[#ba1a1a] dark:text-red-400">Delete Account?</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="text-[#75777d] hover:text-[#091426] dark:hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <IoCloseOutline size={22} />
              </button>
            </div>

            <p className="text-sm text-[#45474c] dark:text-gray-300 mb-6 leading-relaxed">
              This action is permanent and cannot be undone. All your progress, diagnostics, learning history, and account credentials will be erased.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-xs bg-[#f2f4f6] dark:bg-[#252f40] text-[#45474c] dark:text-white hover:bg-[#e0e3e5] dark:hover:bg-[#323f54] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDeleteAccount}
                disabled={isDeleting}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs bg-[#ba1a1a] text-white hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unsaved Changes Confirmation Modal */}
      {showDiscardModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a2333] border border-[#e0e3e5] dark:border-[#2d3748] rounded-3xl p-6 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-[#ff9800] flex items-center justify-center">
                  <IoWarningOutline size={22} />
                </div>
                <h3 className="text-lg font-bold text-[#091426] dark:text-white">Unsaved Changes</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDiscardModal(false)}
                className="text-[#75777d] hover:text-[#091426] dark:hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <IoCloseOutline size={22} />
              </button>
            </div>

            <p className="text-sm text-[#45474c] dark:text-gray-300 mb-6 leading-relaxed">
              You have unsaved profile changes. Are you sure you want to leave without saving?
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowDiscardModal(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-xs bg-[#f2f4f6] dark:bg-[#252f40] text-[#45474c] dark:text-white hover:bg-[#e0e3e5] dark:hover:bg-[#323f54] transition-colors cursor-pointer"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-xs bg-red-50 dark:bg-red-950/40 text-[#ba1a1a] dark:text-red-400 border border-red-200 dark:border-red-800/40 hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors cursor-pointer"
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={handleCancel}
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
      <form onSubmit={handleSaveClick} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Avatar & Banner Theme Card (4 Columns on PC) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1a2333] border border-[#e0e3e5] dark:border-[#2d3748] rounded-3xl p-5 shadow-sm text-center flex flex-col items-center">
          {/* Live Hero Banner Preview Card */}
          <div
            className="w-full rounded-2xl p-6 text-white shadow-md relative overflow-hidden transition-all duration-300 mb-5"
            style={{ background: BANNER_THEMES.find(t => t.id === bannerTheme)?.cssGradient || BANNER_THEMES[0].cssGradient }}
          >
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <div className="relative group mx-auto mb-3 w-28 h-28">
              <div className="w-28 h-28 rounded-full border-4 border-white/40 shadow-md overflow-hidden bg-black/20 flex items-center justify-center">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-white">{initial}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <IoCameraOutline size={26} className="text-white mb-0.5" />
                <span className="text-[11px] text-white font-semibold">Change</span>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
            </div>

            <h2 className="text-lg font-bold text-white tracking-tight">{displayName || 'User'}</h2>
            <p className="text-xs text-white/80 mt-0.5 font-medium">{user?.email}</p>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-[#f2f4f6] dark:bg-[#252f40] hover:bg-[#e2e8f0] dark:hover:bg-[#323f54] text-[#091426] dark:text-white text-xs font-semibold py-2.5 rounded-xl transition-colors cursor-pointer mb-5"
          >
            Upload New Picture
          </button>

          {/* Banner Gradient Presets Selector */}
          <div className="w-full text-left pt-4 border-t border-[#f2f4f6] dark:border-[#2d3748]">
            <label className="block text-xs font-semibold text-[#091426] dark:text-white uppercase tracking-wide mb-2.5">
              Banner Theme Presets
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {BANNER_THEMES.map((theme) => {
                const isSelected = bannerTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setBannerTheme(theme.id)}
                    className={`relative p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#4b41e1] bg-[#4b41e1]/5 dark:bg-[#4b41e1]/20 ring-2 ring-[#4b41e1]/40'
                        : 'border-[#e0e3e5] dark:border-[#2d3748] hover:border-[#4b41e1]/50'
                    }`}
                  >
                    <div
                      className="w-full h-8 rounded-lg shadow-xs relative flex items-center justify-center"
                      style={{ background: theme.cssGradient }}
                    >
                      {isSelected && <IoCheckmarkCircleOutline size={16} className="text-white drop-shadow-sm" />}
                    </div>
                    <span className="text-[11px] font-medium text-[#091426] dark:text-white">
                      {theme.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
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
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748b]">
                    <IoMailOutline size={18} />
                  </div>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full bg-[#e0e3e5]/60 dark:bg-[#121824] border border-[#c5c6cd]/50 dark:border-[#2d3748] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#64748b] dark:text-[#64748b] disabled:text-[#64748b] disabled:opacity-100 cursor-not-allowed select-none"
                    style={{ color: '#64748b' }}
                  />
                </div>
                <p className="text-[11px] text-[#64748b] mt-1 ml-1">Email cannot be changed.</p>
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

          {/* Danger Zone: Delete Account */}
          <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/30 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-[#ba1a1a] dark:text-red-400 uppercase tracking-wider mb-2">
              Danger Zone
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#091426] dark:text-white">Delete Account</p>
                <p className="text-xs text-[#75777d] dark:text-gray-400">
                  Permanently delete your account, learning data, and progress.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-[#1a2333] border border-red-300 dark:border-red-800 text-[#ba1a1a] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors shadow-xs shrink-0 cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
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

      {/* Password Changed Success Modal */}
      {showPasswordSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a2333] rounded-3xl p-6 max-w-sm w-full shadow-xl text-center">
            <div className="w-12 h-12 rounded-full bg-[rgba(75,65,225,0.1)] text-[#4b41e1] flex items-center justify-center mx-auto mb-3">
              <IoKeyOutline size={28} />
            </div>
            <h3 className="text-lg font-bold text-[#091426] dark:text-[#f0f4f9] mb-2">Password Changed Successfully</h3>
            <p className="text-xs text-[#75777d] dark:text-[#94a3b8] mb-6 leading-relaxed">
              Your password has been updated. For security reasons, you will now be logged out. Please sign in with your new password.
            </p>
            <button
              type="button"
              onClick={handlePasswordSuccessLogout}
              className="w-full bg-[#4b41e1] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#3323cc] transition-colors cursor-pointer"
            >
              Log In Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
