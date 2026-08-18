import jwt from "jsonwebtoken";
import { User, LoginSession } from "../models/index.js";

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

        // Check if session has been revoked (if token includes a session jti)
        if (decoded.jti) {
            const activeSession = await LoginSession.findOne({
                user: user._id,
                tokenId: decoded.jti,
                isActive: true
            });

            if (!activeSession) {
                return res.status(401).json({
                    success: false,
                    message: "Session has been revoked. Please log in again."
                });
            }

            // Periodically update last active timestamp (every 60s)
            const now = new Date();
            if (!activeSession.lastActiveAt || now - new Date(activeSession.lastActiveAt) > 60000) {
                activeSession.lastActiveAt = now;
                await activeSession.save().catch(() => {});
            }
        }

        // Attach user and tokenId to request object
        req.user = user;
        req.user.currentTokenId = decoded.jti || null;
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
