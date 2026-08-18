import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
  IoArrowBack,
  IoMoonOutline,
  IoColorPaletteOutline,
  IoRefreshOutline,
  IoChevronForwardOutline,
  IoCheckmarkCircleOutline,
  IoLogoAndroid,
  IoDownloadOutline,
} from 'react-icons/io5';

const ACCENT_THEMES = [
  { id: 'indigo', name: 'Indigo', color: '#4b41e1' },
  { id: 'emerald', name: 'Emerald', color: '#00a472' },
  { id: 'sunset', name: 'Sunset', color: '#ea580c' },
  { id: 'ocean', name: 'Ocean', color: '#2563eb' },
  { id: 'midnight', name: 'Obsidian', color: '#0f172a' },
  { id: 'amethyst', name: 'Amethyst', color: '#7c3aed' },
  { id: 'rose', name: 'Rose', color: '#e11d48' },
  { id: 'aurora', name: 'Aurora', color: '#0d9488' },
  { id: 'unicorn', name: 'Unicorn', color: '#ec4899' },
];

export default function Settings() {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode, accentTheme, setAccentTheme, primaryColor, themeGradient } = useTheme();

  // Modals
  const [showResetModal, setShowResetModal] = useState(false);

  const [toast, setToast] = useState('');
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleResetSettings = () => {
    if (darkMode) toggleDarkMode();
    setAccentTheme('indigo');

    setShowResetModal(false);
    showToast('All settings reset to default.');
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
          className="w-10 h-10 rounded-full bg-[#f2f4f6] dark:bg-gray-800 hover:bg-[#e2e8f0] dark:hover:bg-gray-700 text-[#091426] dark:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <IoArrowBack size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#091426] dark:text-white tracking-tight">Settings</h1>
          <p className="text-xs text-[#75777d] dark:text-gray-400">Manage app preferences and display themes</p>
        </div>
      </div>

      {/* Responsive Grid for PC */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left Column: Appearance */}
        <div className="space-y-6">
          {/* Appearance */}
          <div>
            <h2 className="text-sm font-semibold text-[#45474c] dark:text-gray-300 uppercase tracking-wider mb-2 ml-1">Appearance</h2>
            <div className="bg-white dark:bg-[#1a2333] rounded-2xl shadow-sm border border-[#e0e3e5] dark:border-[#2d3748] overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(75,65,225,0.1)] flex items-center justify-center text-[#4b41e1]">
                    <IoMoonOutline size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#091426] dark:text-white">Dark Mode</p>
                    <p className="text-xs text-[#75777d] dark:text-gray-400">Use dark theme throughout the app</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={toggleDarkMode}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#e0e3e5] dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4b41e1]"></div>
                </label>
              </div>

              {/* Accent Color Scheme */}
              <div className="p-4 border-t border-[#f2f4f6] dark:border-[#2d3748]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(33,150,243,0.1)] flex items-center justify-center text-[#2196f3]">
                    <IoColorPaletteOutline size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#091426] dark:text-white">Accent Color Scheme</p>
                    <p className="text-xs text-[#75777d] dark:text-gray-400">Set app accent colors based on preset themes</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5 mt-2">
                  {ACCENT_THEMES.map((theme) => {
                    const isSelected = accentTheme === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => {
                          setAccentTheme(theme.id);
                          showToast(`Accent theme set to ${theme.name}`);
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                          isSelected ? 'ring-2 ring-offset-2 ring-[#091426] dark:ring-white' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: theme.color }}
                        title={theme.name}
                      >
                        {isSelected && <IoCheckmarkCircleOutline className="text-white text-base drop-shadow-xs" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: System Preferences & Mobile App */}
        <div className="space-y-6">
          {/* Mobile App */}
          <div>
            <h2 className="text-sm font-semibold text-[#45474c] dark:text-gray-300 uppercase tracking-wider mb-2 ml-1">Mobile Application</h2>
            <div className="bg-white dark:bg-[#1a2333] rounded-2xl shadow-sm border border-[#e0e3e5] dark:border-[#2d3748] p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <IoLogoAndroid size={22} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#091426] dark:text-white">MathMentor AI for Android</p>
                  <p className="text-xs text-[#75777d] dark:text-gray-400">Native mobile app version (.apk)</p>
                </div>
              </div>
              <p className="text-xs text-[#75777d] dark:text-gray-400 leading-relaxed">
                Take MathMentor AI on the go! Practice anytime, anywhere with offline support and fluid touch interactions.
              </p>
              <a
                href={import.meta.env.VITE_APK_DOWNLOAD_URL || "/MathMentorAI.apk"}
                download="MathMentor-AI.apk"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white text-xs font-bold transition-all shadow-md active:scale-98 cursor-pointer"
                style={{ background: themeGradient }}
              >
                <IoDownloadOutline size={16} />
                <span>Download Android APK</span>
              </a>
            </div>
          </div>

          {/* System Preferences */}
          <div>
            <h2 className="text-sm font-semibold text-[#45474c] dark:text-gray-300 uppercase tracking-wider mb-2 ml-1">System Preferences</h2>
            <div className="bg-white dark:bg-[#1a2333] rounded-2xl shadow-sm border border-[#e0e3e5] dark:border-[#2d3748] overflow-hidden divide-y divide-[#f2f4f6] dark:divide-[#2d3748]">
              <button
                onClick={() => setShowResetModal(true)}
                className="w-full flex items-center justify-between p-4 hover:bg-[#f7f9fb] dark:hover:bg-[#252f40] transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(255,152,0,0.1)] flex items-center justify-center text-[#ff9800]">
                    <IoRefreshOutline size={20} />
                  </div>
                  <span className="text-sm font-semibold text-[#091426] dark:text-white">Reset Settings</span>
                </div>
                <IoChevronForwardOutline size={18} className="text-[#75777d] dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl text-center">
            <div className="w-12 h-12 rounded-full bg-[rgba(255,152,0,0.1)] text-[#ff9800] flex items-center justify-center mx-auto mb-3">
              <IoRefreshOutline size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#091426] mb-2">Reset All Settings?</h3>
            <p className="text-sm text-[#75777d] mb-6">
              This will reset all user preferences to default. Your learning progress will not be affected.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleResetSettings}
                className="flex-1 bg-[#ff9800] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#e08600] transition-colors cursor-pointer"
              >
                Reset
              </button>
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 bg-[#f2f4f6] text-[#45474c] py-2.5 rounded-xl font-semibold text-sm hover:bg-[#e0e3e5] transition-colors cursor-pointer"
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
