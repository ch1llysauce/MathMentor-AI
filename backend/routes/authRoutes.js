import express from "express";
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
    exportUserData
} from "../controllers/authController.js";
import {
    authenticate,
    validateRegister,
    validateLogin
} from "../middleware/index.js";

const router = express.Router();

// Public routes
router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/2fa/validate", validate2FA);

// Protected routes
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);
router.put("/change-password", authenticate, changePassword);
router.post("/logout", authenticate, logout);
router.get("/data-export", authenticate, exportUserData);

// 2FA routes
router.post("/2fa/setup", authenticate, setup2FA);
router.post("/2fa/verify", authenticate, verify2FA);
router.post("/2fa/disable", authenticate, disable2FA);

export default router;
