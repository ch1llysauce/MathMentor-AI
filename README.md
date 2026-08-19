# MathMentor AI

An adaptive mathematics learning platform for senior high school students (Algebra, Geometry, Trigonometry), powered by an AI tutor and diagnostic-driven personalized learning paths. Available as a **React Web Application** and a **React Native (Expo) Mobile Application**, both powered by a unified **Node.js/Express** backend and MongoDB database.

---

## 🏗️ Repository Structure

```
mathmentor-ai/
├── backend/    # Node.js / Express 5 REST API & MongoDB database models
├── mobile/     # React Native (Expo SDK 57) mobile application for Android
└── web/        # React 19 / Vite responsive web application
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Web Platform** | React 19, Vite, React Router v7, Tailwind CSS, KaTeX (LaTeX math rendering), React Icons |
| **Mobile App** | React Native 0.86, Expo SDK 57, Expo Router v3, TypeScript |
| **Backend API** | Node.js, Express.js 5, MongoDB (Mongoose), JWT, Google OAuth 2.0 |
| **AI Services** | Groq (`openai/gpt-oss-120b`) |
| **Security & Auth**| bcryptjs, TOTP 2FA (`speakeasy`), OTP Password Reset (`resend`), Multi-device session revocation |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18 or higher
- **MongoDB**: MongoDB Atlas cluster or local instance
- **Groq API Key**: [console.groq.com](https://console.groq.com)
- **Google OAuth Web Client ID**: [Google Cloud Console](https://console.cloud.google.com)

---

### 1. Backend Setup

```bash
cd backend
npm install

# Create .env file (see backend/README.md for reference)
npm run dev        # Starts development server on http://localhost:5000
```

---

### 2. Web Application Setup

```bash
cd web
npm install

# Create .env file (VITE_API_URL=http://localhost:5000/api)
npm run dev        # Starts Vite dev server on http://localhost:5173
```

---

### 3. Mobile Application Setup

```bash
cd mobile
npm install

# Configure API URL in src/constants/api.ts or EXPO_PUBLIC_API_URL
npx expo start          # Expo Go / Development Client
npx expo run:android    # Local Native Android build
```

---

## ✨ Key Features Across Platforms

### 🎯 Diagnostic & Adaptive Learning
- **9-Question Placement Test**: Benchmarks knowledge across Algebra, Geometry, and Trigonometry (1 Easy, 1 Medium, 1 Hard per subject).
- **Diagnostic History & Question Review**: Comprehensive past attempt reviews with question snapshots, LaTeX formulas, user vs. correct answer highlights, and explanations on mobile and web.
- **Dynamic Learning Paths**: Automatically ranks topic mastery and generates personalized study recommendations based on diagnostic results.
- **116 Structured Lessons**: 28 modules across 3 subjects with lesson objectives, step-by-step examples, and key takeaways.

### ✍️ Practice & Assessment
- **Topic-Based Practice**: Multiple question types (multiple choice, true/false, free response) with instant grading.
- **KaTeX LaTeX Math Rendering**: Formatted mathematical formulas and equations across web and mobile.
- **Adaptive Question Generator**: Generates practice questions matching student mastery levels.
- **Floating Scientific Calculator**: Available globally on web and integrated into practice sessions.

### 🤖 Tutor AI Assistant
- **Socratic Pedagogy**: Powered by Groq (`openai/gpt-oss-120b`).
- **Personalized Responses**: Adapts explanations according to user language preferences and custom settings.
- **Persistent Chat History**: Saves lesson conversation sessions to MongoDB.

### 👤 Profile, Security & Customization
- **Theme Engine**: Dark/Light mode support with 9 dynamic accent color themes and custom banner gradient previews.
- **Session Security**: Multi-device session management with IP address and city/location tracking, plus single-click session revocation.
- **Downloadable APK**: Built-in direct download for the native Android build (`.apk`).

---

## 🔐 Environment Variables

### `backend/.env`
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/mathmentor
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_32_chars_min
JWT_EXPIRE=7d
GOOGLE_WEB_CLIENT_ID=your_google_web_client_id
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
RESEND_API_KEY=your_resend_api_key
```

### `web/.env`
```env
VITE_API_URL=http://localhost:5000/api
```

### `mobile/.env`
```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_google_web_client_id
```

---

## 🌐 Deployment

- **Backend**: Render (`https://mathmentor-ai-i8sl.onrender.com`)
- **Web App**: Vercel / Render / Netlify
- **Mobile APK**: Built via EAS Build (`eas build --platform android --profile preview`)

---

## 📚 Curriculum Breakdown

- **Algebra**: 10 modules · 45 lessons
- **Geometry**: 9 modules · 40 lessons
- **Trigonometry**: 9 modules · 31 lessons
- **Total**: 116 lessons across 28 modules

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).
