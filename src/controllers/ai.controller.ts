import { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPENAI_KEY = process.env.OPENAI_API_KEY;

export const suggestPriority = async (req: Request, res: Response) => {
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

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 10,
        temperature: 0.0,
      },
      {
        headers: { Authorization: `Bearer ${OPENAI_KEY}` },
      }
    );

    const text =
      response.data.choices?.[0]?.message?.content?.trim().toLowerCase() ||
      'medium';

    const priority = ['low', 'medium', 'high'].includes(text) ? text : 'medium';

    res.json({ priority });
  } catch (err: any) {
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
