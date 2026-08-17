import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  IoGridOutline, IoPencilOutline, IoSearchOutline,
  IoChatbubblesOutline, IoPersonOutline, IoLogOutOutline,
  IoMenuOutline, IoCloseOutline, IoCalculatorOutline,
  IoMoonOutline, IoSunOutline,
} from 'react-icons/io5';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', Icon: IoGridOutline },
  { to: '/practice',  label: 'Practice',  Icon: IoPencilOutline },
  { to: '/diagnosis', label: 'Diagnosis', Icon: IoSearchOutline },
  { to: '/tutor',     label: 'Tutor AI',  Icon: IoChatbubblesOutline },
  { to: '/profile',   label: 'Profile',   Icon: IoPersonOutline },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => { await logout(); navigate('/'); };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? 'bg-[#e2dfff] text-[#4b41e1]'
        : 'text-[#45474c] hover:bg-[#f2f4f6] hover:text-[#091426]'
    }`;

  const SidebarContent = ({ onNav }) => (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-[#e0e3e5] flex items-center gap-3">
        <div className="w-9 h-9 bg-[#4b41e1] rounded-xl flex items-center justify-center shadow-sm">
          <IoCalculatorOutline size={20} color="#fff" />
        </div>
        <span className="text-lg font-bold text-[#091426] tracking-tight">MathMentor AI</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} className={navLinkClass} onClick={onNav}>
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-[#e0e3e5]">
        <div className="flex items-center gap-3 mb-3">
          {user?.profileImage ? (
            <img src={user.profileImage} referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-full object-cover border-2 border-[#e2dfff] shrink-0" alt="" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#4b41e1] flex items-center justify-center text-white font-bold text-sm shrink-0 border-2 border-[#e2dfff]">
              {user?.displayName?.[0]?.toUpperCase() ?? 'U'}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#091426] truncate">{user?.displayName ?? 'User'}</p>
            <p className="text-xs text-[#75777d] truncate">{user?.email ?? ''}</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#f2f4f6]">
          <button
            onClick={toggleDarkMode}
            className="flex-1 text-left text-xs font-semibold text-[#75777d] hover:text-[#4b41e1] transition-colors flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#f2f4f6]"
          >
            {darkMode ? <IoSunOutline size={16} className="text-amber-400" /> : <IoMoonOutline size={16} className="text-[#4b41e1]" />}
            <span>{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
          </button>
          <button onClick={handleLogout}
            className="text-xs text-[#75777d] hover:text-[#ba1a1a] transition-colors flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-red-50"
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
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#4b41e1] rounded-lg flex items-center justify-center">
              <IoCalculatorOutline size={15} color="#fff" />
            </div>
            <span className="text-base font-bold text-[#091426]">MathMentor AI</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
