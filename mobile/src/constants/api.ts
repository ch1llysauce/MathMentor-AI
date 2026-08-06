// API Configuration - Update the IP address below to match your network setup

// PRODUCTION URL (from Render deployment)
// Replace with your actual Render URL after deployment
const PRODUCTION_URL = 'https://mathmentor-ai-i8sl.onrender.com/api'; // Fixed: Added /api suffix

// LOCAL DEVELOPMENT URL
const LOCAL_URL = 'http://192.168.254.112:5000/api';

// Toggle between production and local
// Set to true when testing with local backend
// Set to false when using deployed backend
const USE_LOCAL = false;

export const API_BASE_URL = USE_LOCAL ? LOCAL_URL : PRODUCTION_URL;

// 🔧 Quick Setup Guide:
// 1. Deploy backend to Render
// 2. Copy the URL from Render (e.g., https://your-app.onrender.com)
// 3. Update PRODUCTION_URL above
// 4. Set USE_LOCAL = false
// 5. Rebuild your mobile app

// For local development:
// Set USE_LOCAL = true to use your PC's backend

// API Endpoints remain the same
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  PROFILE: '/auth/profile',
  UPDATE_PROFILE: '/auth/profile',
  LOGOUT: '/auth/logout',
  TWO_FA_SETUP: '/auth/2fa/setup',
  TWO_FA_VERIFY: '/auth/2fa/verify',
  TWO_FA_VALIDATE: '/auth/2fa/validate',
  TWO_FA_DISABLE: '/auth/2fa/disable',
};

export const QUESTION_ENDPOINTS = {
  GET_QUESTIONS: '/questions',
  GET_RANDOM: '/questions/random',
  GET_DIAGNOSTIC: '/questions/diagnostic',
  SUBMIT_ANSWER: '/questions/submit',
};

export const AI_ENDPOINTS = {
  ASK: '/ai/ask',
  EXPLAIN: '/ai/explain',
  HINT: '/ai/hint',
};

export const PROGRESS_ENDPOINTS = {
  BASE: '/progress',
  GET_ALL: '/progress',
  GET_TOPIC: '/progress',
  GET_SUMMARY: '/progress/stats/summary',
  SUMMARY: '/progress/stats/summary',
  LEARNING_PATH: '/progress/learning-path',
  NEXT_RECOMMENDATION: '/progress/next-recommendation',
  UPDATE_STREAK: '/progress/update-streak',
  WEAK_AREAS: '/progress/weak-areas',
};

export const LEARNING_ENDPOINTS = {
  START_SESSION: '/learning/session/start',
  END_SESSION: '/learning/session',
  GET_SESSION: '/learning/session',
  SESSION_HISTORY: '/learning/sessions',
  SUBMIT_DIAGNOSTIC: '/learning/diagnostic/submit',
  GET_DIAGNOSTIC: '/learning/diagnostic/latest',
  GET_REVIEW: '/learning/review',
};
