# MathMentor AI — Backend

REST API for the MathMentor AI adaptive mathematics learning platform.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js 5
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT + Google OAuth 2.0 (`google-auth-library`)
- **2FA:** TOTP via `speakeasy`
- **Password Reset:** OTP via email (`resend`)
- **AI Services:** Groq (LLaMA 3.3 70B) → Gemini 1.5 Flash → Rule-based fallback
- **Security:** bcryptjs, express-validator
- **Deployment:** Render

## Project Structure

```
backend/
├── config/
│   └── db.js                    # MongoDB connection
├── controllers/
│   ├── authController.js        # Auth, Google OAuth, 2FA, password reset, sessions
│   ├── aiController.js          # AI tutor logic
│   ├── diagnosticController.js  # Diagnostic assessments
│   ├── learningController.js    # Learning sessions + diagnostic submission
│   ├── practiceController.js    # Practice problems + daily challenge
│   ├── progressController.js    # Progress tracking + learning path
│   ├── questionController.js    # Question bank
│   └── tutorController.js       # AI tutor chat
├── middleware/
│   ├── auth.js                  # JWT verification
│   ├── validator.js             # Request validation
│   ├── errorHandler.js          # Global error handler
│   └── index.js
├── models/
│   ├── User.js                  # User (Google OAuth, 2FA, streaks, daily challenge)
│   ├── Progress.js              # Topic mastery tracking
│   ├── Question.js              # Diagnostic question bank
│   ├── DiagnosticResult.js      # Diagnostic results per submission
│   ├── Session.js               # Learning sessions
│   ├── LoginSession.js          # Active session tracking (per-device)
│   ├── LessonConversation.js    # AI tutor conversation history per lesson
│   ├── UserLessonProgress.js    # Per-lesson completion status
│   ├── UserProblemAttempt.js    # Problem attempt history
│   ├── PracticeProblem.js       # Practice problem bank
│   ├── Lesson.js                # Lesson content (sections, examples, takeaways)
│   └── index.js
├── routes/
│   ├── authRoutes.js            # /api/auth
│   ├── aiRoutes.js              # /api/ai
│   ├── questionRoutes.js        # /api/questions
│   ├── progressRoutes.js        # /api/progress
│   ├── learningRoutes.js        # /api/learning
│   ├── practiceRoutes.js        # /api/practice
│   ├── diagnosticRoutes.js      # /api/diagnostic
│   ├── tutorRoutes.js           # /api/tutor
│   └── index.js
├── services/
│   ├── aiRouter.js              # Groq → Gemini → Rule-based fallback chain
│   ├── mathService.js           # Math validation helpers
│   ├── learningPath.js          # Adaptive learning path algorithm
│   └── diagnosticGenerator.js  # Diagnostic question generation
├── .env                         # Environment variables (gitignored)
└── server.js                    # Express entry point
```

## Quick Start

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment variables

Create a `.env` file:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_32_chars_minimum
JWT_EXPIRE=7d
GOOGLE_WEB_CLIENT_ID=your_google_web_client_id
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
RESEND_API_KEY=your_resend_api_key
```

### 3. Seed the database

```bash
node seed-production.js          # Questions + basic curriculum
node seed-full-curriculum.js     # Full lesson content (recommended)
node seed-lesson-content.js      # Lesson body text (AI-generated via Groq)
```

### 4. Start the server

```bash
npm run dev    # development (nodemon)
npm start      # production
```

Server runs on `http://localhost:5000`.

---

## API Reference

### Authentication — `/api/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register with email/password |
| POST | `/login` | Public | Login — returns JWT |
| POST | `/google` | Public | Google Sign-In / link existing account |
| POST | `/google/register` | Public | Complete Google registration |
| GET | `/profile` | Private | Get current user profile |
| PUT | `/profile` | Private | Update display name, grade, preferences |
| POST | `/logout` | Private | Logout (revoke current session) |
| GET | `/sessions` | Private | List active login sessions |
| DELETE | `/sessions/:id` | Private | Revoke a specific session |
| DELETE | `/sessions/others/all` | Private | Revoke all other sessions |
| GET | `/data-export` | Private | Export all user data |
| DELETE | `/account` | Private | Delete account permanently |
| POST | `/forgot-password` | Public | Send 6-digit OTP to email |
| POST | `/verify-reset-otp` | Public | Verify OTP → short-lived reset token |
| POST | `/reset-password` | Public | Reset password with reset token |
| POST | `/2fa/setup` | Private | Generate 2FA secret + QR code |
| POST | `/2fa/verify` | Private | Enable 2FA (confirm TOTP code) |
| POST | `/2fa/validate` | Public | Validate TOTP during login |
| POST | `/2fa/disable` | Private | Disable 2FA |

### AI Tutor — `/api/ai`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/ask` | Ask the AI tutor (Socratic method, lesson-aware) |
| POST | `/explain` | Get a full explanation of a concept |
| POST | `/hint` | Get a hint for a problem |
| GET | `/status` | Check AI service availability and active model |

### Questions — `/api/questions`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List questions with filters |
| GET | `/random` | Random practice questions |
| GET | `/diagnostic` | Diagnostic question set (9 questions) |
| POST | `/submit` | Submit an answer |

### Progress — `/api/progress`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | All user progress records |
| GET | `/stats/summary` | Progress summary with topic stats |
| GET | `/weak-areas` | Weak topic areas (mastery < 50%) |
| GET | `/learning-path` | Personalized learning path from diagnostic |
| GET | `/next-recommendation` | Next recommended subtopic |
| POST | `/update-streak` | Update daily activity streak |

### Learning — `/api/learning`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/session/start` | Start a learning session |
| PUT | `/session/:id/end` | End a session |
| POST | `/diagnostic/submit` | Submit diagnostic answers → builds learning path |
| GET | `/diagnostic/latest` | Latest diagnostic result |

### Practice — `/api/practice`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/categories` | Available topics and categories |
| GET | `/problems` | Lesson-specific problems (requires `lessonId`) |
| GET | `/daily-status` | Today's daily challenge status + score for the current user |
| POST | `/daily-complete` | Record daily challenge completion with score |

> General practice problems are generated client-side (`clientProblemGenerator.ts`) — no backend call needed.

### Diagnostic — `/api/diagnostic`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard` | Full diagnostic dashboard with history |
| GET | `/timeline` | Score history for timeline chart (`?period=week\|month\|6months`) |
| GET | `/weak-areas` | Detailed weak areas with priority ratings |
| GET | `/recommendations` | Personalized study recommendations |
| GET | `/compare` | Compare last two diagnostic results |

### Tutor — `/api/tutor`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/chat` | Send a message to the AI tutor (with conversation context) |
| DELETE | `/conversation/:id` | Clear a tutor conversation |

---

## Key Data Models

### User
Stores profile, auth credentials, streak, and daily challenge completions. The `dailyChallengeCompletions` array tracks per-day scores server-side so progress is account-bound, not device-local.

```js
dailyChallengeCompletions: [{
  date: String,       // "YYYY-MM-DD"
  topic: String,
  score: Number,      // correct answers
  total: Number,      // total problems
  completedAt: Date
}]
```

### DiagnosticResult
Stores per-topic scores (algebra/geometry/trigonometry), weak/strong topic arrays, and timestamps. The mobile dashboard reads `correctAnswers / totalQuestions` from here for the accuracy stat.

### Lesson
Full lesson content with sections, examples, step-by-step solutions, and key takeaways. Content was AI-generated via Groq and stored in MongoDB.

### LessonConversation
Persists AI tutor chat history per lesson per user. Restored on re-entry so students can continue where they left off.

---

## Authentication Flow

```
Email/Password
  → bcrypt verify → JWT + LoginSession created

Google Sign-In
  → ID token verified server-side via google-auth-library
  → Existing account: JWT issued
  → New user: requiresRegistration flag → client completes /google/register

Two-Factor Authentication
  → Login returns requiresTwoFactor: true + userId
  → Client posts TOTP code to /2fa/validate
  → JWT issued on success

Password Reset
  → /forgot-password → 6-digit OTP sent via Resend email API
  → /verify-reset-otp validates OTP → short-lived reset token (10 min)
  → /reset-password uses reset token → new password set, OTP cleared
```

## AI System

```
User Message
     ↓
  AI Router
     ↓
1. Groq — LLaMA 3.3 70B (128k context)   ← Primary (free tier)
     ↓ on failure
2. Gemini 1.5 Flash                        ← Fallback
     ↓ on failure
3. Rule-based responses                    ← Always available
```

## Security

- JWT with unique `jti` (JWT ID) per session — allows per-session revocation
- bcryptjs password hashing (10 salt rounds)
- Google ID tokens verified server-side (not client-side)
- TOTP 2FA with `speakeasy` (30-second window)
- OTPs hashed with bcrypt before DB storage
- Per-email rate limiting on password reset (60-second cooldown)
- Input validation on all write endpoints via `express-validator`
- 401 responses never reveal whether an email exists

## Deployment (Render)

Live URL: `https://mathmentor-ai-i8sl.onrender.com`

Set all environment variables in the Render dashboard. Ensure `NODE_ENV=production` and a strong `JWT_SECRET` are configured. The free tier spins down after inactivity — first request may take ~30 seconds to cold-start.

## License

MIT
