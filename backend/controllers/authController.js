import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { User, Progress, DiagnosticResult, LoginSession } from "../models/index.js";
import { AppError, asyncHandler } from "../middleware/index.js";

/**
 * Generate JWT Token with unique jti
 */
const generateToken = (userId, tokenId) => {
    return jwt.sign(
        { userId, jti: tokenId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );
};

/**
 * Parse device info from User-Agent header
 */
const parseDeviceInfo = (userAgent = "") => {
    if (!userAgent) return "Unknown device";
    if (/android/i.test(userAgent)) return "Android";
    if (/iphone|ipad|ipod/i.test(userAgent)) return "iOS";
    if (/windows/i.test(userAgent)) return "Windows";
    if (/macintosh|mac os/i.test(userAgent)) return "Mac";
    return "Unknown device";
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

    // If 2FA is enabled, don't issue token yet — require TOTP verification
    if (user.twoFactorEnabled) {
        return res.status(200).json({
            success: true,
            requiresTwoFactor: true,
            message: "2FA verification required",
            data: { userId: user._id }
        });
    }

    // Update last active date
    user.lastActiveDate = new Date();
    await user.save();

    // Generate token with unique ID
    const tokenId = uuidv4();
    const token = generateToken(user._id, tokenId);

    // Record the login session
    await LoginSession.create({
        user: user._id,
        tokenId,
        deviceInfo: parseDeviceInfo(req.headers["user-agent"]),
        ipAddress: req.ip || req.connection?.remoteAddress || "",
        lastActiveAt: new Date(),
    });

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
                totalStudyTime: user.totalStudyTime,
                twoFactorEnabled: user.twoFactorEnabled
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

/**
 * @desc    Generate 2FA secret and QR code for setup
 * @route   POST /api/auth/2fa/setup
 * @access  Private
 */
export const setup2FA = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user.twoFactorEnabled) {
        throw new AppError("Two-factor authentication is already enabled", 400);
    }

    // Generate a new TOTP secret
    const secret = speakeasy.generateSecret({
        name: `MathMentor AI (${user.email})`,
        issuer: "MathMentor AI",
        length: 10
    });

    // Temporarily store the secret (not enabled yet — user must verify first)
    user.twoFactorSecret = secret.base32;
    await user.save();

    // Generate QR code as data URL
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.status(200).json({
        success: true,
        message: "Scan the QR code with your authenticator app, then verify with a code",
        data: {
            secret: secret.base32,
            qrCode: qrCodeUrl
        }
    });
});

/**
 * @desc    Verify TOTP code and enable 2FA
 * @route   POST /api/auth/2fa/verify
 * @access  Private
 */
export const verify2FA = asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (!token) {
        throw new AppError("Verification code is required", 400);
    }

    const user = await User.findById(req.user._id);

    if (!user.twoFactorSecret) {
        throw new AppError("Please set up 2FA first", 400);
    }

    if (user.twoFactorEnabled) {
        throw new AppError("Two-factor authentication is already enabled", 400);
    }

    // Verify the provided TOTP code against the stored secret
    const isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: token.toString(),
        window: 1 // allow 30s clock drift
    });

    if (!isValid) {
        throw new AppError("Invalid verification code. Please try again.", 400);
    }

    // Enable 2FA
    user.twoFactorEnabled = true;
    await user.save();

    res.status(200).json({
        success: true,
        message: "Two-factor authentication has been enabled successfully"
    });
});

/**
 * @desc    Validate TOTP code during login (exchange for JWT)
 * @route   POST /api/auth/2fa/validate
 * @access  Public
 */
export const validate2FA = asyncHandler(async (req, res) => {
    const { userId, token } = req.body;

    if (!userId || !token) {
        throw new AppError("User ID and verification code are required", 400);
    }

    const user = await User.findById(userId);

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
        throw new AppError("Invalid request", 400);
    }

    if (!user.isActive) {
        throw new AppError("Account has been deactivated", 403);
    }

    // Verify the TOTP code
    const isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: token.toString(),
        window: 1
    });

    if (!isValid) {
        throw new AppError("Invalid verification code. Please try again.", 400);
    }

    // Update last active date
    user.lastActiveDate = new Date();
    await user.save();

    // Issue the JWT token with unique ID
    const tokenId = uuidv4();
    const jwtToken = generateToken(user._id, tokenId);

    // Record the login session
    await LoginSession.create({
        user: user._id,
        tokenId,
        deviceInfo: parseDeviceInfo(req.headers["user-agent"]),
        ipAddress: req.ip || req.connection?.remoteAddress || "",
        lastActiveAt: new Date(),
    });

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
                totalStudyTime: user.totalStudyTime,
                twoFactorEnabled: user.twoFactorEnabled
            },
            token: jwtToken
        }
    });
});

/**
 * @desc    Disable 2FA
 * @route   POST /api/auth/2fa/disable
 * @access  Private
 */
export const disable2FA = asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (!token) {
        throw new AppError("Verification code is required to disable 2FA", 400);
    }

    const user = await User.findById(req.user._id);

    if (!user.twoFactorEnabled) {
        throw new AppError("Two-factor authentication is not enabled", 400);
    }

    // Require a valid TOTP code to disable (security check)
    const isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: token.toString(),
        window: 1
    });

    if (!isValid) {
        throw new AppError("Invalid verification code", 400);
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    await user.save();

    res.status(200).json({
        success: true,
        message: "Two-factor authentication has been disabled"
    });
});

/**
 * @desc    Export all user data (profile, progress, diagnostics)
 * @route   GET /api/auth/data-export
 * @access  Private
 */
export const exportUserData = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password -twoFactorSecret");
    const progress = await Progress.find({ user: req.user._id });
    const diagnostics = await DiagnosticResult.find({ user: req.user._id })
        .sort({ completedAt: -1 });

    const exportData = {
        exportedAt: new Date().toISOString(),
        profile: {
            displayName: user.displayName,
            email: user.email,
            gradeLevel: user.gradeLevel,
            focusAreas: user.focusAreas,
            learningPreferences: user.learningPreferences,
            currentStreak: user.currentStreak,
            longestStreak: user.longestStreak,
            totalStudyTime: user.totalStudyTime,
            diagnosticCompleted: user.diagnosticCompleted,
            memberSince: user.createdAt,
            lastActive: user.lastActiveDate,
        },
        progress: progress.map(p => ({
            topic: p.topic,
            subtopic: p.subtopic,
            masteryLevel: p.masteryLevel,
            questionsAnswered: p.questionsAnswered,
            correctAnswers: p.correctAnswers,
            accuracy: p.accuracy,
            lessonsCompleted: p.lessonsCompleted,
            lastStudied: p.lastStudied,
        })),
        diagnosticResults: diagnostics.map(d => ({
            completedAt: d.completedAt,
            overallScore: d.overallScore,
            totalQuestions: d.totalQuestions,
            correctAnswers: d.correctAnswers,
            algebraScore: d.topicScores?.algebra?.score ?? d.algebraScore,
            geometryScore: d.topicScores?.geometry?.score ?? d.geometryScore,
            trigonometryScore: d.topicScores?.trigonometry?.score ?? d.trigonometryScore,
            weakTopics: d.weakTopics,
            strongTopics: d.strongTopics,
        })),
    };

    res.status(200).json({
        success: true,
        data: exportData,
    });
});

/**
 * @desc    Delete account and all associated data
 * @route   DELETE /api/auth/account
 * @access  Private
 */
export const deleteAccount = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Delete all user data across collections
    await Promise.all([
        Progress.deleteMany({ user: userId }),
        DiagnosticResult.deleteMany({ user: userId }),
    ]);

    // Delete the user account itself
    await User.findByIdAndDelete(userId);

    res.status(200).json({
        success: true,
        message: "Account and all associated data have been permanently deleted"
    });
});

/**
 * @desc    Get all active login sessions for the current user
 * @route   GET /api/auth/sessions
 * @access  Private
 */
export const getSessions = asyncHandler(async (req, res) => {
    const currentTokenId = req.user.currentTokenId; // set by auth middleware

    const sessions = await LoginSession.find({
        user: req.user._id,
        isActive: true
    }).sort({ lastActiveAt: -1 });

    res.status(200).json({
        success: true,
        data: {
            sessions: sessions.map(s => ({
                id: s._id,
                deviceInfo: s.deviceInfo,
                ipAddress: s.ipAddress,
                lastActiveAt: s.lastActiveAt,
                createdAt: s.createdAt,
                isCurrent: s.tokenId === currentTokenId
            }))
        }
    });
});

/**
 * @desc    Revoke a specific login session
 * @route   DELETE /api/auth/sessions/:sessionId
 * @access  Private
 */
export const revokeSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;

    const session = await LoginSession.findOne({
        _id: sessionId,
        user: req.user._id,
        isActive: true
    });

    if (!session) {
        throw new AppError("Session not found", 404);
    }

    session.isActive = false;
    session.revokedAt = new Date();
    await session.save();

    res.status(200).json({
        success: true,
        message: "Session revoked successfully"
    });
});

/**
 * @desc    Revoke all sessions except the current one
 * @route   DELETE /api/auth/sessions/others/all
 * @access  Private
 */
export const revokeOtherSessions = asyncHandler(async (req, res) => {
    const currentTokenId = req.user.currentTokenId;

    const result = await LoginSession.updateMany(
        {
            user: req.user._id,
            isActive: true,
            tokenId: { $ne: currentTokenId }
        },
        {
            isActive: false,
            revokedAt: new Date()
        }
    );

    res.status(200).json({
        success: true,
        message: `Signed out from ${result.modifiedCount} other device(s)`
    });
});

export default {
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
    revokeOtherSessions
};
