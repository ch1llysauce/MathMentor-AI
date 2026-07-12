import axios from 'axios';

// Store conversation history per user (in-memory for now, should move to DB in production)
const conversationHistory = new Map();

export const chat = async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    const userId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check if Groq API key is configured
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ 
        error: 'Groq API key not configured. Add GROQ_API_KEY to environment variables.' 
      });
    }

    // Get or create conversation history
    const historyKey = conversationId || `${userId}-${Date.now()}`;
    let history = conversationHistory.get(historyKey) || [];

    // Add user message to history
    history.push({
      role: 'user',
      content: message,
    });

    // Prepare messages for OpenAI
    const messages = [
      {
        role: 'system',
        content: `You are MathMentor AI, a helpful and patient mathematics tutor. Your role is to:
- Help students understand mathematical concepts step-by-step
- Explain solutions clearly without just giving answers
- Encourage students to think through problems
- Use simple language appropriate for high school students
- Break down complex problems into manageable steps
- Provide relevant examples when helpful
- Be encouraging and supportive

When explaining math:
- Use clear formatting for equations
- Number your steps
- Explain the "why" behind each step
- Check for understanding
- Offer practice problems when appropriate

Topics you cover: Algebra, Geometry, and Trigonometry.`,
      },
      ...history,
    ];

    // Call Groq API (FREE & FAST!)
    const groqResponse = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-70b-versatile', // Latest FREE model (replaces llama3-70b-8192)
        messages: messages,
        max_tokens: 800,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const aiMessage = groqResponse.data.choices[0].message.content;

    // Add AI response to history
    history.push({
      role: 'assistant',
      content: aiMessage,
    });

    // Keep only last 10 messages to manage memory
    if (history.length > 10) {
      history = history.slice(-10);
    }

    // Store updated history
    conversationHistory.set(historyKey, history);

    res.json({
      message: aiMessage,
      conversationId: historyKey,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Tutor chat error:', error.response?.data || error.message);
    console.error('Full error:', error);
    
    if (error.response?.status === 401) {
      return res.status(500).json({ 
        error: 'Groq API key not configured properly. Get a FREE key from https://console.groq.com/keys' 
      });
    }

    if (error.response?.status === 429) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Please wait a moment and try again.' 
      });
    }

    res.status(500).json({ 
      error: 'Failed to get response from AI tutor',
      details: error.response?.data?.error?.message || error.message 
    });
  }
};

export const clearConversation = async (req, res) => {
  try {
    const { conversationId } = req.body;
    
    if (conversationId) {
      conversationHistory.delete(conversationId);
    }

    res.json({ message: 'Conversation cleared successfully' });
  } catch (error) {
    console.error('Clear conversation error:', error);
    res.status(500).json({ error: 'Failed to clear conversation' });
  }
};

export const getConversationHistory = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const history = conversationHistory.get(conversationId) || [];

    res.json({ 
      conversationId,
      messages: history,
      count: history.length 
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to get conversation history' });
  }
};
