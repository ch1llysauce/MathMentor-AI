import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

const getWebDeviceName = () => {
  const ua = navigator.userAgent || '';
  let os = 'Device';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/macintosh|mac os/i.test(ua)) os = 'Mac';
  else if (/linux/i.test(ua)) os = 'Linux';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  return `Web (${os})`;
};

// Attach auth token and device metadata to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['X-Client-Type'] = 'Web';
  config.headers['X-Device-Name'] = getWebDeviceName();
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new CustomEvent('session-revoked'));
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  register:            (data) => api.post('/auth/register', data),
  login:               (data) => api.post('/auth/login', data),
  logout:              ()     => api.post('/auth/logout'),
  getProfile:          ()     => api.get('/auth/profile'),
  updateProfile:       (data) => api.put('/auth/profile', data),
  changePassword:      (data) => api.put('/auth/change-password', data),
  forgotPassword:      (data) => api.post('/auth/forgot-password', data),
  verifyResetOtp:      (data) => api.post('/auth/verify-reset-otp', data),
  resetPassword:       (data) => api.post('/auth/reset-password', data),
  validate2FA:         (data) => api.post('/auth/2fa/validate', data),
  setup2FA:            ()     => api.post('/auth/2fa/setup'),
  verify2FA:           (data) => api.post('/auth/2fa/verify', data),
  disable2FA:          (data) => api.post('/auth/2fa/disable', data),
  getSessions:         ()     => api.get('/auth/sessions'),
  revokeSession:       (id)   => api.delete(`/auth/sessions/${id}`),
  revokeOtherSessions: ()     => api.delete('/auth/sessions/others/all'),
  deleteAccount:       ()     => api.delete('/auth/account'),
  getDataExport:       ()     => api.get('/auth/data-export'),
  googleAuth:          (data) => api.post('/auth/google', data),
  googleRegister:      (data) => api.post('/auth/google/register', data),
};

// ─── Progress ─────────────────────────────────────────────────────────────────
export const progressApi = {
  getAll:              (params) => api.get('/progress', { params }),
  getSummary:          ()       => api.get('/progress/stats/summary'),
  getWeakAreas:        ()       => api.get('/progress/weak-areas'),
  getLearningPath:     ()       => api.get('/progress/learning-path'),
  getNextRecommendation: ()     => api.get('/progress/next-recommendation'),
  updateStreak:        ()       => api.post('/progress/update-streak'),
};

// ─── Learning ─────────────────────────────────────────────────────────────────
export const learningApi = {
  getLessons:          (params) => api.get('/learning/lessons', { params }),
  getLesson:           (id)     => api.get(`/learning/lessons/${id}`),
  completeLesson:      (id, t)  => api.put(`/learning/lessons/${id}/complete`, { timeSpent: t }),
  markIncomplete:      (id)     => api.put(`/learning/lessons/${id}/incomplete`),
  getDiagnosticHistory:()       => api.get('/learning/diagnostic/history'),
  getLatestDiagnostic: ()       => api.get('/learning/diagnostic/latest'),
  submitDiagnostic:    (data)   => api.post('/learning/diagnostic/submit', data),
  getLessonConversation:(id)    => api.get(`/learning/lessons/${id}/conversation`),
  saveLessonMessage:   (id, d)  => api.post(`/learning/lessons/${id}/conversation`, d),
  deleteLessonConversation:(id) => api.delete(`/learning/lessons/${id}/conversation`),
};

// ─── Questions (diagnostic) ───────────────────────────────────────────────────
export const questionApi = {
  getDiagnostic: () => api.get('/questions/diagnostic'),
};

// ─── Diagnostic analytics ─────────────────────────────────────────────────────
export const diagnosticApi = {
  getDashboard:       () => api.get('/diagnostic/dashboard'),
  getTimeline:        (period) => api.get('/diagnostic/timeline', { params: { period } }),
  getWeakAreas:       () => api.get('/diagnostic/weak-areas'),
  getRecommendations: () => api.get('/diagnostic/recommendations'),
};

// ─── Practice ─────────────────────────────────────────────────────────────────
export const practiceApi = {
  getCategories:        ()       => api.get('/practice/categories'),
  getProblems:          (params) => api.get('/practice/problems', { params }),
  getDailyStatus:       ()       => api.get('/practice/daily-status'),
  completeDailyChallenge:(data)  => api.post('/practice/daily-complete', data),
};

// ─── Tutor ────────────────────────────────────────────────────────────────────
export const tutorApi = {
  chat:              (data) => api.post('/tutor/chat', data),
  clearConversation: (data) => api.post('/tutor/clear', data),
  getHistory:        (id)   => api.get(`/tutor/history/${id}`),
};
