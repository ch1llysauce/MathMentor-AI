import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ActiveSessionProvider } from './context/ActiveSessionContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import { IoShieldOutline } from 'react-icons/io5';

import Landing      from './pages/Landing';
import Login        from './pages/Login';
import Register     from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard    from './pages/Dashboard';
import Diagnosis    from './pages/Diagnosis';
import TutorAI      from './pages/TutorAI';
import Profile      from './pages/Profile';
import EditProfile  from './pages/profile/EditProfile';
import Settings     from './pages/profile/Settings';
import Help         from './pages/profile/Help';
import FAQ          from './pages/profile/FAQ';
import About        from './pages/profile/About';
import Privacy      from './pages/profile/Privacy';
import Terms        from './pages/profile/Terms';

// Practice sub-pages
import PracticeIndex  from './pages/practice/index';
import TopicScreen    from './pages/practice/Topic';
import LessonScreen   from './pages/practice/Lesson';
import LessonChat     from './pages/practice/LessonChat';
import ProblemsScreen from './pages/practice/Problems';

function SessionRevokedModal() {
  const { sessionRevoked, dismissSessionRevoked } = useAuth();
  const navigate = useNavigate();

  if (!sessionRevoked) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1a2333] rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center animate-[fadeIn_0.2s_ease-out]">
        <div className="w-14 h-14 rounded-full bg-[rgba(255,152,0,0.1)] text-[#ff9800] flex items-center justify-center mx-auto mb-4">
          <IoShieldOutline size={30} />
        </div>
        <h3 className="text-lg font-bold text-[#091426] dark:text-[#f0f4f9] mb-2">Session Ended</h3>
        <p className="text-xs text-[#75777d] dark:text-[#94a3b8] mb-6 leading-relaxed">
          You have been signed out of this device by another active session. If this wasn't you, please sign in and change your password immediately.
        </p>
        <button
          onClick={() => {
            dismissSessionRevoked();
            navigate('/login');
          }}
          className="w-full bg-[#4b41e1] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#3323cc] transition-colors cursor-pointer"
        >
          Sign In Again
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <ThemeProvider>
        <AuthProvider>
          <ActiveSessionProvider>
            <BrowserRouter>
              <SessionRevokedModal />
              <Routes>
                {/* Public */}
                <Route path="/"                element={<Landing />} />
                <Route path="/login"           element={<Login />} />
                <Route path="/register"        element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Protected — all share the sidebar layout */}
                <Route
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/dashboard"  element={<Dashboard />} />
                  <Route path="/diagnosis"  element={<Diagnosis />} />
                  <Route path="/tutor"      element={<TutorAI />} />
                  <Route path="/profile"          element={<Profile />} />
                  <Route path="/profile/edit"     element={<EditProfile />} />
                  <Route path="/profile/settings" element={<Settings />} />
                  <Route path="/profile/help"     element={<Help />} />
                  <Route path="/profile/faq"      element={<FAQ />} />
                  <Route path="/profile/about"    element={<About />} />
                  <Route path="/profile/privacy"  element={<Privacy />} />
                  <Route path="/profile/terms"    element={<Terms />} />

                  {/* Practice hierarchy */}
                  <Route path="/practice"                          element={<PracticeIndex />} />
                  <Route path="/practice/topic/:topicName"        element={<TopicScreen />} />
                  <Route path="/practice/lesson/:lessonId"        element={<LessonScreen />} />
                  <Route path="/practice/lesson-chat/:lessonId"   element={<LessonChat />} />
                  <Route path="/practice/problems"                element={<ProblemsScreen />} />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </ActiveSessionProvider>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

