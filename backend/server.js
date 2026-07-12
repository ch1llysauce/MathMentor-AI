// MUST BE FIRST: Disable SSL certificate verification for development
// This fixes "unable to verify the first certificate" errors
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import { errorHandler, notFound } from "./middleware/index.js";
import {
    authRoutes,
    aiRoutes,
    questionRoutes,
    progressRoutes,
    learningRoutes,
    diagnosticRoutes,
    tutorRoutes
} from "./routes/index.js";

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Welcome route
app.get("/", (req, res) => {
    res.json({
        message: "MathMentor AI Backend API",
        version: "1.0.0",
        status: "running",
        endpoints: {
            auth: "/api/auth",
            ai: "/api/ai",
            questions: "/api/questions",
            progress: "/api/progress",
            learning: "/api/learning",
            diagnostic: "/api/diagnostic",
            tutor: "/api/tutor"
        }
    });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/learning", learningRoutes);
app.use("/api/diagnostic", diagnosticRoutes);
app.use("/api/tutor", tutorRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`Local: http://localhost:${PORT}/api`);
    console.log(`Network: http://192.168.254.107:${PORT}/api`);
    console.log(`\n📱 For Expo Go: Use http://192.168.254.107:${PORT}/api in mobile/.env`);
});