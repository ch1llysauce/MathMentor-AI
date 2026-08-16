import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

import Landing      from './pages/Landing';
import Login        from './pages/Login';
import Register     from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard    from './pages/Dashboard';
import Diagnosis    from './pages/Diagnosis';
import TutorAI      from './pages/TutorAI';
import Profile      from './pages/Profile';

// Practice sub-pages
import PracticeIndex  from './pages/practice/index';
import TopicScreen    from './pages/practice/Topic';
import LessonScreen   from './pages/practice/Lesson';
import LessonChat     from './pages/practice/LessonChat';
import ProblemsScreen from './pages/practice/Problems';

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <BrowserRouter>
        <AuthProvider>
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
              <Route path="/profile"    element={<Profile />} />

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
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}
