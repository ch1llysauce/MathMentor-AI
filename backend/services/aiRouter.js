import axios from "axios";

/**
 * AI Router Service
 * Implements multi-AI fallback system: Groq (Primary) → Gemini (Fallback) → Rule-based (Backup)
 * Based on MathMentor AI AI System architecture
 */

/**
 * Call Groq API (Primary AI Tutor)
 */
const callGroqAPI = async (prompt, context = {}) => {
    try {
        if (!process.env.GROQ_API_KEY) {
            throw new Error("Groq API key not configured");
        }

        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "openai/gpt-oss-120b",
                messages: [
                    {
                        role: "system",
                        content: `You are a patient mathematics tutor specializing in ${context.topic || "mathematics"}. 
Use the Socratic method: guide students with questions rather than giving direct answers.
Break down complex problems into smaller steps.
Encourage critical thinking and help students discover solutions themselves.
Be supportive and positive.`
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 4096
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                timeout: 15000 // 15 second timeout
            }
        );

        return {
            success: true,
            response: response.data.choices[0].message.content,
            source: "Groq",
            model: "openai/gpt-oss-120b"
        };

    } catch (error) {
        console.error("Groq API Error:", error.message);
        throw new Error(`Groq API failed: ${error.message}`);
    }
};

/**
 * Call Gemini API (Fallback AI Tutor)
 */
const callGeminiAPI = async (prompt, context = {}) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("Gemini API key not configured");
        }

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [
                    {
                        parts: [
                            {
                                text: `You are a patient mathematics tutor specializing in ${context.topic || "mathematics"}. 
Use the Socratic method: guide students with questions rather than giving direct answers.

Student Question: ${prompt}`
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 4096
                }
            },
            {
                headers: {
                    "Content-Type": "application/json"
                },
                timeout: 10000 // 10 second timeout
            }
        );

        return {
            success: true,
            response: response.data.candidates[0].content.parts[0].text,
            source: "Gemini",
            model: "gemini-1.5-flash"
        };

    } catch (error) {
        console.error("Gemini API Error:", error.message);
        throw new Error(`Gemini API failed: ${error.message}`);
    }
};

/**
 * Rule-based Tutor (Final Fallback)
 * Provides basic guidance when AI services are unavailable
 */
const getRuleBasedResponse = (prompt, context = {}) => {
    const topic = context.topic || "mathematics";
    const subtopic = context.subtopic || "";

    // Basic response templates
    const responses = {
        "Algebra": [
            "Let's break this algebra problem down step by step. What operation should we perform first?",
            "Think about the order of operations (PEMDAS). What comes first?",
            "Can you identify the variable in this equation? What are we trying to solve for?"
        ],
        "Geometry": [
            "Let's visualize this geometry problem. Can you draw or describe the shape?",
            "What formula do we use to calculate this? Think about the properties of this shape.",
            "Remember: angles in a triangle always sum to 180°. How can we use this?"
        ],
        "Trigonometry": [
            "Remember SOH-CAH-TOA. Which ratio do we need for this problem?",
            "Let's identify the sides: which is opposite, adjacent, and hypotenuse?",
            "Think about the trigonometric ratios. What information do we have and what are we looking for?"
        ]
    };

    // Get random response for the topic
    const topicResponses = responses[topic] || [
        "Let's think about this step by step. What information do we have?",
        "Can you identify what the problem is asking for?",
        "What mathematical concepts might apply here?"
    ];

    const randomResponse = topicResponses[Math.floor(Math.random() * topicResponses.length)];

    return {
        success: true,
        response: `${randomResponse}\n\nNote: AI tutoring is temporarily unavailable. This is a basic guidance response.`,
        source: "Rule-based",
        model: "Fallback System"
    };
};

/**
 * Main AI Router Function
 * Attempts Groq → Gemini → Rule-based in sequence
 */
export const askAITutor = async (prompt, context = {}) => {
    // Try Groq first (Primary)
    try {
        console.log("Attempting Groq API...");
        const groqResponse = await callGroqAPI(prompt, context);
        return groqResponse;
    } catch (groqError) {
        console.warn("Groq failed, trying Gemini fallback...");
        
        // Try Gemini (Fallback)
        try {
            const geminiResponse = await callGeminiAPI(prompt, context);
            return geminiResponse;
        } catch (geminiError) {
            console.warn("Gemini failed, using rule-based fallback...");
            
            // Use rule-based system (Final fallback)
            return getRuleBasedResponse(prompt, context);
        }
    }
};

/**
 * Generate AI-powered explanation for a specific answer
 */
export const getAnswerExplanation = async (question, correctAnswer, userAnswer, context = {}) => {
    const isCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
    
    const prompt = `
Question: ${question}
Correct Answer: ${correctAnswer}
Student's Answer: ${userAnswer}
Result: ${isCorrect ? "Correct" : "Incorrect"}

${isCorrect 
    ? "Provide positive reinforcement and explain why this answer is correct. Briefly explain the concept."
    : "Gently explain where the student went wrong and guide them toward understanding the correct answer. Use the Socratic method."}
`;

    return await askAITutor(prompt, context);
};

/**
 * Generate step-by-step solution hints
 */
export const getHint = async (question, step, context = {}) => {
    const prompt = `
Question: ${question}

The student needs a hint for step ${step}. Provide a guiding question or small hint that helps them move forward without giving away the answer completely.
`;

    return await askAITutor(prompt, context);
};

/**
 * Generate practice problems using AI
 */
export const generatePracticeProblem = async (topic, subtopic, difficulty, context = {}) => {
    const prompt = `
Generate a ${difficulty} level ${topic} problem focused on ${subtopic}.

Provide:
1. The problem statement
2. Four multiple choice options (label them A, B, C, D)
3. The correct answer (just the letter)
4. A brief explanation of the solution

Format your response as JSON:
{
  "question": "...",
  "choices": ["A. ...", "B. ...", "C. ...", "D. ..."],
  "correctAnswer": "A",
  "explanation": "..."
}
`;

    try {
        const response = await askAITutor(prompt, { ...context, topic });
        
        // Try to parse JSON from response
        const jsonMatch = response.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                success: true,
                problem: parsed,
                source: response.source
            };
        }
        
        return {
            success: false,
            message: "Could not parse AI response",
            rawResponse: response.response
        };
        
    } catch (error) {
        console.error("Error generating practice problem:", error);
        return {
            success: false,
            message: "Failed to generate practice problem"
        };
    }
};

export default {
    askAITutor,
    getAnswerExplanation,
    getHint,
    generatePracticeProblem
};
