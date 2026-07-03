import axios from "axios";

const BASE_URL = "http://localhost:5000/api";
let authToken = "";
let userId = "";

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

const log = {
    success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
    info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
    section: (msg) => console.log(`\n${colors.yellow}${'='.repeat(50)}\n${msg}\n${'='.repeat(50)}${colors.reset}`)
};

// Test runner
async function runTests() {
    log.section("🚀 MATHMENTOR AI - API ENDPOINT TESTS");

    try {
        // Test 1: Health Check
        log.section("TEST 1: Health Check");
        await testHealthCheck();

        // Test 2: User Registration
        log.section("TEST 2: User Registration");
        await testRegister();

        // Test 3: User Login
        log.section("TEST 3: User Login");
        await testLogin();

        // Test 4: Get Profile
        log.section("TEST 4: Get User Profile");
        await testGetProfile();

        // Test 5: Create Question
        log.section("TEST 5: Create Sample Question");
        await testCreateQuestion();

        // Test 6: Get Questions
        log.section("TEST 6: Get Questions");
        await testGetQuestions();

        // Test 7: Submit Answer
        log.section("TEST 7: Submit Answer");
        await testSubmitAnswer();

        // Test 8: Get Progress
        log.section("TEST 8: Get Progress");
        await testGetProgress();

        // Test 9: AI Tutor (if API keys configured)
        log.section("TEST 9: AI Tutor");
        await testAITutor();

        log.section("✅ ALL TESTS COMPLETED!");
        log.info("Check results above for any failures");

    } catch (error) {
        log.error(`Test suite failed: ${error.message}`);
        console.error(error);
    }

    process.exit(0);
}

// Test Functions

async function testHealthCheck() {
    try {
        const response = await axios.get("http://localhost:5000/health");
        log.success("Health check passed");
        log.info(`Status: ${response.data.status}`);
        log.info(`Uptime: ${Math.round(response.data.uptime)}s`);
        return true;
    } catch (error) {
        log.error(`Health check failed: ${error.message}`);
        return false;
    }
}

async function testRegister() {
    try {
        const userData = {
            displayName: "Test User",
            email: `test${Date.now()}@example.com`,
            password: "Test123!",
            gradeLevel: 10,
            focusAreas: ["Algebra", "Geometry"]
        };

        const response = await axios.post(`${BASE_URL}/auth/register`, userData);
        authToken = response.data.data.token;
        userId = response.data.data.user.id;

        log.success("User registration successful");
        log.info(`User ID: ${userId}`);
        log.info(`Email: ${userData.email}`);
        log.info(`Token received: ${authToken.substring(0, 20)}...`);
        return true;
    } catch (error) {
        log.error(`Registration failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function testLogin() {
    try {
        // Use a test account (you'll need to register one first)
        const loginData = {
            email: "test@example.com",
            password: "Test123!"
        };

        const response = await axios.post(`${BASE_URL}/auth/login`, loginData);
        
        log.success("Login successful");
        log.info(`User: ${response.data.data.user.displayName}`);
        return true;
    } catch (error) {
        log.error(`Login failed (this is expected if test user doesn't exist): ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function testGetProfile() {
    try {
        const response = await axios.get(`${BASE_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        log.success("Get profile successful");
        log.info(`Name: ${response.data.data.user.displayName}`);
        log.info(`Email: ${response.data.data.user.email}`);
        log.info(`Grade: ${response.data.data.user.gradeLevel}`);
        return true;
    } catch (error) {
        log.error(`Get profile failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function testCreateQuestion() {
    try {
        const questionData = {
            topic: "Algebra",
            subtopic: "Linear Equations",
            difficulty: "Easy",
            question: "Solve for x: x + 5 = 10",
            questionType: "Multiple Choice",
            choices: ["A. 3", "B. 5", "C. 10", "D. 15"],
            correctAnswer: "B",
            explanation: "Subtract 5 from both sides: x = 10 - 5 = 5",
            hints: ["What operation undoes addition?", "Try subtracting 5 from both sides"],
            isDiagnostic: false
        };

        const response = await axios.post(`${BASE_URL}/questions`, questionData, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        log.success("Question created successfully");
        log.info(`Question ID: ${response.data.data.question._id}`);
        log.info(`Topic: ${response.data.data.question.topic}`);
        return response.data.data.question._id;
    } catch (error) {
        log.error(`Create question failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function testGetQuestions() {
    try {
        const response = await axios.get(`${BASE_URL}/questions?topic=Algebra&limit=5`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        log.success("Get questions successful");
        log.info(`Questions found: ${response.data.count}`);
        if (response.data.count > 0) {
            log.info(`First question: ${response.data.data.questions[0].question}`);
        }
        return true;
    } catch (error) {
        log.error(`Get questions failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function testSubmitAnswer() {
    try {
        // First create a question to answer
        const questionId = await testCreateQuestion();
        if (!questionId) {
            log.error("Cannot test submit answer without a question");
            return false;
        }

        const answerData = {
            questionId: questionId,
            userAnswer: "B",
            timeSpent: 30
        };

        const response = await axios.post(`${BASE_URL}/questions/submit`, answerData, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        log.success("Answer submission successful");
        log.info(`Correct: ${response.data.data.isCorrect}`);
        log.info(`Validation method: ${response.data.data.validation}`);
        return true;
    } catch (error) {
        log.error(`Submit answer failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function testGetProgress() {
    try {
        const response = await axios.get(`${BASE_URL}/progress`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        log.success("Get progress successful");
        log.info(`Progress records: ${response.data.count}`);
        return true;
    } catch (error) {
        log.error(`Get progress failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function testAITutor() {
    try {
        const tutorRequest = {
            question: "I don't understand how to solve 2x + 5 = 15. Can you help?",
            context: {
                topic: "Algebra",
                subtopic: "Linear Equations"
            }
        };

        const response = await axios.post(`${BASE_URL}/ai/ask`, tutorRequest, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        log.success("AI Tutor response received");
        log.info(`Source: ${response.data.data.source}`);
        log.info(`Model: ${response.data.data.model}`);
        log.info(`Response preview: ${response.data.data.response.substring(0, 100)}...`);
        return true;
    } catch (error) {
        log.error(`AI Tutor failed (check if API keys are configured): ${error.response?.data?.message || error.message}`);
        return false;
    }
}

// Run all tests
runTests();
