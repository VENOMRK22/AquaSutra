import { Router } from 'express';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

// Initialize Groq
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const SYSTEM_PROMPT = `
You are the AI Assistant for "Aqua Sutra" (Jal Sutra), a precision-agriculture app for Indian farmers.
Your goal is to help farmers maximize profit (ROI) by conserving water (Wapsa condition) and choosing the right crops.

Key Context & Knowledge:
1. Location: You know the farmer's village, district, state. Use this for weather/crop advice.
2. Water Balance: If the farmer has a water deficit, suggest drought-resistant crops (Jowar, Bajra, Pulses) and drip irrigation.
3. Wapsa: "Wapsa" is the ideal soil moisture condition (50% air, 50% water). Always emphasize maintaining Wapsa.
4. Profit: Focus on "Water Productivity" (Profit per liter of water), not just yield per acre.
5. Tone: Simple, encouraging, Hinglish (Hindi+English) if requested, or straightforward English.

Current User Context:
{{CONTEXT_JSON}}

If the user asks about market prices, weather, or specific crop advice, use the provided context.
Answer short and concise.
`;

router.post('/chat', async (req, res) => {
    console.log("=== AI CHAT REQUEST RECEIVED ===");
    console.log("Environment GROQ_API_KEY:", process.env.GROQ_API_KEY ? "EXISTS" : "MISSING");
    try {
        const { message, history, context } = req.body;
        console.log("Request Body Message:", message);
        console.log("Request Body Context:", context ? "Present" : "Missing");

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Prepare context string
        const contextStr = context ? JSON.stringify(context, null, 2) : "No context available";
        const systemMessage = SYSTEM_PROMPT.replace('{{CONTEXT_JSON}}', contextStr);

        // Prepare messages for Groq
        const messages = [
            { role: "system", content: systemMessage },
            ...history || [],
            { role: "user", content: message }
        ];

        const completion = await groq.chat.completions.create({
            messages: messages,
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 1024,
            top_p: 1,
            stream: false,
            stop: null
        });

        const reply = completion.choices[0]?.message?.content || "I'm not sure how to answer that.";

        // Simple Intent Detection for Actions
        let action = null;
        let action_param = null;

        const lowerReply = reply.toLowerCase();
        if (lowerReply.includes("market") && lowerReply.includes("check")) action = "NAVIGATE_MARKET";
        if (lowerReply.includes("farm") && lowerReply.includes("setup")) action = "NAVIGATE_FARM";

        res.json({
            reply,
            action,
            action_param
        });

    } catch (error: any) {
        const errorLog = `
[${new Date().toISOString()}] ERROR:
${error.stack || error}
DETAILS: ${JSON.stringify(error.response?.data || {}, null, 2)}
----------------------------------------
`;
        try {
            const fs = require('fs');
            const path = require('path');
            const logPath = path.join(process.cwd(), 'backend_error.log');
            console.log("Writing error to:", logPath);
            fs.appendFileSync(logPath, errorLog);
        } catch (e) {
            console.error("Failed to write to log file", e);
        }

        console.error('Groq API Error Detail:', error);
        res.status(500).json({ error: 'Failed to generate response from AI' });
    }
});

export default router;
