const express = require('express');
const { OpenAI } = require('openai');
const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Chat endpoint
router.post('/chat', async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Prepare conversation context
        const messages = [
            {
                role: 'system',
                content: `You are a helpful customer service assistant for Nibash. 
        Be friendly, professional, and helpful. Answer questions about services, 
        bookings, and general inquiries. Keep responses concise but informative.`
            },
            ...conversationHistory,
            { role: 'user', content: message }
        ];

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: messages,
            max_tokens: 150,
            temperature: 0.7,
        });

        const aiResponse = completion.choices[0].message.content;

        res.json({
            response: aiResponse,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({
            error: 'Sorry, I encountered an error. Please try again.'
        });
    }
});

// Get chatbot status
router.get('/status', (req, res) => {
    res.json({
        status: 'online',
        service: 'Nibash AI Assistant',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;