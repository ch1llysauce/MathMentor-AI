import { validationResult, body, param, query } from "express-validator";

/**
 * Validation Error Formatter
 * Extracts validation errors and returns formatted response
 */
export const validate = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    
    next();
};

/**
 * Authentication Validation Rules
 */
export const validateRegister = [
    body("displayName")
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage("Display name must be between 3 and 30 characters"),
    
    body("email")
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage("Must be a valid email address"),
    
    body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
    
    body("gradeLevel")
        .optional()
        .isInt({ min: 9, max: 12 })
        .withMessage("Grade level must be between 9 and 12"),
    
    body("focusAreas")
        .optional()
        .isArray()
        .withMessage("Focus areas must be an array")
        .custom((areas) => {
            const validAreas = ["Algebra", "Geometry", "Trigonometry"];
            return areas.every(area => validAreas.includes(area));
        })
        .withMessage("Focus areas must be Algebra, Geometry, or Trigonometry"),
    
    validate
];

export const validateLogin = [
    body("email")
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage("Must be a valid email address"),
    
    body("password")
        .notEmpty()
        .withMessage("Password is required"),
    
    validate
];

/**
 * Question Validation Rules
 */
export const validateQuestionQuery = [
    query("topic")
        .optional()
        .isIn(["Algebra", "Geometry", "Trigonometry"])
        .withMessage("Topic must be Algebra, Geometry, or Trigonometry"),
    
    query("difficulty")
        .optional()
        .isIn(["Easy", "Medium", "Hard"])
        .withMessage("Difficulty must be Easy, Medium, or Hard"),
    
    query("subtopic")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Subtopic cannot be empty"),
    
    query("limit")
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage("Limit must be between 1 and 50"),
    
    validate
];

export const validateAnswerSubmission = [
    body("questionId")
        .notEmpty()
        .withMessage("Question ID is required")
        .isMongoId()
        .withMessage("Invalid question ID format"),
    
    body("userAnswer")
        .notEmpty()
        .withMessage("User answer is required")
        .trim(),
    
    body("timeSpent")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Time spent must be a positive number"),
    
    body("sessionId")
        .optional()
        .isMongoId()
        .withMessage("Invalid session ID format"),
    
    validate
];

/**
 * AI Tutor Validation Rules
 */
export const validateAITutorRequest = [
    body("question")
        .notEmpty()
        .withMessage("Question is required")
        .trim()
        .isLength({ min: 5, max: 1000 })
        .withMessage("Question must be between 5 and 1000 characters"),
    
    body("context")
        .optional()
        .isObject()
        .withMessage("Context must be an object"),
    
    body("context.topic")
        .optional()
        .isIn(["Algebra", "Geometry", "Trigonometry"])
        .withMessage("Topic must be Algebra, Geometry, or Trigonometry"),
    
    body("context.subtopic")
        .optional()
        .trim(),
    
    body("sessionId")
        .optional()
        .isMongoId()
        .withMessage("Invalid session ID format"),
    
    validate
];

/**
 * Progress Validation Rules
 */
export const validateProgressQuery = [
    query("topic")
        .optional()
        .isIn(["Algebra", "Geometry", "Trigonometry"])
        .withMessage("Topic must be Algebra, Geometry, or Trigonometry"),
    
    validate
];

/**
 * Session Validation Rules
 */
export const validateSessionStart = [
    body("sessionType")
        .notEmpty()
        .withMessage("Session type is required")
        .isIn(["Diagnostic", "Practice", "Tutor", "Review"])
        .withMessage("Session type must be Diagnostic, Practice, Tutor, or Review"),
    
    body("topic")
        .notEmpty()
        .withMessage("Topic is required")
        .isIn(["Algebra", "Geometry", "Trigonometry"])
        .withMessage("Topic must be Algebra, Geometry, or Trigonometry"),
    
    body("subtopic")
        .optional()
        .trim(),
    
    body("difficulty")
        .optional()
        .isIn(["Easy", "Medium", "Hard"])
        .withMessage("Difficulty must be Easy, Medium, or Hard"),
    
    validate
];

/**
 * MongoDB ID Validation
 */
export const validateMongoId = (paramName = "id") => [
    param(paramName)
        .isMongoId()
        .withMessage(`Invalid ${paramName} format`),
    
    validate
];
