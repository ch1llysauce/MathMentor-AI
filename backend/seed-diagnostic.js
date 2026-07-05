import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import { DiagnosticResult, User } from "./models/index.js";

dotenv.config();

const seedDiagnosticData = async () => {
    try {
        await connectDB();

        console.log("🌱 Starting diagnostic seed...");

        // Find a test user (or use the first user)
        const user = await User.findOne();
        if (!user) {
            console.error("❌ No user found. Please create a user first.");
            process.exit(1);
        }

        console.log(`📝 Creating diagnostic results for user: ${user.email}`);

        // Clear existing diagnostics for this user
        await DiagnosticResult.deleteMany({ user: user._id });

        // Create a series of diagnostic results showing improvement over time
        const diagnostics = [];
        const baseDate = new Date();
        baseDate.setMonth(baseDate.getMonth() - 6); // Start 6 months ago

        // Create 6 diagnostic results showing gradual improvement
        for (let i = 0; i < 6; i++) {
            const date = new Date(baseDate);
            date.setMonth(date.getMonth() + i);
            
            // Gradually improve scores
            const algebraScore = Math.min(50 + (i * 7), 85);
            const geometryScore = Math.min(40 + (i * 5), 62);
            const trigonometryScore = Math.min(25 + (i * 4), 42);
            
            const totalQuestions = 30;
            const correctAnswers = Math.round((algebraScore + geometryScore + trigonometryScore) / 3 * totalQuestions / 100);
            const overallScore = Math.round((algebraScore + geometryScore + trigonometryScore) / 3);

            const diagnostic = {
                user: user._id,
                topicScores: {
                    algebra: {
                        score: algebraScore,
                        questionsAnswered: 10,
                        correctAnswers: Math.round(algebraScore * 10 / 100),
                        subtopicScores: {
                            fractions: Math.min(algebraScore + 5, 90),
                            linearEquations: Math.min(algebraScore + 10, 95),
                            factoring: Math.max(algebraScore - 10, 30)
                        }
                    },
                    geometry: {
                        score: geometryScore,
                        questionsAnswered: 10,
                        correctAnswers: Math.round(geometryScore * 10 / 100),
                        subtopicScores: {
                            angles: Math.min(geometryScore + 8, 80),
                            triangles: geometryScore,
                            area: Math.max(geometryScore - 5, 25),
                            basicCircles: Math.max(geometryScore - 15, 35)
                        }
                    },
                    trigonometry: {
                        score: trigonometryScore,
                        questionsAnswered: 10,
                        correctAnswers: Math.round(trigonometryScore * 10 / 100),
                        subtopicScores: {
                            sohCahToa: Math.min(trigonometryScore + 10, 60),
                            basicTrigRatios: trigonometryScore,
                            simpleApplications: Math.max(trigonometryScore - 10, 20)
                        }
                    }
                },
                algebraScore,
                geometryScore,
                trigonometryScore,
                weakTopics: [
                    { topic: "Trigonometry", subtopic: "Simple Applications", score: Math.max(trigonometryScore - 10, 20) },
                    { topic: "Geometry", subtopic: "Basic Circles", score: Math.max(geometryScore - 15, 35) },
                    { topic: "Algebra", subtopic: "Factoring", score: Math.max(algebraScore - 10, 30) }
                ].filter(w => w.score < 50),
                strongTopics: [
                    { topic: "Algebra", subtopic: "Linear Equations", score: Math.min(algebraScore + 10, 95) },
                    { topic: "Algebra", subtopic: "Fractions", score: Math.min(algebraScore + 5, 90) }
                ].filter(s => s.score >= 80),
                recommendedLearningPath: [
                    {
                        topic: "Trigonometry",
                        subtopic: "Simple Applications",
                        priority: 1,
                        reason: "This is your weakest area and improving it will boost overall performance"
                    },
                    {
                        topic: "Geometry",
                        subtopic: "Basic Circles",
                        priority: 2,
                        reason: "Building on geometry fundamentals will strengthen your understanding"
                    }
                ],
                totalQuestions,
                correctAnswers,
                overallScore,
                timeSpent: 1200 + (i * 100), // 20-30 minutes
                completedAt: date,
                createdAt: date,
                updatedAt: date
            };

            diagnostics.push(diagnostic);
        }

        // Insert all diagnostics
        const created = await DiagnosticResult.insertMany(diagnostics);
        console.log(`✅ Created ${created.length} diagnostic results`);

        // Update user's diagnostic status
        user.diagnosticCompleted = true;
        user.lastDiagnosticDate = new Date();
        await user.save();
        console.log(`✅ Updated user diagnostic status`);

        console.log("\n📊 Diagnostic Summary:");
        console.log(`   First Score: ${diagnostics[0].overallScore}%`);
        console.log(`   Latest Score: ${diagnostics[diagnostics.length - 1].overallScore}%`);
        console.log(`   Improvement: +${diagnostics[diagnostics.length - 1].overallScore - diagnostics[0].overallScore}%`);

        console.log("\n🎉 Diagnostic seed completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding diagnostic data:", error);
        process.exit(1);
    }
};

seedDiagnosticData();
