import express from "express";
import rateLimit from "express-rate-limit";
import {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
    logout,
    setup2FA,
    verify2FA,
    validate2FA,
    disable2FA,
    exportUserData,
    deleteAccount,
    getSessions,
    revokeSession,
    revokeOtherSessions,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    googleAuth,
    googleRegister
} from "../controllers/authController.js";
import {
    authenticate,
    validateRegister,
    validateLogin
} from "../middleware/index.js";

// Rate limiter: max 5 forgot-password requests per IP per 15 minutes
const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: "Too many password reset requests from this device. Please try again in 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
});

const router = express.Router();

// Public routes
router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/google", googleAuth);
router.post("/google/register", googleRegister);
router.post("/2fa/validate", validate2FA);

// Password reset (public — no auth needed, rate limited)
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/verify-reset-otp", forgotPasswordLimiter, verifyResetOtp);
router.post("/reset-password", resetPassword);

// Protected routes
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);
router.put("/change-password", authenticate, changePassword);
router.post("/logout", authenticate, logout);
router.get("/data-export", authenticate, exportUserData);
router.delete("/account", authenticate, deleteAccount);

// Session management routes
router.get("/sessions", authenticate, getSessions);
router.delete("/sessions/others/all", authenticate, revokeOtherSessions);
router.delete("/sessions/:sessionId", authenticate, revokeSession);

// 2FA routes
router.post("/2fa/setup", authenticate, setup2FA);
router.post("/2fa/verify", authenticate, verify2FA);
router.post("/2fa/disable", authenticate, disable2FA);

export default router;
