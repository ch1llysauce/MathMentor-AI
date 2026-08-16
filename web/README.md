# MathMentor AI — Web Application

MathMentor AI is a cloud-based adaptive mathematics learning system designed to help students learn and practice Algebra, Geometry, and Trigonometry through AI-powered tutoring, personalized assessment, and progress tracking.

The web application serves as the browser-based counterpart to the MathMentor AI mobile application. It provides the same core learning functionalities through a responsive web interface while communicating with the existing centralized backend and database.

---

## Scope

The MathMentor AI Web Application covers the following major areas:

### 1. Landing Page

A public-facing page that introduces MathMentor AI and provides information about the system.

Features include:

- System introduction
- Overview of major features
- Supported mathematics subjects:
  - Algebra
  - Geometry
  - Trigonometry
- Explanation of how MathMentor AI works
- Access to the web application
- Download link for the Android APK
- Call-to-action for students to get started

### 2. Dashboard

The Dashboard provides students with an overview of their learning progress and performance.

It may display:

- Overall learning progress
- Practice performance
- Topic mastery
- Weak areas
- Learning streaks
- Recent activity
- Personalized recommendations
- Learning-path information

### 3. Practice

The Practice module allows students to practice mathematics according to their selected subject and topic.

Supported subjects:

- Algebra
- Geometry
- Trigonometry

The module may provide:

- Topic-based questions
- Different difficulty levels
- Multiple-choice questions
- Answer submission
- Immediate feedback
- Explanations
- AI-generated hints
- Practice results
- Progress recording

AI-generated questions are constrained according to the selected mathematics subject, topic, and difficulty to maintain alignment with the system's curriculum.

### 4. Diagnosis

The Diagnosis module evaluates the student's current mathematical knowledge and identifies areas of strength and weakness.

It includes:

- Diagnostic assessments
- Topic-based evaluation
- Automatic scoring
- Performance analysis
- Identification of weak areas
- Learning recommendations
- Diagnostic history

The results can be used by the system to provide more personalized learning recommendations and support through Tutor AI.

### 5. Tutor AI

Tutor AI provides an interactive AI-powered mathematics tutoring experience.

Students can:

- Ask mathematics-related questions
- Request explanations
- Request hints
- Ask for clarification
- Receive step-by-step guidance
- Receive context-aware assistance

Tutor AI focuses on Algebra, Geometry, and Trigonometry and can utilize relevant learning context to provide more personalized assistance.

### 6. Profile

The Profile module manages the student's account and personal application settings.

It includes functionality such as:

- Account information
- Profile management
- Account settings
- Authentication-related settings
- Session/account management

---

## System Architecture

The web application follows a client-server architecture in which the React frontend communicates with the existing centralized backend through RESTful services.

```
┌──────────────────────┐
│      Students        │
└──────────┬───────────┘
           │
┌──────────▼───────────┐
│    React Web App     │
│                      │
│  Landing Page        │
│  Dashboard           │
│  Practice            │
│  Diagnosis           │
│  Tutor AI            │
│  Profile             │
└──────────┬───────────┘
           │
      HTTPS / REST
           │
┌──────────▼───────────┐
│   Node.js / Express  │
│      Backend         │
└──────┬───────┬───────┘
       │       │
       ▼       ▼
┌──────────┐  ┌──────────────────┐
│ MongoDB  │  │   AI Provider    │
│ Atlas    │  │                  │
│          │  │ AI Tutor         │
│ Users    │  │ Explanations     │
│ Questions│  │ Hints            │
│ Progress │  │ AI Generation    │
│ Learning │  └──────────────────┘
│ Data     │
└──────────┘
```

### Shared Backend Architecture

The web application uses the same centralized backend as the existing mobile application.

```
┌───────────────┐     ┌────────────────┐
│  Mobile APK   │     │   React Web    │
└───────┬───────┘     └───────┬────────┘
        │                     │
        └──────────┬──────────┘
                   │
          ┌────────▼────────┐
          │  Express API    │
          │    Backend      │
          └────────┬────────┘
                   │
          ┌────────▼────────┐
          │  MongoDB Atlas  │
          └────────┬────────┘
                   │
          ┌────────▼────────┐
          │    AI APIs      │
          └─────────────────┘
```

This allows the mobile and web applications to share:

- User accounts
- Authentication
- Questions
- Practice results
- Diagnostic results
- Learning progress
- Recommendations
- AI services

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React** | Component-based user interface |
| **Vite** | Frontend development and build tool |
| **TypeScript** | Type-safe development and improved maintainability |
| **React Router** | Client-side navigation between pages and authenticated modules |
| **Tailwind CSS** | Responsive styling and UI development |

### Backend

The web application uses the existing MathMentor AI backend.

| Technology | Purpose |
|---|---|
| **Node.js** | Runtime environment for the backend server |
| **Express.js** | REST API framework handling requests from web and mobile clients |
| **RESTful Architecture** | Communication between the React web app and the centralized backend |

### Database

| Technology | Purpose |
|---|---|
| **MongoDB Atlas** | Cloud-hosted database storing student accounts, questions, practice results, diagnostic results, progress, learning sessions, and recommendations |

### Artificial Intelligence

| Technology | Purpose |
|---|---|
| **Groq / LLM APIs** | AI-powered tutoring, explanations, hints, AI-assisted question generation, and personalized learning assistance |

The AI model is accessed through the backend rather than directly from the web client. This keeps API credentials and model configuration on the server side.

### Deployment

| Service | Purpose |
|---|---|
| **Render** | Hosts the backend API so both mobile and web can communicate without requiring the developer's machine to remain online |
| **MongoDB Atlas** | Cloud database |

The web frontend can be deployed separately to a suitable static/frontend hosting service.

---

## Responsive Design

The web application is designed to be responsive across:

- Desktop
- Laptop
- Tablet
- Mobile browsers

The web application does not attempt to duplicate the mobile application's interface exactly. Instead, it adapts the same functionality to larger screens while remaining usable on smaller screens.

**Desktop layout:**

```
┌──────────┬────────────────────────────┐
│ Sidebar  │ Main Content               │
│          │                            │
│Dashboard │ Dashboard / Practice / etc.│
│Practice  │                            │
│Diagnosis │                            │
│Tutor AI  │                            │
│Profile   │                            │
└──────────┴────────────────────────────┘
```

**Mobile browser layout:**

Navigation collapses into a mobile menu or bottom navigation bar while content switches to a single-column layout.

---

## Relationship to the Mobile Application

The web application is the browser-based counterpart of the existing MathMentor AI mobile application. Both platforms provide the same core learning modules: Dashboard, Practice, Diagnosis, Tutor AI, and Profile. The main difference is the user interface and interaction model.

```
          MathMentor AI System
                   │
      ┌────────────┴────────────┐
      │                         │
 Mobile Application       Web Application
  (React Native)              (React)
      │                         │
      └────────────┬────────────┘
                   │
           Centralized Backend
                   │
            MongoDB Atlas
                   │
               AI APIs
```

This architecture allows MathMentor AI to provide a consistent learning experience across mobile and web platforms while maintaining a centralized backend and data source.

---

## Development Goal

The goal of the web application is to provide a fully responsive browser-based version of MathMentor AI that maintains the core functionality of the existing mobile application while taking advantage of the larger screen space and interaction capabilities available on desktop and laptop devices.

The web application should prioritize:

- Consistent functionality with the mobile application
- Responsive design
- Accessible navigation
- Clear mathematics-focused UI
- Reusable React components
- Integration with the existing backend
- Secure communication with backend services
- Maintainable and scalable frontend architecture
