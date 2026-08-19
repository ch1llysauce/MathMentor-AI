# MathMentor AI — Web Application

The **MathMentor AI Web Application** is a responsive, feature-rich web platform for senior high school mathematics (Algebra, Geometry, Trigonometry). Built with **React 19**, **Vite**, and **Tailwind CSS**, it communicates with the centralized MathMentor AI backend API and database to deliver an adaptive learning experience.

---

## ✨ Key Features & Modules

### 1. 🏠 Landing Page
- **Curriculum Overview**: Highlights the 116 lessons and 28 modules across Algebra, Geometry, and Trigonometry.
- **Interactive Feature Breakdown**: Showcases diagnostic placement, adaptive practice, Tutor AI, and progress tracking.
- **Direct APK Download**: Built-in Android APK download buttons (`/MathMentorAI.apk`) for immediate mobile access.

### 2. 📊 Dashboard
- **Progress Summary**: Displays overall curriculum completion, diagnostic fraction score, active learning streaks, and subject mastery.
- **Weak Area Highlights**: Highlights topics needing review with direct jump-to-practice shortcuts.
- **Learning Path**: Recommends the next optimal lesson based on adaptive diagnostic scores.

### 3. ✍️ Practice & Lessons
- **Adaptive Practice Engine**: Topic-based problem sets supporting multiple-choice, true/false, and free-response questions with real-time feedback.
- **KaTeX LaTeX Math Rendering**: Clear formatting for algebraic expressions, geometric formulas, and trigonometric identities.
- **AI Hints & Explanations**: Instant step-by-step assistance when tackling difficult problems.

### 4. 🎯 Diagnostic Assessment
- **Placement Benchmark**: 9-question diagnostic evaluation spanning Algebra, Geometry, and Trigonometry (3 per subject).
- **Automatic Scoring & Mastery Breakdown**: Ranks subject mastery (Novice, Intermediate, Master) and identifies weak areas.
- **Diagnostic Retake System**: Retake assessments anytime to update learning path recommendations.

### 5. 🤖 Tutor AI Assistant
- **Socratic Math Tutor**: Interactive AI chat powered by Groq (`openai/gpt-oss-120b`).
- **Personalized Responses**: Aligns explanations with the student's selected language and font preferences.
- **Persistent Conversation Memory**: Saves lesson chat threads per user in MongoDB.

### 6. 🧮 Global Scientific Calculator
- **Floating Launcher**: Accessible from any page via a persistent floating button.
- **Full Functions**: Trigonometric functions (sin, cos, tan), logarithms, powers, roots, and parenthetical expressions.

### 7. 👤 Profile & Customization
- **Theme Customization Engine**: Dark/Light mode toggle with **9 Accent Color Schemes** (Indigo, Emerald, Sunset, Ocean, Obsidian, Amethyst, Rose, Aurora, Unicorn).
- **Live Banner Previews**: Dynamic linear-gradient headers customizable in real time.
- **Active Session Security**: View active login sessions complete with IP address, device metadata, and city/location tracking, with single-click remote session revocation.
- **Mobile Application Downloads**: Built-in Android `.apk` download card inside Settings and Sidebar.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React 19** | Component-driven frontend user interface |
| **Vite** | Lightning-fast build tool and local dev server |
| **React Router v7** | Client-side routing with route guards |
| **Tailwind CSS** | Responsive styling and custom theme token engine |
| **KaTeX** | Fast LaTeX mathematical formula rendering |
| **React Icons (Ionicons 5)** | Sleek, modern icon set |
| **Axios** | HTTP client for communicating with Express backend |

---

## 📁 Project Structure

```
web/
├── public/
│   ├── MathMentorAI.apk      # Downloadable Android APK build asset
│   ├── favicon.png
│   └── logo.png
├── src/
│   ├── components/           # AppLayout, ScientificCalculator, Modals, Navbar
│   ├── context/              # AuthContext, ThemeContext, ActiveSessionContext
│   ├── pages/
│   │   ├── Dashboard.jsx     # Main student dashboard
│   │   ├── Diagnosis.jsx     # Diagnostic assessment & retakes
│   │   ├── Landing.jsx       # Public landing page
│   │   ├── Login.jsx         # Sign in with email & Google OAuth
│   │   ├── Profile.jsx       # Student profile & stats
│   │   ├── Register.jsx      # Account creation
│   │   ├── TutorAI.jsx       # Standalone AI tutor chat
│   │   ├── practice/         # Practice index, Lesson viewer, Problem sets
│   │   └── profile/          # Settings, Privacy, Session security
│   ├── services/             # API services (auth, practice, tutor, diagnosis)
│   ├── utils/                # Utility helpers (apkUtils hand-off for In-App Browsers)
│   ├── App.jsx               # Router & global provider wrapper
│   ├── index.css             # Tailwind & custom CSS utility styles
│   └── main.jsx              # Application entry point
├── package.json
└── vite.config.js
```

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd web
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in `web/`:

```env
VITE_API_URL=http://localhost:5000/api
```

*(For production, set `VITE_API_URL` to `https://mathmentor-ai-i8sl.onrender.com/api`)*

### 3. Run Development Server

```bash
npm run dev
```

App will run locally at `http://localhost:5173`.

### 4. Build for Production

```bash
npm run build
```

Production assets will be output to the `dist/` directory.

---

## 📄 License

MIT License — see root [LICENSE](../LICENSE) file.
