# MathMentor AI — Mobile App

A React Native (Expo) mobile app for adaptive mathematics learning, powered by an AI tutor.

## Tech Stack

- **Framework:** Expo SDK 57 / React Native 0.86
- **Navigation:** Expo Router (file-based routing)
- **Language:** TypeScript
- **Auth:** JWT + Google Sign-In (`@react-native-google-signin/google-signin` v16)
- **HTTP:** Axios
- **Storage:** AsyncStorage
- **Styling:** StyleSheet (dark/light theme support)
- **Build:** EAS Build

## Project Structure

```
mobile/
├── src/
│   ├── app/                  # File-based routes (Expo Router)
│   │   ├── (tabs)/           # Bottom tab screens (dashboard, practice, tutor, diagnostic, profile)
│   │   ├── auth/             # Login, register, forgot-password
│   │   ├── practice/         # Lesson, lesson-chat, problems, topic
│   │   ├── profile/          # Settings, edit-profile, about, faq, help, privacy
│   │   ├── diagnostic/       # Retake, topic-detail
│   │   ├── legal/            # Terms, privacy-policy
│   │   └── _layout.tsx       # Root layout (AuthProvider + ThemeProvider)
│   ├── components/           # Reusable UI components
│   ├── constants/            # API endpoints, colors, theme, curriculum
│   ├── context/              # AuthContext, ThemeContext
│   ├── hooks/                # useAuth, useTheme, useColorScheme
│   ├── services/             # API calls (auth, tutor, practice, lessons, etc.)
│   ├── types/                # TypeScript types
│   └── utils/                # Storage helpers
├── android/                  # Native Android project
├── assets/                   # Images and icons
├── app.json                  # Expo config
├── eas.json                  # EAS Build profiles
└── google-services.json      # Firebase/Google config (gitignored)
```

## Getting Started

### 1. Install dependencies

```bash
cd mobile
npm install
```

### 2. Configure environment variables

Create a `.env` file in the `mobile/` directory:

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id
```

> For EAS builds, set this in your [Expo project dashboard](https://expo.dev) under **Environment Variables** as a **Sensitive** variable for all environments (Development, Preview, Production).

### 3. Run locally (Expo Go / dev build)

```bash
npx expo start
```

> Note: Google Sign-In requires a native build and will not work in Expo Go.

### 4. Run native Android build locally

```bash
npx expo run:android
```

### 5. Build APK via EAS

```bash
# Preview (internal distribution APK)
eas build --platform android --profile preview

# Production
eas build --platform android --profile production
```

## Features

- Email/password authentication with JWT
- Google Sign-In (OAuth 2.0)
- Two-factor authentication (TOTP)
- Forgot password with OTP via email
- Adaptive diagnostic assessment
- AI-powered math tutor (chat interface)
- Practice problems by topic
- Progress tracking and mastery rings
- Dark / light theme
- Session management (view and revoke active sessions)

## Authentication Flow

```
Login Screen
├── Email + Password → JWT token stored in AsyncStorage
├── Google Sign-In → Google ID token → backend /api/auth/google → JWT
│   └── New Google user → redirected to Register screen
└── 2FA → TOTP code modal → /api/auth/2fa/validate → JWT
```

## API Configuration

The app points to the production backend by default. To switch to a local backend, edit `src/constants/api.ts`:

```ts
const USE_LOCAL = true; // set to true for local development
const LOCAL_URL = 'http://<your-local-ip>:5000/api';
```

## Google Sign-In Setup

1. Create an Android OAuth 2.0 client in [Google Cloud Console](https://console.cloud.google.com)
2. Register your app's SHA-1 certificate fingerprint
3. Download `google-services.json` and place it in `mobile/`
4. Set `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` in your `.env` and EAS dashboard

## Build Profiles

| Profile | Distribution | Use case |
|---|---|---|
| `development` | Internal | Dev client builds |
| `preview` | Internal | APK for testing |
| `production` | Store | Play Store release |

## License

MIT License — see LICENSE file for details.
