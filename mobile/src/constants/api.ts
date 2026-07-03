// API Configuration - Update the IP address below to match your network setup

// Step 1: Find your computer's IP address by running 'ipconfig' in command prompt
// Step 2: Find your phone's IP address in WiFi settings  
// Step 3: If both IPs start with the same numbers (like 192.168.1.x), use your computer's IP
// Step 4: If they're different, you'll need ngrok or ensure both devices are on same WiFi

// OPTION 1: Same WiFi Network - Replace with your computer's actual IP
const SAME_WIFI_IP = 'http://192.168.254.107:5000/api'; // Current computer IP

// OPTION 2: Different Networks - Use ngrok tunnel URL
const NGROK_TUNNEL = 'https://your-ngrok-url.ngrok.io/api'; // Replace with ngrok URL

// OPTION 3: Manual IP Override - Replace with the IP that works for you
const MANUAL_IP = 'http://192.168.254.107:5000/api'; // Replace YOUR_IP_HERE

// Choose which option to use by changing this line:
export const API_BASE_URL = SAME_WIFI_IP;

// 🔧 Quick IP Address Guide:
// Computer IP (run 'ipconfig'): 192.168.254.107
// Phone IP (check WiFi settings): ???
// If your phone IP starts with 192.168.254.x → use SAME_WIFI_IP  
// If your phone IP is different → use NGROK_TUNNEL or connect to same WiFi

// Safe to change: YES! This file only contains network configuration.

// API Endpoints remain the same
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  PROFILE: '/auth/profile',
  UPDATE_PROFILE: '/auth/profile',
  LOGOUT: '/auth/logout',
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
  GET_ALL: '/progress',
  GET_TOPIC: '/progress',
  GET_SUMMARY: '/progress/stats/summary',
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
