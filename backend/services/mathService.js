import { evaluate, simplify, parse } from "mathjs";

/**
 * Math Service
 * Handles mathematical validation and comparison
 * Based on MathMentor AI Math Engine requirements
 */

/**
 * Normalize mathematical expressions for comparison
 */
const normalizeExpression = (expression) => {
    if (!expression) return "";
    
    return expression
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "") // Remove all whitespace
        .replace(/\*/g, "") // Remove multiplication signs
        .replace(/\^/g, "**") // Convert ^ to **
        .replace(/×/g, "*") // Convert × to *
        .replace(/÷/g, "/"); // Convert ÷ to /
};

/**
 * Check if two numbers are approximately equal (handles floating point)
 */
const approximatelyEqual = (a, b, epsilon = 0.0001) => {
    return Math.abs(a - b) < epsilon;
};

/**
 * Validate and compare mathematical answers
 */
export const validateAnswer = (userAnswer, correctAnswer, options = {}) => {
    try {
        const {
            tolerance = 0.0001,
            caseSensitive = false,
            allowMultipleForms = true
        } = options;

        // Normalize both answers
        const normalizedUser = normalizeExpression(userAnswer);
        const normalizedCorrect = normalizeExpression(correctAnswer);

        // Direct string comparison (fastest)
        if (!caseSensitive) {
            if (normalizedUser === normalizedCorrect) {
                return {
                    isCorrect: true,
                    method: "string_match",
                    userValue: userAnswer,
                    correctValue: correctAnswer
                };
            }
        } else {
            if (userAnswer.trim() === correctAnswer.trim()) {
                return {
                    isCorrect: true,
                    method: "exact_match",
                    userValue: userAnswer,
                    correctValue: correctAnswer
                };
            }
        }

        // Try numerical evaluation
        try {
            const userValue = evaluate(normalizedUser);
            const correctValue = evaluate(normalizedCorrect);

            // Check if both are numbers
            if (typeof userValue === "number" && typeof correctValue === "number") {
                const isCorrect = approximatelyEqual(userValue, correctValue, tolerance);
                return {
                    isCorrect,
                    method: "numerical_evaluation",
                    userValue: userValue,
                    correctValue: correctValue,
                    difference: Math.abs(userValue - correctValue)
                };
            }
        } catch (evalError) {
            // Not a valid numerical expression, continue to other methods
        }

        // Try algebraic simplification (for expressions like "2x + 3x" vs "5x")
        if (allowMultipleForms) {
            try {
                const userSimplified = simplify(normalizedUser).toString();
                const correctSimplified = simplify(normalizedCorrect).toString();

                if (userSimplified === correctSimplified) {
                    return {
                        isCorrect: true,
                        method: "algebraic_simplification",
                        userValue: userSimplified,
                        correctValue: correctSimplified
                    };
                }
            } catch (simplifyError) {
                // Cannot simplify, continue
            }
        }

        // No match found
        return {
            isCorrect: false,
            method: "no_match",
            userValue: userAnswer,
            correctValue: correctAnswer,
            message: "Answer does not match the correct solution"
        };

    } catch (error) {
        console.error("Math validation error:", error);
        return {
            isCorrect: false,
            method: "error",
            error: error.message,
            message: "Could not validate answer due to an error"
        };
    }
};

/**
 * Evaluate a mathematical expression safely
 */
export const evaluateExpression = (expression) => {
    try {
        const normalized = normalizeExpression(expression);
        const result = evaluate(normalized);
        
        return {
            success: true,
            result: result,
            expression: expression
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            expression: expression
        };
    }
};

/**
 * Simplify a mathematical expression
 */
export const simplifyExpression = (expression) => {
    try {
        const normalized = normalizeExpression(expression);
        const simplified = simplify(normalized);
        
        return {
            success: true,
            original: expression,
            simplified: simplified.toString()
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            original: expression
        };
    }
};

/**
 * Check if a fraction is in simplest form
 */
export const isSimplestForm = (numerator, denominator) => {
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    return gcd(Math.abs(numerator), Math.abs(denominator)) === 1;
};

/**
 * Convert decimal to fraction
 */
export const decimalToFraction = (decimal) => {
    try {
        const tolerance = 1.0E-6;
        let numerator = 1;
        let denominator = 1;
        let x = decimal;
        
        while (Math.abs(x - Math.round(x)) > tolerance) {
            x *= 10;
            denominator *= 10;
        }
        
        numerator = Math.round(x);
        
        // Simplify
        const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
        const divisor = gcd(numerator, denominator);
        
        return {
            success: true,
            decimal: decimal,
            numerator: numerator / divisor,
            denominator: denominator / divisor
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Validate angle measurement (0-360 degrees or 0-2π radians)
 */
export const validateAngle = (angle, unit = "degrees") => {
    const numAngle = parseFloat(angle);
    
    if (isNaN(numAngle)) {
        return {
            isValid: false,
            message: "Not a valid number"
        };
    }
    
    if (unit === "degrees") {
        const normalized = ((numAngle % 360) + 360) % 360;
        return {
            isValid: true,
            angle: numAngle,
            normalized: normalized,
            unit: "degrees"
        };
    } else if (unit === "radians") {
        const normalized = ((numAngle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
        return {
            isValid: true,
            angle: numAngle,
            normalized: normalized,
            unit: "radians"
        };
    }
    
    return {
        isValid: false,
        message: "Invalid unit (use 'degrees' or 'radians')"
    };
};

/**
 * Calculate accuracy percentage
 */
export const calculateAccuracy = (correctAnswers, totalQuestions) => {
    if (totalQuestions === 0) return 0;
    return Math.round((correctAnswers / totalQuestions) * 100);
};

/**
 * Determine difficulty level based on accuracy
 */
export const suggestDifficulty = (accuracy) => {
    if (accuracy >= 80) return "Hard";
    if (accuracy >= 50) return "Medium";
    return "Easy";
};

/**
 * Parse multiple choice answer (handles "A", "a", "A.", "Option A", etc.)
 */
export const parseMultipleChoiceAnswer = (answer) => {
    if (!answer) return null;
    
    const normalized = answer.toString().toUpperCase().trim();
    const match = normalized.match(/[ABCD]/);
    
    return match ? match[0] : null;
};

export default {
    validateAnswer,
    evaluateExpression,
    simplifyExpression,
    isSimplestForm,
    decimalToFraction,
    validateAngle,
    calculateAccuracy,
    suggestDifficulty,
    parseMultipleChoiceAnswer
};
