# MathMentor AI — Backend API

Centralized REST API for the **MathMentor AI** platform, powering both the **React Web Application** and the **React Native Mobile Application**. Built with **Node.js**, **Express.js 5**, **MongoDB**, and **Groq / Gemini AI APIs**.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js 5
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Authentication:** JWT + Google OAuth 2.0 (`google-auth-library`)
- **2FA:** TOTP via `speakeasy`
- **Password Reset:** OTP via email (`resend`)
- **AI Services:** Groq (LLaMA 3.3 70B primary) → Gemini 1.5 Flash (fallback) → Rule-based fallback
- **Security:** bcryptjs, express-validator, rate-limiting
- **Deployment:** Render (`https://mathmentor-ai-i8sl.onrender.com`)

---

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js                    # MongoDB connection config
├── controllers/
│   ├── authController.js        # Auth, Google OAuth, 2FA, password reset, active sessions
│   ├── aiController.js          # AI tutor prompting & preference formatting
│   ├── diagnosticController.js  # Diagnostic evaluation & timeline scoring
│   ├── learningController.js    # Learning sessions & diagnostic submission
│   ├── practiceController.js    # Practice problems & daily challenge completion
│   ├── progressController.js    # Topic mastery progress & adaptive learning paths
│   ├── questionController.js    # Question bank management
│   └── tutorController.js       # AI chat history per lesson/user
├── middleware/
│   ├── auth.js                  # JWT validation & user attachment
│   ├── validator.js             # Input sanitizer & express-validator
│   ├── errorHandler.js          # Global error handler
│   └── index.js
├── models/
│   ├── User.js                  # User profile, Google OAuth, 2FA, streaks, daily challenges
│   ├── Progress.js              # Topic mastery tracking
│   ├── Question.js              # Diagnostic question bank
│   ├── DiagnosticResult.js      # Diagnostic result histories
│   ├── Session.js               # Learning sessions
│   ├── LoginSession.js          # Multi-device session tracking (IP, location, user-agent)
│   ├── LessonConversation.js    # Saved AI tutor conversation history per lesson
│   ├── UserLessonProgress.js    # Per-lesson completion status
│   ├── UserProblemAttempt.js    # Problem attempt history
│   ├── PracticeProblem.js       # Practice problem bank
│   ├── Lesson.js                # Full curriculum content (116 lessons, 28 modules)
│   └── index.js
├── routes/
│   ├── authRoutes.js            # /api/auth
│   ├── aiRoutes.js              # /api/ai
│   ├── questionRoutes.js        # /api/questions
│   ├── progressRoutes.js        # /api/progress
│   ├── learningRoutes.js        # /api/learning
│   ├── practiceRoutes.js        # /api/practice
│   ├── diagnosticRoutes.js      # /api/diagnostic
│   └── tutorRoutes.js           # /api/tutor
├── services/
│   ├── aiRouter.js              # Groq → Gemini → Rule-based fallback chain
│   ├── mathService.js           # LaTeX & math string validation helpers
│   ├── learningPath.js          # Adaptive learning path algorithm
│   └── diagnosticGenerator.js  # Diagnostic question set generator
├── seed-full-curriculum.js     # Seeds 116 lessons & 28 modules into MongoDB
├── server.js                    # Express entry point
└── package.json
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Variables

Create a `.env` file in `backend/`:

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

### 3. Seed Database Curriculum

```bash
node seed-production.js          # Diagnostic questions & initial structure
node seed-full-curriculum.js     # Full curriculum (116 lessons across 28 modules)
```

### 4. Run Backend Server

```bash
npm run dev        # Development mode (nodemon)
npm start          # Production mode
```

Server runs locally on `http://localhost:5000`.

---

## 🛰️ Key API Endpoints

### 🔐 Authentication (`/api/auth`)
- `POST /register` — Register email & password.
- `POST /login` — Login user, creates `LoginSession` record with IP & city location.
- `POST /google` & `POST /google/register` — Google OAuth 2.0 authentication.
- `GET /profile` & `PUT /profile` — Fetch/update profile and tutor preferences (language, font size).
- `GET /sessions` — List active multi-device login sessions.
- `DELETE /sessions/:id` & `DELETE /sessions/others/all` — Revoke active login sessions.
- `POST /forgot-password` & `POST /verify-reset-otp` & `POST /reset-password` — OTP password reset.
- `POST /2fa/setup` & `POST /2fa/verify` & `POST /2fa/validate` — TOTP 2FA setup & validation.

### 🤖 AI Tutor (`/api/ai` & `/api/tutor`)
- `POST /api/ai/ask` — Ask Socratic AI tutor (integrates user language & settings preferences).
- `POST /api/ai/explain` — Request detailed concept explanation.
- `POST /api/ai/hint` — Request hint for a specific math problem.
- `POST /api/tutor/chat` — Save and retrieve persistent lesson chat thread.

### 🎯 Diagnostic & Practice (`/api/diagnostic` & `/api/practice`)
- `GET /api/questions/diagnostic` — Fetch 15-question benchmark test.
- `POST /api/learning/diagnostic/submit` — Submit test answers, recalculates topic mastery & generates learning path.
- `GET /api/diagnostic/dashboard` & `GET /api/diagnostic/timeline` — Diagnostic history & score trends.
- `GET /api/practice/daily-status` & `POST /api/practice/daily-complete` — Account-bound daily challenge tracking.

---

## 🔒 Security & Data Integrity

1. **Session Isolation**: Each login generates a unique `jti` JWT identifier tied to a `LoginSession` model, allowing users to inspect active locations/IPs and revoke specific sessions.
2. **Password & OTP Hashing**: Passwords and 6-digit reset OTPs are securely hashed with `bcryptjs`.
3. **AI Fallback Resilience**: 3-stage fallback pipeline ensures 100% tutor uptime even if third-party LLM providers rate-limit or fail.

---

## 📄 License

MIT License — see root [LICENSE](../LICENSE) file.
