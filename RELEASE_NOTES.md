# 🚀 MathMentor AI — Version 1.0.0 (Initial Release)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Android-brightgreen.svg)]()
[![Stack](https://img.shields.io/badge/Stack-React%20%7C%20React%20Native%20%7C%20Express-purple.svg)]()

**MathMentor AI** is an adaptive, AI-powered mathematics learning platform designed for senior high school students covering **Algebra**, **Geometry**, and **Trigonometry**. 

This official initial release delivers the native **Android Application (.apk)** alongside the responsive **Web Platform** and centralized **Express API & MongoDB Database Services**.

---

## ✨ Key Features & Technical Highlights

### 🎯 1. Diagnostic Assessment & Adaptive Learning Paths
- **Placement Benchmark**: 9-question placement evaluation across Algebra, Geometry, and Trigonometry (3 per subject) to establish initial student competency.
- **Diagnostic Attempt History**: Comprehensive attempt review with question snapshots, user vs. correct answer highlights, and step-by-step LaTeX explanations across web and mobile.
- **Adaptive Recommendations**: Automated subject mastery scoring (*Novice*, *Intermediate*, *Master*) that dynamically tailors a personalized learning path.
- **Curriculum Scope**: 116 structured lessons across 28 modules with lesson objectives, step-by-step examples, and key takeaways.

### ✍️ 2. Practice Engine & Math Rendering
- **Interactive Practice Sets**: Topic-focused questions supporting multiple choice, true/false, and open-ended numeric responses with immediate validation.
- **KaTeX LaTeX Math Rendering**: Clean, high-performance rendering of algebraic expressions, geometric formulas, and trigonometric identities across web and mobile interfaces.
- **Instant AI Hints**: On-demand step-by-step hints to guide students through complex problem-solving without revealing direct answers.

### 🤖 3. Socratic Tutor AI Assistant
- **AI Model Provider**: High-performance AI tutoring powered by Groq (`openai/gpt-oss-120b`).
- **Socratic Pedagogy**: Guides students step-by-step through mathematical reasoning instead of just displaying raw solutions.
- **Personalized Learning Context**: Adapts explanations according to user language preferences and display configurations.
- **Persistent Chat History**: Saved conversation threads per lesson stored in MongoDB.

### 🧮 4. Global Scientific Calculator
- Built-in overlay calculator providing trigonometric functions (`sin`, `cos`, `tan`), logarithms (`log`, `ln`), powers, roots, and parenthetical expressions across web and mobile practice sessions.

### 🎨 5. Customization & Theme Engine
- **Dark & Light Themes**: Dynamic theme engine across web and mobile platforms.
- **9 Accent Color Schemes**: Preset themes including Indigo, Emerald, Sunset, Ocean, Obsidian, Amethyst, Rose, Aurora, and Unicorn.
- **Live Banner Previews**: Dynamic linear-gradient profile header previews with instant visual feedback.

### 🔐 6. Multi-Device Session Security
- **Session Tracking**: Monitor active login sessions with IP address, device metadata, and city/location tracking.
- **Remote Revocation & 2FA**: Single-tap remote session termination and TOTP Two-Factor Authentication (`speakeasy`).

---

## 📱 Mobile App Installation (.apk)

1. Download **`MathMentorAI.apk`** from the **Assets** section below onto your Android phone.
2. Tap the downloaded `.apk` file to start installation.
3. *(If prompted)*: Tap **Settings** and enable **"Allow from this source"** under Android Security Settings to grant permission for app installation.
4. Open **MathMentor AI** and sign in or create a free account!

---

## 🛠️ System Requirements

- **Android Version**: Android 7.0 (Nougat) or higher (API level 24+)
- **Web Browsers**: Chrome, Firefox, Safari, Edge (Desktop & Mobile)

---

## 📦 Release Assets

- 📱 **`MathMentorAI.apk`**: Production Android APK build (~116 MB)
- 📦 **Source Code**: Monorepo containing `backend/`, `web/`, and `mobile/`
