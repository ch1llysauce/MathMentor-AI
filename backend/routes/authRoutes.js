import express from "express";
import {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
    logout
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

// Protected routes
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);
router.put("/change-password", authenticate, changePassword);
router.post("/logout", authenticate, logout);

export default router;
