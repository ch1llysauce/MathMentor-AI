import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import { AppError, asyncHandler } from "../middleware/index.js";

/**
 * Generate JWT Token
 */
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
    const { displayName, email, password, gradeLevel, focusAreas } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError("User with this email already exists", 400);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
        displayName,
        email,
        password: hashedPassword,
        gradeLevel,
        focusAreas: focusAreas || []
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
            user: {
                id: user._id,
                displayName: user.displayName,
                email: user.email,
                gradeLevel: user.gradeLevel,
                focusAreas: user.focusAreas,
                diagnosticCompleted: user.diagnosticCompleted
            },
            token
        }
    });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError("Invalid credentials", 401);
    }

    // Check if user is active
    if (!user.isActive) {
        throw new AppError("Account has been deactivated", 403);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new AppError("Invalid credentials", 401);
    }

    // Update last active date
    user.lastActiveDate = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
            user: {
                id: user._id,
                displayName: user.displayName,
                email: user.email,
                gradeLevel: user.gradeLevel,
                focusAreas: user.focusAreas,
                diagnosticCompleted: user.diagnosticCompleted,
                currentStreak: user.currentStreak,
                totalStudyTime: user.totalStudyTime
            },
            token
        }
    });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password");

    res.status(200).json({
        success: true,
        data: { user }
    });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
    const { displayName, gradeLevel, focusAreas, learningPreferences, profileImage } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    // Update fields
    if (displayName) user.displayName = displayName;
    if (gradeLevel) user.gradeLevel = gradeLevel;
    if (focusAreas) user.focusAreas = focusAreas;
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (learningPreferences) {
        user.learningPreferences = {
            ...user.learningPreferences,
            ...learningPreferences
        };
    }

    await user.save();

    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: {
            user: await User.findById(user._id).select("-password")
        }
    });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new AppError("Please provide current and new password", 400);
    }

    const user = await User.findById(req.user._id);

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
        throw new AppError("Current password is incorrect", 401);
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.status(200).json({
        success: true,
        message: "Password changed successfully"
    });
});

/**
 * @desc    Logout user (client-side token removal)
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
});

export default {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
    logout
};
