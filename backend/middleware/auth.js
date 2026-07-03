import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

/**
 * JWT Authentication Middleware
 * Verifies JWT tokens from Authorization header
 * Attaches user object to req.user for authenticated routes
 */
export const authenticate = async (req, res, next) => {
    try {
        // Get token from Authorization header (Bearer token)
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided."
            });
        }

        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database (exclude password)
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found."
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Account has been deactivated."
            });
        }

        // Attach user to request object
        req.user = user;
        next();

    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token."
            });
        }

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token has expired."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Authentication failed.",
            error: error.message
        });
    }
};

/**
 * Optional Authentication Middleware
 * Attempts to authenticate but doesn't fail if no token
 * Useful for routes that work differently for authenticated users
 */
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId).select("-password");
            
            if (user && user.isActive) {
                req.user = user;
            }
        }

        next();
    } catch (error) {
        // Continue without user if token verification fails
        next();
    }
};
