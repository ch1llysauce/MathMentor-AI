# MathMentor AI

An adaptive mathematics learning platform with an AI-powered tutor. The system assesses student knowledge through diagnostics, builds a personalized learning path, and provides Socratic-style tutoring via a multi-model AI fallback chain.

## Monorepo Structure

```
mathmentor-ai/
├── backend/    # Node.js/Express REST API
├── mobile/     # React Native (Expo) mobile app
└── web/        # React + Vite landing page
```

## Tech Stack

| Layer    | Technology |
|----------|------------|
| Backend  | Node.js, Express 5, MongoDB (Mongoose), JWT, Google OAuth 2.0 |
| AI       | Groq (LLaMA 3.3 70B) → Gemini 1.5 Flash → Rule-based fallback |
| Mobile   | React Native 0.86, Expo 57, Expo Router, TypeScript |
| Web      | React 19, Vite 8 |

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

Runs on `http://localhost:5000`. See [backend/README.md](./backend/README.md) for full API reference.

### Mobile

```bash
cd mobile
npm install
# Set EXPO_PUBLIC_API_URL in mobile/.env
npx expo start
```

Scan the QR code with Expo Go, or run `npm run android` / `npm run ios`.

### Web

```bash
cd web
npm install
npm run dev        # http://localhost:5173
npm run build      # production build
```

## Key Features

- **Diagnostic assessment** — placement test that maps student knowledge before learning begins
- **Adaptive learning path** — topics and difficulty adjust based on mastery scores
- **AI Tutor** — Socratic hints and explanations powered by Groq/Gemini with a rule-based fallback
- **Practice problems** — client-side and server-side problem generation per topic
- **Progress tracking** — mastery rings, weak-area cards, streak tracking, timeline charts
- **Auth** — email/password, Google Sign-In, TOTP 2FA, OTP-based password reset

## Environment Variables

Each sub-project has its own `.env`. Key variables:

**backend/.env**
```env
MONGO_URI=<mongodb_connection_string>
JWT_SECRET=<secret>
GROQ_API_KEY=<key>
GEMINI_API_KEY=<key>
GOOGLE_WEB_CLIENT_ID=<client_id>
RESEND_API_KEY=<key>
PORT=5000
NODE_ENV=development
```

**mobile/.env**
```env
EXPO_PUBLIC_API_URL=http://<your_local_ip>:5000/api
```

## Deployment

- **Backend** — Render (`https://mathmentor-ai-i8sl.onrender.com`)
- **Mobile** — EAS Build (`eas.json` configured in `mobile/`)

## License

MIT — see [LICENSE](./LICENSE).
