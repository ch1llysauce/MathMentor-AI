# MathMentor AI Backend

Complete backend API for the MathMentor AI adaptive mathematics learning system.

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js                    # MongoDB connection
├── controllers/
│   ├── authController.js        # Authentication logic
│   ├── aiController.js          # AI tutor logic
│   ├── questionController.js    # Question management
│   ├── progressController.js    # Progress tracking
│   ├── learningController.js    # Learning sessions & diagnostics
│   └── index.js                 # Controller exports
├── middleware/
│   ├── auth.js                  # JWT authentication
│   ├── validator.js             # Request validation
│   ├── errorHandler.js          # Error handling
│   └── index.js                 # Middleware exports
├── models/
│   ├── User.js                  # User schema
│   ├── Progress.js              # Progress tracking schema
│   ├── Question.js              # Question bank schema
│   ├── DiagnosticResult.js      # Diagnostic results schema
│   ├── Session.js               # Learning session schema
│   └── index.js                 # Model exports
├── routes/
│   ├── authRoutes.js            # /api/auth
│   ├── aiRoutes.js              # /api/ai
│   ├── questionRoutes.js        # /api/questions
│   ├── progressRoutes.js        # /api/progress
│   ├── learningRoutes.js        # /api/learning
│   └── index.js                 # Route exports
├── services/
│   ├── aiRouter.js              # Groq → Gemini → Rule-based AI
│   ├── mathService.js           # Math validation engine
│   ├── learningPath.js          # Adaptive learning algorithm
│   └── index.js                 # Service exports
├── .env                         # Environment variables
├── server.js                    # Express app entry point
├── package.json                 # Dependencies
└── API_DOCUMENTATION.md         # Complete API reference
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Edit `.env` file:
```env
# Database
MONGO_URI=your_mongodb_connection_string

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

# AI Services
GROQ_API_KEY=your_groq_api_key          # Get from https://console.groq.com/keys
GEMINI_API_KEY=your_gemini_api_key      # Get from https://aistudio.google.com/app/apikey
```

### 3. Start Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server will run on: `http://localhost:5000`

## 🔑 API Keys Setup

### Groq API (Primary AI)
1. Visit https://console.groq.com/keys
2. Sign up / Log in
3. Create new API key
4. Add to `.env` as `GROQ_API_KEY`

### Gemini API (Fallback AI)
1. Visit https://aistudio.google.com/app/apikey
2. Sign in with Google account
3. Create API key
4. Add to `.env` as `GEMINI_API_KEY`

**Note:** Both are free tier available. System will use rule-based fallback if both are unavailable.

## 📚 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /profile` - Get user profile (protected)
- `PUT /profile` - Update profile (protected)
- `PUT /change-password` - Change password (protected)

### AI Tutor (`/api/ai`)
- `POST /ask` - Ask AI tutor (Socratic method)
- `POST /explain` - Get answer explanation
- `POST /hint` - Get problem hint
- `POST /generate-problem` - Generate practice problem
- `GET /history/:sessionId` - Get conversation history
- `GET /status` - Check AI service status

### Questions (`/api/questions`)
- `GET /` - Get questions (with filters)
- `GET /random` - Get random practice questions
- `GET /diagnostic` - Get diagnostic questions
- `GET /:id` - Get question by ID
- `POST /submit` - Submit answer
- `POST /` - Create question (admin)
- `PUT /:id` - Update question (admin)
- `DELETE /:id` - Delete question (admin)

### Progress (`/api/progress`)
- `GET /` - Get all user progress
- `GET /stats/summary` - Get progress summary
- `GET /weak-areas` - Get weak areas
- `GET /:topic` - Get topic-specific progress
- `GET /learning-path` - Get personalized learning path
- `GET /next-recommendation` - Get next topic to study
- `GET /difficulty-suggestion/:topic` - Get difficulty adjustment
- `POST /update-streak` - Update daily streak

### Learning (`/api/learning`)
- `POST /session/start` - Start learning session
- `PUT /session/:sessionId/end` - End session
- `GET /session/:sessionId` - Get session details
- `GET /sessions` - Get session history
- `POST /diagnostic/submit` - Submit diagnostic results
- `GET /diagnostic/history` - Get diagnostic history
- `GET /diagnostic/latest` - Get latest diagnostic
- `GET /review` - Get review questions (mistakes)

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed endpoint documentation with examples.

## 🧰 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** express-validator
- **Math Engine:** math.js
- **AI Services:**
  - Groq API (LLaMA 3.3 70B) - Primary
  - Google Gemini 1.5 Flash - Fallback
  - Rule-based system - Backup
- **Security:** bcryptjs (password hashing)
- **HTTP Client:** axios

## 📦 Dependencies

```json
{
  "dependencies": {
    "axios": "^1.18.1",
    "bcryptjs": "^3.0.3",
    "cors": "^2.8.6",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "express-validator": "^7.2.1",
    "jsonwebtoken": "^9.0.3",
    "mathjs": "^13.2.4",
    "mongoose": "^9.7.3",
    "validator": "^13.15.35"
  },
  "devDependencies": {
    "nodemon": "^3.1.14"
  }
}
```

## 🔐 Security Features

- **JWT Authentication:** Secure token-based auth
- **Password Hashing:** bcryptjs with salt rounds
- **Input Validation:** express-validator on all endpoints
- **CORS Protection:** Configurable cross-origin policies
- **Error Handling:** Global error handler with safe error messages
- **MongoDB Injection Prevention:** Mongoose schema validation

## 🧠 AI System Architecture

```
User Question
     ↓
AI Router Service
     ↓
┌────────────────────────┐
│  1. Try Groq API       │ ← Primary (Fast, Free Tier)
│     ↓ (if fails)       │
│  2. Try Gemini API     │ ← Fallback (Reliable)
│     ↓ (if fails)       │
│  3. Rule-based Tutor   │ ← Backup (Always Available)
└────────────────────────┘
     ↓
Response to User
```

## 📊 Database Schema

### User
- Authentication & profile data
- Learning preferences
- Streak tracking
- Study time tracking

### Progress
- Topic/subtopic mastery levels
- Accuracy tracking
- Weak areas identification
- Study history

### Question
- Question bank (Algebra, Geometry, Trigonometry)
- Multiple choice & open-ended support
- Difficulty levels (Easy, Medium, Hard)
- Usage statistics

### Session
- Learning session tracking
- AI conversation history
- Time spent tracking
- Performance metrics

### DiagnosticResult
- Initial assessment results
- Subtopic-level scoring
- Recommended learning paths
- Progress over time

## 🧪 Testing

### Test Server Health
```bash
curl http://localhost:5000/health
```

### Test Authentication
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "Test User",
    "email": "test@example.com",
    "password": "Test123!",
    "gradeLevel": 10
  }'
```

### Test AI Tutor
```bash
curl -X POST http://localhost:5000/api/ai/ask \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "question": "How do I solve 2x + 5 = 15?",
    "context": {"topic": "Algebra"}
  }'
```

## 🐛 Troubleshooting

### MongoDB Connection Failed
- Check `MONGO_URI` in `.env`
- Verify MongoDB Atlas whitelist includes your IP
- Ensure database user has correct permissions

### JWT Authentication Error
- Verify `JWT_SECRET` is set in `.env`
- Check token format: `Authorization: Bearer <token>`
- Ensure token hasn't expired

### AI Service Unavailable
- Check API keys are correctly set
- Verify API key validity on provider dashboards
- System will automatically fallback to next available service

### Port Already in Use
```bash
# Change PORT in .env or kill existing process
lsof -ti:5000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :5000   # Windows
```

## 📈 Performance Optimization

- **Database Indexes:** Added on frequently queried fields
- **Connection Pooling:** Mongoose built-in pooling
- **Response Caching:** Can be added with Redis (optional)
- **Rate Limiting:** Can be added with express-rate-limit (optional)

## 🔄 Development Workflow

1. **Models First:** Database schema design ✅
2. **Middleware:** Auth, validation, error handling ✅
3. **Services:** Business logic (AI, math, learning path) ✅
4. **Controllers:** Request handling logic ✅
5. **Routes:** API endpoint mapping ✅
6. **Testing:** Unit & integration tests (optional)
7. **Deployment:** Render, Heroku, or AWS

## 🚀 Deployment Checklist

- [ ] Set `NODE_ENV=production` in production
- [ ] Use strong `JWT_SECRET` (32+ characters)
- [ ] Enable MongoDB authentication
- [ ] Configure CORS for your frontend domain
- [ ] Set up error logging (e.g., Sentry)
- [ ] Enable HTTPS
- [ ] Add rate limiting
- [ ] Set up monitoring (e.g., PM2)
- [ ] Configure backup strategy

## 📝 License

MIT License - See LICENSE file for details

## 👥 Authors

MathMentor AI Development Team

## 🙏 Acknowledgments

- Groq for fast LLM inference
- Google for Gemini API
- MongoDB Atlas for database hosting
- Express.js community

---

**Status:** ✅ Production Ready

**Version:** 1.0.0

**Last Updated:** 2024
