# MathMentor AI — Backend

REST API for the MathMentor AI adaptive mathematics learning system.

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
│   ├── learningController.js    # Learning sessions
│   ├── practiceController.js    # Practice problems
│   ├── progressController.js    # Progress tracking
│   ├── questionController.js    # Question bank
│   ├── tutorController.js       # Tutor interactions
│   └── index.js
├── middleware/
│   ├── auth.js                  # JWT verification
│   ├── validator.js             # Request validation
│   ├── errorHandler.js          # Global error handler
│   └── index.js
├── models/
│   ├── User.js                  # User schema (supports Google OAuth, 2FA, streaks)
│   ├── Progress.js              # Topic mastery tracking
│   ├── Question.js              # Question bank
│   ├── DiagnosticResult.js      # Diagnostic results
│   ├── Session.js               # Learning sessions
│   ├── LoginSession.js          # Active session tracking
│   ├── LessonConversation.js    # AI tutor conversation history
│   ├── UserLessonProgress.js    # Per-lesson progress
│   ├── UserProblemAttempt.js    # Problem attempt history
│   ├── PracticeProblem.js       # Practice problem bank
│   ├── Lesson.js                # Lesson content
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
│   ├── aiRouter.js              # Groq → Gemini → Rule-based fallback
│   ├── mathService.js           # Math validation engine
│   ├── learningPath.js          # Adaptive learning algorithm
│   └── diagnosticGenerator.js  # Diagnostic question generation
├── utils/
│   └── aiPromptBuilder.js       # AI prompt construction
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
# Database
MONGO_URI=your_mongodb_connection_string

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret_32_chars_minimum
JWT_EXPIRE=7d

# Google OAuth
GOOGLE_WEB_CLIENT_ID=your_google_web_client_id

# AI Services
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key

# Email (password reset OTPs)
RESEND_API_KEY=your_resend_api_key
```

### 3. Start the server

```bash
# Development
npm run dev

# Production
npm start
```

Server runs on `http://localhost:5000`

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register with email/password |
| POST | `/login` | Public | Login, returns JWT |
| POST | `/google` | Public | Google Sign-In / link account |
| POST | `/google/register` | Public | Complete Google registration |
| GET | `/profile` | Private | Get current user profile |
| PUT | `/profile` | Private | Update profile |
| PUT | `/change-password` | Private | Change password |
| POST | `/logout` | Private | Logout |
| GET | `/sessions` | Private | List active login sessions |
| DELETE | `/sessions/:id` | Private | Revoke a session |
| DELETE | `/sessions/others/all` | Private | Revoke all other sessions |
| GET | `/data-export` | Private | Export all user data |
| DELETE | `/account` | Private | Delete account |
| POST | `/forgot-password` | Public | Send OTP to email |
| POST | `/verify-reset-otp` | Public | Verify OTP, get reset token |
| POST | `/reset-password` | Public | Reset password with token |
| POST | `/2fa/setup` | Private | Generate 2FA secret + QR code |
| POST | `/2fa/verify` | Private | Enable 2FA |
| POST | `/2fa/validate` | Public | Validate TOTP during login |
| POST | `/2fa/disable` | Private | Disable 2FA |

### AI Tutor (`/api/ai`)
- `POST /ask` — Ask the AI tutor (Socratic method)
- `POST /explain` — Get a full explanation
- `POST /hint` — Get a hint for a problem
- `GET /status` — Check AI service availability

### Questions (`/api/questions`)
- `GET /` — List questions (filterable)
- `GET /random` — Random practice questions
- `GET /diagnostic` — Diagnostic question set
- `POST /submit` — Submit an answer

### Progress (`/api/progress`)
- `GET /` — All user progress
- `GET /stats/summary` — Progress summary
- `GET /weak-areas` — Weak topic areas
- `GET /learning-path` — Personalized learning path
- `GET /next-recommendation` — Next recommended topic
- `POST /update-streak` — Update daily streak

### Learning (`/api/learning`)
- `POST /session/start` — Start a session
- `PUT /session/:id/end` — End a session
- `POST /diagnostic/submit` — Submit diagnostic results
- `GET /diagnostic/latest` — Latest diagnostic result

## Authentication Flow

```
Email/Password Login
  → bcrypt verify → JWT issued → LoginSession created

Google Sign-In
  → ID token verified with google-auth-library
  → Existing user: JWT issued
  → New user: requiresRegistration flag returned → /google/register

Two-Factor Authentication
  → Login returns requiresTwoFactor: true
  → Client submits TOTP code to /2fa/validate
  → JWT issued on success

Password Reset
  → /forgot-password sends 6-digit OTP via Resend email
  → /verify-reset-otp validates OTP → short-lived reset token
  → /reset-password uses reset token to set new password
```

## AI System

```
User Question
     ↓
AI Router
     ↓
1. Groq API (LLaMA 3.3 70B)   ← Primary
     ↓ (on failure)
2. Gemini 1.5 Flash            ← Fallback
     ↓ (on failure)
3. Rule-based tutor            ← Always available
```

## Security Features

- JWT with unique `jti` per session for session revocation
- bcryptjs password hashing (salt rounds: 10)
- Google ID token server-side verification
- TOTP 2FA with `speakeasy` (30s window)
- OTP hashed before storage (bcrypt)
- Per-email rate limiting on password reset (60s cooldown)
- Input validation on all endpoints via `express-validator`
- 401 responses never reveal whether email exists

## Deployment (Render)

The backend is deployed at: `https://mathmentor-ai-i8sl.onrender.com`

Required environment variables must be set in the Render dashboard. Ensure `NODE_ENV=production` and a strong `JWT_SECRET` are configured.

## License

MIT License — see LICENSE file for details.
