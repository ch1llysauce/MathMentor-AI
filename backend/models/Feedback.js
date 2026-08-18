import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },
        userEmail: {
            type: String,
            trim: true,
            default: "",
        },
        displayName: {
            type: String,
            trim: true,
            default: "Student",
        },
        feedbackText: {
            type: String,
            required: [true, "Feedback text is required"],
            trim: true,
        },
        sourcePlatform: {
            type: String,
            enum: ["web", "mobile"],
            default: "web",
        },
        emailSent: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

export const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;
