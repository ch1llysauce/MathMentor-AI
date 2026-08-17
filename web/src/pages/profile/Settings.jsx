import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
  IoArrowBack,
  IoMoonOutline,
  IoTextOutline,
  IoCloudOfflineOutline,
  IoRefreshOutline,
  IoChevronForwardOutline,
  IoCheckmarkCircleOutline,
  IoCloseOutline,
} from 'react-icons/io5';

export default function Settings() {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode, fontSize, setFontSize } = useTheme();

  // Settings state
  const [offlineMode, setOfflineMode] = useState(() => {
    return localStorage.getItem('mathmentor_offline_mode') === 'true';
  });

  const handleOfflineModeToggle = (checked) => {
    setOfflineMode(checked);
    localStorage.setItem('mathmentor_offline_mode', String(checked));
    if (checked) {
      showToast('Offline Cache Mode enabled. Lessons & formulas pre-cached.');
    } else {
      showToast('Offline Cache Mode disabled.');
    }
  };

  // Modals
  const [showFontModal, setShowFontModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const [toast, setToast] = useState('');
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleResetSettings = () => {
    if (darkMode) toggleDarkMode();
    setOfflineMode(false);
    localStorage.removeItem('mathmentor_offline_mode');

    setFontSize('Medium');
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
          className="w-10 h-10 rounded-full bg-[#f2f4f6] hover:bg-[#e2e8f0] text-[#091426] flex items-center justify-center transition-colors cursor-pointer"
        >
          <IoArrowBack size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#091426] tracking-tight">Settings</h1>
          <p className="text-xs text-[#75777d]">Manage app preferences, display, and data storage</p>
        </div>
      </div>

      {/* Responsive Grid for PC */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left Column: Appearance, Interface */}
        <div className="space-y-6">
          {/* Appearance */}
          <div>
            <h2 className="text-sm font-semibold text-[#45474c] uppercase tracking-wider mb-2 ml-1">Appearance</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-[#e0e3e5] overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(75,65,225,0.1)] flex items-center justify-center text-[#4b41e1]">
                    <IoMoonOutline size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#091426]">Dark Mode</p>
                    <p className="text-xs text-[#75777d]">Use dark theme throughout the app</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={toggleDarkMode}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4b41e1]"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Interface */}
          <div>
            <h2 className="text-sm font-semibold text-[#45474c] uppercase tracking-wider mb-2 ml-1">Interface</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-[#e0e3e5] overflow-hidden divide-y divide-[#f2f4f6]">
              <button
                onClick={() => setShowFontModal(true)}
                className="w-full flex items-center justify-between p-4 hover:bg-[#f7f9fb] transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(75,65,225,0.1)] flex items-center justify-center text-[#4b41e1]">
                    <IoTextOutline size={20} />
                  </div>
                  <span className="text-sm font-semibold text-[#091426]">Font Size</span>
                </div>
                <div className="flex items-center gap-2 text-[#75777d] text-sm">
                  <span>{fontSize}</span>
                  <IoChevronForwardOutline size={18} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Data & Storage, Advanced */}
        <div className="space-y-6">
          {/* Data & Storage */}
          <div>
            <h2 className="text-sm font-semibold text-[#45474c] uppercase tracking-wider mb-2 ml-1">Data & Storage</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-[#e0e3e5] overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(255,152,0,0.1)] flex items-center justify-center text-[#ff9800]">
                    <IoCloudOfflineOutline size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#091426]">Offline Cache Mode</p>
                    <p className="text-xs text-[#75777d]">Pre-cache offline lessons</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={offlineMode}
                    onChange={(e) => handleOfflineModeToggle(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff9800]"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Advanced */}
          <div>
            <h2 className="text-sm font-semibold text-[#45474c] uppercase tracking-wider mb-2 ml-1">Advanced</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-[#e0e3e5] overflow-hidden divide-y divide-[#f2f4f6]">
              <button
                onClick={() => setShowResetModal(true)}
                className="w-full flex items-center justify-between p-4 hover:bg-[#f7f9fb] transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(255,152,0,0.1)] flex items-center justify-center text-[#ff9800]">
                    <IoRefreshOutline size={20} />
                  </div>
                  <span className="text-sm font-semibold text-[#091426]">Reset Settings</span>
                </div>
                <IoChevronForwardOutline size={18} className="text-[#75777d]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Font Size Modal */}
      {showFontModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#091426]">Font Size</h3>
              <button onClick={() => setShowFontModal(false)} className="text-[#75777d] hover:text-[#091426]">
                <IoCloseOutline size={22} />
              </button>
            </div>
            <div className="space-y-2">
              {['Small', 'Medium', 'Large', 'Extra Large'].map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    setFontSize(size);
                    setShowFontModal(false);
                    showToast(`Font size changed to ${size}`);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${fontSize === size ? 'bg-[#4b41e1] text-white' : 'hover:bg-[#f7f9fb] text-[#091426]'
                    }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
