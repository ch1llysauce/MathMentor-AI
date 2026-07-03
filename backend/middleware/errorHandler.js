/**
 * Global Error Handler Middleware
 * Catches all errors and returns consistent error responses
 * Based on MathMentor AI error handling requirements
 */

/**
 * Custom Error Class for Application Errors
 */
export class AppError extends Error {
    constructor(message, statusCode = 500, errors = null) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.isOperational = true;
        
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors automatically
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * MongoDB Error Handler
 */
const handleMongoError = (error) => {
    // Duplicate key error (E11000)
    if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return new AppError(
            `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
            400
        );
    }

    // Validation error
    if (error.name === "ValidationError") {
        const errors = Object.values(error.errors).map(err => ({
            field: err.path,
            message: err.message
        }));
        return new AppError("Validation failed", 400, errors);
    }

    // Cast error (invalid ObjectId)
    if (error.name === "CastError") {
        return new AppError(`Invalid ${error.path}: ${error.value}`, 400);
    }

    return error;
};

/**
 * AI Service Error Handler
 */
const handleAIError = (error) => {
    // Groq API errors
    if (error.message.includes("Groq API")) {
        return new AppError(
            "AI service temporarily unavailable. Trying fallback...",
            503
        );
    }

    // Gemini API errors
    if (error.message.includes("Gemini API")) {
        return new AppError(
            "Secondary AI service failed. Using rule-based fallback.",
            503
        );
    }

    // Rate limit errors
    if (error.message.includes("rate limit")) {
        return new AppError(
            "Too many requests. Please try again later.",
            429
        );
    }

    return error;
};

/**
 * Global Error Handler
 */
export const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    error.stack = err.stack;

    // Log error for debugging
    console.error("Error:", {
        message: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method
    });

    // Handle specific error types
    if (err.name === "ValidationError" || err.code === 11000 || err.name === "CastError") {
        error = handleMongoError(err);
    }

    if (err.message && (err.message.includes("Groq") || err.message.includes("Gemini"))) {
        error = handleAIError(err);
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        error = new AppError("Invalid authentication token", 401);
    }

    if (err.name === "TokenExpiredError") {
        error = new AppError("Authentication token has expired", 401);
    }

    // Default to 500 server error
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";

    // Send error response
    res.status(statusCode).json({
        success: false,
        message: message,
        errors: error.errors || null,
        ...(process.env.NODE_ENV === "development" && {
            stack: error.stack
        })
    });
};

/**
 * 404 Not Found Handler
 */
export const notFound = (req, res, next) => {
    const error = new AppError(
        `Route not found: ${req.originalUrl}`,
        404
    );
    next(error);
};

/**
 * AI Service Availability Check Middleware
 * Warns if AI services might be down (non-blocking)
 */
export const checkAIAvailability = (req, res, next) => {
    // This is a placeholder - actual implementation would check service health
    // For now, we'll just log and continue
    next();
};
