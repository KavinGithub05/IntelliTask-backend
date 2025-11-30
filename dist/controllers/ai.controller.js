"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.suggestPriority = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const suggestPriority = async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!description && !title) {
            return res
                .status(400)
                .json({ error: 'Title or description is required' });
        }
        // If OpenAI key is not set, use heuristic
        if (!OPENAI_KEY) {
            const text = (description || title || '').toLowerCase();
            if (/urgent|asap|immediately|critical|emergency|important/.test(text)) {
                return res.json({ priority: 'high' });
            }
            if (/soon|this week|medium|normal|standard|priority/.test(text)) {
                return res.json({ priority: 'medium' });
            }
            return res.json({ priority: 'low' });
        }
        // Call OpenAI API
        const prompt = `Given the following task, suggest a priority level (low, medium, or high). 
    Return ONLY the priority word in lowercase.
    
    Title: ${title || 'N/A'}
    Description: ${description || 'N/A'}`;
        const response = await axios_1.default.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 10,
            temperature: 0.0,
        }, {
            headers: { Authorization: `Bearer ${OPENAI_KEY}` },
        });
        const text = response.data.choices?.[0]?.message?.content?.trim().toLowerCase() ||
            'medium';
        const priority = ['low', 'medium', 'high'].includes(text) ? text : 'medium';
        res.json({ priority });
    }
    catch (err) {
        console.error('AI suggestion error:', err.message);
        // Fallback heuristic if OpenAI fails
        const text = (req.body.description || req.body.title || '').toLowerCase();
        if (/urgent|asap|immediately|critical|emergency|important/.test(text)) {
            return res.json({ priority: 'high' });
        }
        if (/soon|this week|medium|normal|standard|priority/.test(text)) {
            return res.json({ priority: 'medium' });
        }
        return res.json({ priority: 'low' });
    }
};
exports.suggestPriority = suggestPriority;
//# sourceMappingURL=ai.controller.js.map