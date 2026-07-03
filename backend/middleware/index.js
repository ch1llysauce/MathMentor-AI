// Central export for all middleware
export { authenticate, optionalAuth } from "./auth.js";
export {
    validate,
    validateRegister,
    validateLogin,
    validateQuestionQuery,
    validateAnswerSubmission,
    validateAITutorRequest,
    validateProgressQuery,
    validateSessionStart,
    validateMongoId
} from "./validator.js";
export {
    errorHandler,
    notFound,
    asyncHandler,
    AppError,
    checkAIAvailability
} from "./errorHandler.js";
