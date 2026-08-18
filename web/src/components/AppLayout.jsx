import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  IoGridOutline, IoPencilOutline, IoSearchOutline,
  IoChatbubblesOutline, IoPersonOutline, IoLogOutOutline,
  IoMenuOutline, IoCloseOutline, IoCalculatorOutline,
  IoMoonOutline, IoSunnyOutline, IoWarningOutline,
} from 'react-icons/io5';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useActiveSession } from '../context/ActiveSessionContext';
import SignOutModal from './SignOutModal';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', Icon: IoGridOutline },
  { to: '/practice', label: 'Practice', Icon: IoPencilOutline },
  { to: '/diagnosis', label: 'Diagnosis', Icon: IoSearchOutline },
  { to: '/tutor', label: 'Tutor AI', Icon: IoChatbubblesOutline },
  { to: '/profile', label: 'Profile', Icon: IoPersonOutline },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const { activeSession, clearActiveSession } = useActiveSession();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [pendingPath, setPendingPath] = useState(null);

  const handleConfirmSignOut = async () => {
    await logout();
    navigate('/');
  };

  const handleNavClick = (e, targetPath, onNav) => {
    if (onNav) onNav();
    if (location.pathname === targetPath) return;

    if (activeSession) {
      e.preventDefault();
      setPendingPath(targetPath);
      setShowSessionModal(true);
    }
  };

  const SidebarContent = ({ onNav }) => (
    <>
      {/* Logo - Clickable to Landing Page */}
      <NavLink
        to="/"
        onClick={(e) => handleNavClick(e, '/', onNav)}
        className="p-5 border-b border-[#e0e3e5] dark:border-[#2d3748] flex items-center gap-3 hover:opacity-85 transition-opacity cursor-pointer"
      >
        <img src="/logo.png" alt="MathMentor AI Logo" className="w-9 h-9 rounded-xl object-contain shadow-xs" />
        <span className="text-lg font-bold text-[#091426] dark:text-white tracking-tight">MathMentor AI</span>
      </NavLink>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={(e) => handleNavClick(e, to, onNav)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive
                ? 'bg-[#e2dfff] text-[#4b41e1]'
                : 'text-[#45474c] hover:bg-[#f2f4f6] hover:text-[#091426]'
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-[#e0e3e5]">
        <NavLink
          to="/profile"
          onClick={(e) => handleNavClick(e, '/profile', onNav)}
          className="flex items-center gap-3 mb-3 p-1.5 -mx-1.5 rounded-xl hover:bg-[#f2f4f6] dark:hover:bg-[#252f40] transition-colors cursor-pointer group"
        >
          {user?.profileImage ? (
            <img src={user.profileImage} referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-full object-cover border-2 border-[#e2dfff] shrink-0" alt="" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#4b41e1] flex items-center justify-center text-white font-bold text-sm shrink-0 border-2 border-[#e2dfff]">
              {user?.displayName?.[0]?.toUpperCase() ?? 'U'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#091426] dark:text-white group-hover:text-[#4b41e1] transition-colors truncate">{user?.displayName ?? 'User'}</p>
            <p className="text-xs text-[#75777d] dark:text-gray-400 truncate">{user?.email ?? ''}</p>
          </div>
        </NavLink>
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#f2f4f6]">
          <button
            onClick={toggleDarkMode}
            className="flex-1 text-left text-xs font-semibold text-[#75777d] hover:text-[#4b41e1] transition-colors flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#f2f4f6]"
          >
            {darkMode ? <IoMoonOutline size={16} className="text-[#4b41e1]" /> : <IoSunnyOutline size={16} className="text-amber-400" />}
            <span>{darkMode ? 'Dark Theme' : 'Light Theme'}</span>
          </button>
          <button onClick={() => setShowSignOutModal(true)}
            className="text-xs text-[#75777d] hover:text-[#ba1a1a] transition-colors flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
            title="Sign out"
          >
            <IoLogOutOutline size={15} /> Sign out
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#f7f9fb] overflow-hidden">
      {/* Leave Session Confirmation Dialogue */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#1a2333] rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl text-center border border-gray-100 dark:border-[#2d3748] animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 border border-amber-100 dark:border-amber-800/40 flex items-center justify-center mx-auto mb-4 shadow-2xs">
              <IoWarningOutline size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {activeSession?.type === 'diagnostic' ? 'Leave Diagnostic Test?' : 'Leave Practice Session?'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              Are you sure you want to leave? Your current progress in this session will not be saved.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowSessionModal(false); setPendingPath(null); }}
                className="flex-1 bg-gray-100 dark:bg-[#252f40] hover:bg-gray-200 dark:hover:bg-[#2d3748] text-gray-700 dark:text-gray-200 font-bold py-3.5 px-4 rounded-2xl text-sm transition-colors cursor-pointer"
              >
                {activeSession?.type === 'diagnostic' ? 'Keep Testing' : 'Keep Practicing'}
              </button>
              <button
                onClick={() => {
                  if (activeSession?.allowLeaveRef) {
                    activeSession.allowLeaveRef.current = true;
                  }
                  clearActiveSession();
                  setShowSessionModal(false);
                  if (pendingPath) {
                    navigate(pendingPath);
                    setPendingPath(null);
                  }
                }}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 px-4 rounded-2xl text-sm transition-colors shadow-md shadow-red-500/20 cursor-pointer"
              >
                Leave Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sign Out Confirmation Dialogue */}
      <SignOutModal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={handleConfirmSignOut}
      />

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-[#e0e3e5] shrink-0">
        <SidebarContent onNav={undefined} />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-[#e0e3e5] flex flex-col transform transition-transform lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="absolute top-4 right-4">
          <button onClick={() => setMobileOpen(false)} className="text-[#75777d] hover:text-[#091426] p-1">
            <IoCloseOutline size={22} />
          </button>
        </div>
        <SidebarContent onNav={() => setMobileOpen(false)} />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-[#e0e3e5] shrink-0">
          <button onClick={() => setMobileOpen(true)} className="text-[#45474c] hover:text-[#091426]">
            <IoMenuOutline size={24} />
          </button>
          <NavLink
            to="/dashboard"
            onClick={(e) => handleNavClick(e, '/dashboard')}
            className="flex items-center gap-2 hover:opacity-85 transition-opacity cursor-pointer"
          >
            <img src="/logo.png" alt="MathMentor AI Logo" className="w-7 h-7 rounded-lg object-contain" />
            <span className="text-base font-bold text-[#091426]">MathMentor AI</span>
          </NavLink>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
