import { useEffect, useState } from 'react';
import { IoLogOutOutline, IoWarningOutline } from 'react-icons/io5';

/**
 * Modern Confirmation Dialogue for Signing Out
 */
export default function SignOutModal({ isOpen, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-[#1a2333] border border-gray-100 dark:border-[#2d3748] rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Warning Icon Header */}
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400 border border-red-100 dark:border-red-900/40 flex items-center justify-center mx-auto mb-4 shadow-2xs">
          <IoLogOutOutline size={32} />
        </div>

        {/* Modal Title & Message */}
        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">
          Sign Out of Account?
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-300 mb-6 leading-relaxed">
          Are you sure you want to log out? You will need to sign back in to resume your practice sessions and AI tutoring.
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="flex-1 bg-gray-100 dark:bg-[#2d3748] hover:bg-gray-200 dark:hover:bg-[#374151] text-gray-700 dark:text-white font-bold py-3.5 px-4 rounded-2xl text-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleSignOut}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 px-4 rounded-2xl text-sm transition-all shadow-md shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing out…</span>
              </>
            ) : (
              <>
                <IoWarningOutline size={18} />
                <span>Sign Out</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
