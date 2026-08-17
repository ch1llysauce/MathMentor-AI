import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
  IoArrowBack,
  IoMoonOutline,
  IoLanguageOutline,
  IoTextOutline,
  IoVolumeHighOutline,
  IoPhonePortraitOutline,
  IoPlayCircleOutline,
  IoTimerOutline,
  IoCalendarOutline,
  IoCloudUploadOutline,
  IoCloudOfflineOutline,
  IoServerOutline,
  IoBugOutline,
  IoRefreshOutline,
  IoCodeSlashOutline,
  IoChevronForwardOutline,
  IoCheckmarkCircleOutline,
  IoCloseOutline,
} from 'react-icons/io5';

export default function Settings() {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();

  // Settings state
  const [soundEffects, setSoundEffects] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [dataSync, setDataSync] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [devMode, setDevMode] = useState(false);

  // Modals & Selectors
  const [language, setLanguage] = useState('English');
  const [showLangModal, setShowLangModal] = useState(false);

  const [fontSize, setFontSize] = useState('Medium');
  const [showFontModal, setShowFontModal] = useState(false);

  const [sessionDuration, setSessionDuration] = useState('30 minutes');
  const [showDurationModal, setShowDurationModal] = useState(false);

  const [storageInfo, setStorageInfo] = useState({ used: '124 MB', cache: '39 MB' });
  const [showStorageModal, setShowStorageModal] = useState(false);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const [showResetModal, setShowResetModal] = useState(false);

  const [toast, setToast] = useState('');
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleClearCache = () => {
    setStorageInfo({ used: '85 MB', cache: '0 MB' });
    setShowStorageModal(false);
    showToast('Cache cleared successfully!');
  };

  const handleResetSettings = () => {
    if (darkMode) toggleDarkMode();
    setSoundEffects(true);
    setHapticFeedback(true);
    setAutoPlay(false);
    setDataSync(true);
    setOfflineMode(false);
    setDevMode(false);
    setLanguage('English');
    setFontSize('Medium');
    setSessionDuration('30 minutes');
    setShowResetModal(false);
    showToast('All settings reset to default.');
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    setReportSubmitted(true);
    setTimeout(() => {
      setReportSubmitted(false);
      setShowReportModal(false);
      setReportText('');
      showToast('Thank you! Your report has been submitted.');
    }, 1000);
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto pb-16">
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
          className="w-10 h-10 rounded-full bg-[#f2f4f6] hover:bg-[#e2e8f0] text-[#091426] flex items-center justify-center transition-colors"
        >
          <IoArrowBack size={20} />
        </button>
        <h1 className="text-2xl font-bold text-[#091426] tracking-tight">Settings</h1>
      </div>

      {/* Appearance */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-[#45474c] uppercase tracking-wider mb-2 ml-1">Appearance</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-[#e0e3e5] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[#f2f4f6]">
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
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-[#45474c] uppercase tracking-wider mb-2 ml-1">Interface</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-[#e0e3e5] overflow-hidden divide-y divide-[#f2f4f6]">
          <button
            onClick={() => setShowLangModal(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-[#f7f9fb] transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(33,150,243,0.1)] flex items-center justify-center text-[#2196f3]">
                <IoLanguageOutline size={20} />
              </div>
              <span className="text-sm font-semibold text-[#091426]">Language</span>
            </div>
            <div className="flex items-center gap-2 text-[#75777d] text-sm">
              <span>{language}</span>
              <IoChevronForwardOutline size={18} />
            </div>
          </button>

          <button
            onClick={() => setShowFontModal(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-[#f7f9fb] transition-colors text-left"
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

      {/* Sound & Audio */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-[#45474c] uppercase tracking-wider mb-2 ml-1">Sound & Audio</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-[#e0e3e5] overflow-hidden divide-y divide-[#f2f4f6]">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(255,152,0,0.1)] flex items-center justify-center text-[#ff9800]">
                <IoVolumeHighOutline size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#091426]">Sound Effects</p>
                <p className="text-xs text-[#75777d]">Play audio for interactions & correct answers</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={soundEffects}
                onChange={(e) => setSoundEffects(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff9800]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(75,65,225,0.1)] flex items-center justify-center text-[#4b41e1]">
                <IoPhonePortraitOutline size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#091426]">Haptic Feedback</p>
                <p className="text-xs text-[#75777d]">Vibrate on button taps & notifications</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={hapticFeedback}
                onChange={(e) => setHapticFeedback(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4b41e1]"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Learning Preferences */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-[#45474c] uppercase tracking-wider mb-2 ml-1">Learning Preferences</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-[#e0e3e5] overflow-hidden divide-y divide-[#f2f4f6]">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(0,164,114,0.1)] flex items-center justify-center text-[#00a472]">
                <IoPlayCircleOutline size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#091426]">Auto-Play Videos</p>
                <p className="text-xs text-[#75777d]">Automatically play lesson media content</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoPlay}
                onChange={(e) => setAutoPlay(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00a472]"></div>
            </label>
          </div>

          <button
            onClick={() => setShowDurationModal(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-[#f7f9fb] transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(75,65,225,0.1)] flex items-center justify-center text-[#4b41e1]">
                <IoTimerOutline size={20} />
              </div>
              <span className="text-sm font-semibold text-[#091426]">Target Session Duration</span>
            </div>
            <div className="flex items-center gap-2 text-[#75777d] text-sm">
              <span>{sessionDuration}</span>
              <IoChevronForwardOutline size={18} />
            </div>
          </button>

          <button
            onClick={() => showToast('Study schedule customization coming soon!')}
            className="w-full flex items-center justify-between p-4 hover:bg-[#f7f9fb] transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(0,164,114,0.1)] flex items-center justify-center text-[#00a472]">
                <IoCalendarOutline size={20} />
              </div>
              <span className="text-sm font-semibold text-[#091426]">Study Schedule Reminders</span>
            </div>
            <div className="flex items-center gap-2 text-[#75777d] text-sm">
              <span>Not set</span>
              <IoChevronForwardOutline size={18} />
            </div>
          </button>
        </div>
      </div>

      {/* Data & Storage */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-[#45474c] uppercase tracking-wider mb-2 ml-1">Data & Storage</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-[#e0e3e5] overflow-hidden divide-y divide-[#f2f4f6]">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(33,150,243,0.1)] flex items-center justify-center text-[#2196f3]">
                <IoCloudUploadOutline size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#091426]">Auto Sync</p>
                <p className="text-xs text-[#75777d]">Sync your learning progress automatically</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={dataSync}
                onChange={(e) => setDataSync(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2196f3]"></div>
            </label>
          </div>

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
                onChange={(e) => setOfflineMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff9800]"></div>
            </label>
          </div>

          <button
            onClick={() => setShowStorageModal(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-[#f7f9fb] transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(75,65,225,0.1)] flex items-center justify-center text-[#4b41e1]">
                <IoServerOutline size={20} />
              </div>
              <span className="text-sm font-semibold text-[#091426]">Storage Usage</span>
            </div>
            <div className="flex items-center gap-2 text-[#75777d] text-sm">
              <span>{storageInfo.used}</span>
              <IoChevronForwardOutline size={18} />
            </div>
          </button>
        </div>
      </div>

      {/* Advanced */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-[#45474c] uppercase tracking-wider mb-2 ml-1">Advanced</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-[#e0e3e5] overflow-hidden divide-y divide-[#f2f4f6]">
          <button
            onClick={() => setShowReportModal(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-[#f7f9fb] transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(186,26,26,0.1)] flex items-center justify-center text-[#ba1a1a]">
                <IoBugOutline size={20} />
              </div>
              <span className="text-sm font-semibold text-[#091426]">Report a Problem</span>
            </div>
            <IoChevronForwardOutline size={18} className="text-[#75777d]" />
          </button>

          <button
            onClick={() => setShowResetModal(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-[#f7f9fb] transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(255,152,0,0.1)] flex items-center justify-center text-[#ff9800]">
                <IoRefreshOutline size={20} />
              </div>
              <span className="text-sm font-semibold text-[#091426]">Reset Settings</span>
            </div>
            <IoChevronForwardOutline size={18} className="text-[#75777d]" />
          </button>

          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(75,65,225,0.1)] flex items-center justify-center text-[#4b41e1]">
                <IoCodeSlashOutline size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#091426]">Developer Mode</p>
                <p className="text-xs text-[#75777d]">Enable API & debug tools</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={devMode}
                onChange={(e) => setDevMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4b41e1]"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-white rounded-2xl p-5 border border-[#e0e3e5] shadow-sm text-center">
        <p className="text-xs text-[#75777d] uppercase tracking-wider font-semibold">App Information</p>
        <div className="flex items-center justify-center gap-6 mt-3">
          <div>
            <p className="text-xs text-[#75777d]">Version</p>
            <p className="text-sm font-bold text-[#091426]">1.0.0</p>
          </div>
          <div className="w-px h-8 bg-[#e0e3e5]"></div>
          <div>
            <p className="text-xs text-[#75777d]">Build</p>
            <p className="text-sm font-bold text-[#091426]">2026.08.001</p>
          </div>
        </div>
      </div>

      {/* Language Modal */}
      {showLangModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#091426]">Select Language</h3>
              <button onClick={() => setShowLangModal(false)} className="text-[#75777d] hover:text-[#091426]">
                <IoCloseOutline size={22} />
              </button>
            </div>
            <div className="space-y-2">
              {['English', 'Spanish', 'French', 'German', 'Filipino'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    setShowLangModal(false);
                    showToast(`Language set to ${lang}`);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    language === lang ? 'bg-[#4b41e1] text-white' : 'hover:bg-[#f7f9fb] text-[#091426]'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    fontSize === size ? 'bg-[#4b41e1] text-white' : 'hover:bg-[#f7f9fb] text-[#091426]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Session Duration Modal */}
      {showDurationModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#091426]">Session Duration</h3>
              <button onClick={() => setShowDurationModal(false)} className="text-[#75777d] hover:text-[#091426]">
                <IoCloseOutline size={22} />
              </button>
            </div>
            <div className="space-y-2">
              {['15 minutes', '30 minutes', '45 minutes', '60 minutes'].map((dur) => (
                <button
                  key={dur}
                  onClick={() => {
                    setSessionDuration(dur);
                    setShowDurationModal(false);
                    showToast(`Session target set to ${dur}`);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    sessionDuration === dur ? 'bg-[#4b41e1] text-white' : 'hover:bg-[#f7f9fb] text-[#091426]'
                  }`}
                >
                  {dur}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Storage Breakdown Modal */}
      {showStorageModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#091426]">Storage Usage</h3>
              <button onClick={() => setShowStorageModal(false)} className="text-[#75777d] hover:text-[#091426]">
                <IoCloseOutline size={22} />
              </button>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm py-1 border-b border-[#f2f4f6]">
                <span className="text-[#75777d]">Total Used:</span>
                <span className="font-semibold text-[#091426]">{storageInfo.used}</span>
              </div>
              <div className="flex justify-between text-sm py-1 border-b border-[#f2f4f6]">
                <span className="text-[#75777d]">App Assets & Core:</span>
                <span className="font-semibold text-[#091426]">85 MB</span>
              </div>
              <div className="flex justify-between text-sm py-1">
                <span className="text-[#75777d]">Cached Data & Images:</span>
                <span className="font-semibold text-[#091426]">{storageInfo.cache}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleClearCache}
                className="flex-1 bg-[#ba1a1a] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#93000a] transition-colors"
              >
                Clear Cache
              </button>
              <button
                onClick={() => setShowStorageModal(false)}
                className="flex-1 bg-[#f2f4f6] text-[#45474c] py-2.5 rounded-xl font-semibold text-sm hover:bg-[#e0e3e5] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Problem Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#091426]">Report a Problem</h3>
              <button onClick={() => setShowReportModal(false)} className="text-[#75777d] hover:text-[#091426]">
                <IoCloseOutline size={22} />
              </button>
            </div>
            <form onSubmit={handleReportSubmit} className="space-y-4">
              <p className="text-sm text-[#45474c]">Describe the issue you encountered in detail:</p>
              <textarea
                required
                rows={4}
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="e.g. KaTeX rendering error on lesson screen..."
                className="w-full bg-[#f2f4f6] border border-[#c5c6cd] rounded-xl p-3 text-sm text-[#091426] focus:outline-none focus:ring-2 focus:ring-[#4b41e1]"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={reportSubmitted}
                  className="flex-1 bg-[#4b41e1] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#3323cc] disabled:opacity-60 transition-colors"
                >
                  {reportSubmitted ? 'Submitting…' : 'Submit Report'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 bg-[#f2f4f6] text-[#45474c] py-2.5 rounded-xl font-semibold text-sm hover:bg-[#e0e3e5] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
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
                className="flex-1 bg-[#ff9800] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#e08600] transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => setShowResetModal(false)}
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
