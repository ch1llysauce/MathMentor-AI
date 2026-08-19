# MathMentor AI — Mobile Application

A cross-platform native mobile application for Android built with **React Native** and **Expo SDK 57**, delivering adaptive mathematics learning, diagnostic placement tests, and AI tutoring on mobile devices.

---

## ✨ Key Mobile Features

- **Adaptive Diagnostic Assessment**: 9-question placement test evaluating student mastery across Algebra, Geometry, and Trigonometry.
- **Adaptive Practice Sets**: Client-side & server-side problem sets with step-by-step hint generation and KaTeX math formatting.
- **AI Math Tutor**: Socratic AI chat assistant powered by Groq (`openai/gpt-oss-120b`) tailored to student learning preferences.
- **Theme & Personalization Engine**: Dark/Light mode support with 9 dynamic accent color themes and live banner gradient preview builder.
- **Session Security**: Location-aware active session management (city/location, IP address, device model) with single-tap remote session revocation.
- **Authentication**: Email/password authentication, Google OAuth 2.0 Sign-In (`@react-native-google-signin/google-signin`), TOTP 2FA, and OTP password resets.

---

## 🛠️ Tech Stack

- **Framework:** Expo SDK 57 / React Native 0.86
- **Navigation:** Expo Router v3 (file-based routing)
- **Language:** TypeScript
- **Auth:** JWT + Google Sign-In (`@react-native-google-signin/google-signin` v16)
- **HTTP Client:** Axios with auto-retry interceptors
- **Storage:** `@react-native-async-storage/async-storage`
- **Styling:** Dynamic StyleSheet theme provider (Dark/Light mode + 9 accent colors)
- **Build System:** EAS Build (`eas build --platform android`)

---

## 📁 Project Structure

```
mobile/
├── src/
│   ├── app/                  # File-based routes (Expo Router)
│   │   ├── (tabs)/           # Main tab screens (Dashboard, Practice, Tutor, Diagnostic, Profile)
│   │   ├── auth/             # Login, Register, Forgot Password
│   │   ├── practice/         # Lesson viewer, Lesson AI chat, Problems runner, Topic list
│   │   ├── profile/          # Settings, Edit Profile, Active Sessions, Privacy
│   │   ├── diagnostic/       # Retake assessment, Diagnostic history, Question review detail view, Topic details
│   │   └── _layout.tsx       # Root layout (AuthProvider + ThemeProvider)
│   ├── components/           # Reusable UI components (Modals, Cards, Math text)
│   ├── constants/            # API config, color presets, curriculum data
│   ├── context/              # AuthContext, ThemeContext
│   ├── hooks/                # Custom React hooks (useAuth, useTheme)
│   ├── services/             # API services (auth, practice, tutor, diagnostic)
│   ├── types/                # TypeScript interfaces & types
│   └── utils/                # Storage & formatting helpers
├── assets/                   # App icons, splash screens, logos
├── app.json                  # Expo app configuration
├── eas.json                  # EAS Build profiles
└── google-services.json      # Firebase / Google OAuth configuration
```

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Environment Configuration

Create a `.env` file in `mobile/`:

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_google_web_client_id
```

### 3. API URL Configuration

Edit `mobile/src/constants/api.ts`:

```ts
const USE_LOCAL = false;  // false = Production (Render), true = Local Backend
const PRODUCTION_URL = 'https://mathmentor-ai-i8sl.onrender.com/api';
const LOCAL_URL = 'http://<your_local_ip>:5000/api';
```

### 4. Run Development Client

```bash
# Start Metro bundler
npx expo start

# Run native Android build on connected device / emulator
npx expo run:android
```

> **Note:** Google Sign-In requires native module support and runs on dev builds (`npx expo run:android`) or compiled APK builds.

---

## 📦 Building Android APK via EAS

### Preview Build (Standalone `.apk` for testing)

```bash
eas build --platform android --profile preview
```

### Production Build (`.aab` bundle for Google Play)

```bash
eas build --platform android --profile production
```

---

## 📄 License

MIT License — see root [LICENSE](../LICENSE) file.
