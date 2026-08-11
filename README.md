# MathMentor AI

An adaptive mathematics learning platform for senior high school students, powered by an AI tutor and a diagnostic-driven personalized learning path. Built with React Native (Expo) for mobile and Node.js/Express for the backend.

## Monorepo Structure

```
mathmentor-ai/
├── backend/    # Node.js/Express REST API
└── mobile/     # React Native (Expo) mobile app
```

## Tech Stack

| Layer    | Technology |
|----------|------------|
| Backend  | Node.js, Express 5, MongoDB (Mongoose), JWT, Google OAuth 2.0 |
| AI       | Groq (LLaMA 3.3 70B) → Gemini 1.5 Flash → Rule-based fallback |
| Mobile   | React Native 0.86, Expo 57, Expo Router v3, TypeScript |

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Groq API key — [console.groq.com](https://console.groq.com/keys)
- Google OAuth Client ID — [Google Cloud Console](https://console.cloud.google.com)

### Backend

```bash
cd backend
npm install
# Copy and fill in .env (see backend/README.md for all variables)
npm run dev        # development (nodemon)
npm start          # production
```

Runs on `http://localhost:5000`. See [backend/README.md](./backend/README.md) for the full API reference.

### Mobile

```bash
cd mobile
npm install
# Set EXPO_PUBLIC_API_URL in mobile/.env
npx expo start          # Expo Go (most features)
npx expo run:android    # Full dev build (required for native modules)
```

> The app requires a **dev build** (`expo run:android`) rather than Expo Go for any native module features.

## Key Features

### Learning
- **Diagnostic assessment** — 15-question placement test across Algebra, Geometry, and Trigonometry that builds a personalized learning path
- **Adaptive learning path** — topics and difficulty auto-adjust based on diagnostic mastery scores
- **113 structured lessons** — across 28 modules in 3 subjects, with lesson content, examples, and key takeaways
- **In-lesson AI chat** — per-lesson AI tutor with persistent conversation history
- **Daily challenge** — 10 mixed problems per day with server-side score tracking per user

### Practice
- **Client-side problem generation** — instant practice sets without network calls
- **Multiple question types** — multiple choice, true/false, free response
- **Scientific calculator** — built-in during practice sessions
- **Score results screen** — breakdown of correct/incorrect after each session

### Progress & Dashboard
- **Knowledge Map** — mastery rings per topic with weak area cards
- **Mastery timeline** — bar chart with Y-axis labels tracking score history
- **Accuracy stat** — shown as diagnostic fraction (e.g. `18/30`) on the dashboard
- **Streak tracking** — daily activity streaks

### AI Tutor
- **Socratic tutoring** — Groq LLaMA 3.3 70B as primary, Gemini 1.5 Flash as fallback
- **Persistent conversations** — lesson chat history saved to MongoDB per user
- **Multi-language aware** — AI responds in whatever language the user writes in

### Auth
- Email/password registration and login
- Google Sign-In (Android)
- TOTP two-factor authentication
- OTP-based password reset via email
- Multi-session management with per-session revocation

## Environment Variables

**backend/.env**
```env
MONGO_URI=<mongodb_connection_string>
JWT_SECRET=<secret_32_chars_minimum>
GROQ_API_KEY=<key>
GEMINI_API_KEY=<key>
GOOGLE_WEB_CLIENT_ID=<client_id>
RESEND_API_KEY=<key>
PORT=5000
NODE_ENV=development
```

**mobile/.env**
```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<google_client_id>
```

API URL is set in `mobile/src/constants/api.ts`:
```ts
const USE_LOCAL = false;  // true = local backend, false = Render
const PRODUCTION_URL = 'https://mathmentor-ai-i8sl.onrender.com/api';
const LOCAL_URL = 'http://<your_local_ip>:5000/api';
```

## Deployment

- **Backend** — Render (`https://mathmentor-ai-i8sl.onrender.com`)
- **Mobile** — EAS Build (`eas build --platform android`)

## Curriculum

- **Algebra** — 10 modules, 47 lessons
- **Geometry** — 9 modules, 36 lessons
- **Trigonometry** — 9 modules, 30 lessons
- **Total** — 113 lessons across 28 modules

See [CURRICULUM-STRUCTURE.md](./CURRICULUM-STRUCTURE.md) for the full breakdown.

## License

MIT — see [LICENSE](./LICENSE).
