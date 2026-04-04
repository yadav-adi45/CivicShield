import { Router } from 'express';
import axios from 'axios';

const router = Router();

// Support both Groq and Google Gemini APIs
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const USE_GOOGLE = process.env.USE_GOOGLE_API === 'true' || false; // Default to Groq (more reliable)

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GOOGLE_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GOOGLE_API_KEY}`;

router.post('/chat', async (req, res, next) => {
  try {
    const { message, conversationHistory = [], context = null } = req.body;

    // DEBUG: Log incoming request
    console.log('========================================');
    console.log('[Chat] INCOMING REQUEST');
    console.log('[Chat] Message:', message);
    console.log('[Chat] History length:', conversationHistory.length);
    console.log('[Chat] Context:', context ? `${context.state} (${context.riskLevel})` : 'None');
    console.log('========================================');

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Message is required and must be a string'
      });
    }

    // DEBUG: Log API configuration
    console.log('[Chat] API Configuration:');
    console.log('[Chat] USE_GOOGLE:', USE_GOOGLE);
    console.log('[Chat] GOOGLE_API_KEY exists:', !!GOOGLE_API_KEY);
    console.log('[Chat] GROQ_API_KEY exists:', !!GROQ_API_KEY);
    console.log('[Chat] GOOGLE_API_KEY value:', GOOGLE_API_KEY ? GOOGLE_API_KEY.substring(0, 20) + '...' : 'MISSING');

    let reply;

    if (USE_GOOGLE) {
      // Use Google Gemini API
      const systemPrompt = `You are CivicShield AI, a crisis intelligence assistant designed to help civilians during emergencies such as war, natural disasters, lockdowns, or resource shortages.

BEHAVIOR:
- Start by briefly acknowledging the user and restating their need in human words
- Provide direct, practical, and actionable guidance tied to their current context
- Keep answers concise (around 70-100 words) but warm and natural
- Prioritize safety, then resources, then next best steps
- If the user message is unclear, ask one clarifying question

TONE:
- Empathetic, conversational, and confident (like a skilled first responder coach)
- Use everyday language, no jargon
- Prefer bullet points for steps and simple short sentences
- Avoid robotic phrases; use natural expressions like "Here's what to do now"
- Never say "I think" or "maybe"

CRITICAL RULES:
- Always prioritize immediate safety over explanation
- Keep responses practical and human, not academic
- Give step-by-step action items, not theory`;
      
      // Build context text if available
      let contextText = '';
      if (context) {
        contextText = `\n\nCURRENT STATE CONTEXT:\nState: ${context.state} (${context.stateCode})\nRisk Level: ${context.riskLevel} (${(context.riskScore * 100).toFixed(0)}%)\nTop Shortages: ${context.shortages.map(s => `${s.resource} (${(s.probability * 100).toFixed(0)}% ${s.severity})`).join(', ')}\nKey Factors: ${context.topFactors.join(', ')}\n\nUse this data to give specific, actionable advice for ${context.state}.`;
      }
      
      // Build conversation context
      let conversationText = systemPrompt + contextText + '\n\n';
      conversationHistory.slice(-4).forEach(msg => {
        conversationText += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
      conversationText += `User: ${message}\nAssistant:`;

      // DEBUG: Log request payload
      console.log('[Chat] Sending to Google Gemini API...');
      console.log('[Chat] API URL:', GOOGLE_API_URL.substring(0, 80) + '...');
      console.log('[Chat] Request payload:', JSON.stringify({
        contents: [{
          parts: [{
            text: conversationText.substring(0, 100) + '...'
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
        }
      }, null, 2));

      const response = await axios.post(
        GOOGLE_API_URL,
        {
          contents: [{
            parts: [{
              text: conversationText
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 200,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      // DEBUG: Log full response
      console.log('[Chat] Google API Response Status:', response.status);
      console.log('[Chat] Google API Response Data:', JSON.stringify(response.data, null, 2));

      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        reply = response.data.candidates[0].content.parts[0].text;
        console.log('[Chat] ✅ Google Gemini response generated successfully');
        console.log('[Chat] Reply:', reply.substring(0, 100) + '...');
      } else {
        console.error('[Chat] ❌ Invalid response structure from Google Gemini');
        console.error('[Chat] Response data:', JSON.stringify(response.data, null, 2));
        throw new Error('Invalid response format from Google Gemini API');
      }
    } else {
      // Use Groq API (fallback)
      const systemPrompt = `You are CivicShield AI, a crisis intelligence assistant designed to help civilians during emergencies such as war, natural disasters, lockdowns, or resource shortages.

BEHAVIOR:
- Start by briefly acknowledging the user and restating their need in natural, human tone
- Provide direct, practical, and actionable guidance tied to their current context
- Keep answers concise (around 70-100 words) but approachable
- Prioritize safety, then resources, then next immediate steps
- If user intent is ambiguous, ask a clear follow-up question

TONE:
- Empathetic, conversational, and confident (like an experienced crisis responder)
- Use simple everyday language and short sentences
- Prefer bullet points for steps and concrete actions
- Avoid robotic template wording; use phrases like "You can...", "Next, do..."
- Never say "I think" or "maybe"

CRITICAL RULES:
- Always prioritize immediate safety over explanation
- Keep responses practical and human, not academic
- Give step-by-step action items, not theory`;
      
      // Build context text if available
      let contextText = '';
      if (context) {
        contextText = `\n\nCURRENT STATE CONTEXT:\nState: ${context.state} (${context.stateCode})\nRisk Level: ${context.riskLevel} (${(context.riskScore * 100).toFixed(0)}%)\nTop Shortages: ${context.shortages.map(s => `${s.resource} (${(s.probability * 100).toFixed(0)}% ${s.severity})`).join(', ')}\nKey Factors: ${context.topFactors.join(', ')}\n\nUse this data to give specific, actionable advice for ${context.state}.`;
      }
      
      const messages = [
        {
          role: 'system',
          content: systemPrompt + contextText
        },
        ...conversationHistory.slice(-4),
        {
          role: 'user',
          content: message
        }
      ];

      const response = await axios.post(
        GROQ_API_URL,
        {
          model: 'llama-3.3-70b-versatile',
          messages: messages,
          max_tokens: 200,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      if (response.data?.choices?.[0]?.message?.content) {
        reply = response.data.choices[0].message.content;
        console.log('[Chat] Groq response generated successfully');
      } else {
        throw new Error('Invalid response format from Groq API');
      }
    }

    return res.json({
      reply: reply,
      success: true
    });

  } catch (error) {
    console.error('========================================');
    console.error('[Chat] ❌ ERROR OCCURRED');
    console.error('[Chat] Error message:', error.message);
    console.error('[Chat] Error code:', error.code);
    
    // Log full error response if available
    if (error.response) {
      console.error('[Chat] Response status:', error.response.status);
      console.error('[Chat] Response headers:', JSON.stringify(error.response.headers, null, 2));
      console.error('[Chat] Response data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('[Chat] No response object (network/timeout error)');
      console.error('[Chat] Full error:', error);
    }
    console.error('========================================');

    // Handle specific error types
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      console.error('[Chat] API error status:', status);
      console.error('[Chat] API error data:', JSON.stringify(errorData, null, 2));

      if (status === 401 || status === 403) {
        return res.status(500).json({
          error: 'Configuration Error',
          message: 'API authentication failed. Please check configuration.',
          reply: 'API authentication failed. Please check the API key configuration.'
        });
      } else if (status === 429) {
        return res.status(429).json({
          error: 'Rate Limit',
          message: 'Too many requests. Please wait a moment.',
          reply: 'I\'m receiving too many requests right now. Please wait a moment and try again.'
        });
      } else if (status === 400) {
        // Bad request - likely API format issue
        const errorMsg = errorData?.error?.message || JSON.stringify(errorData);
        return res.status(500).json({
          error: 'API Error',
          message: errorMsg,
          reply: `API Error (400): ${errorMsg.substring(0, 100)}`
        });
      } else {
        const errorMsg = errorData?.error?.message || JSON.stringify(errorData);
        return res.status(500).json({
          error: 'API Error',
          message: errorMsg,
          reply: `API Error (${status}): ${errorMsg.substring(0, 100)}`
        });
      }
    } else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return res.status(504).json({
        error: 'Timeout',
        message: 'Request timed out',
        reply: 'The request took too long. Please try asking a simpler question.'
      });
    } else {
      return res.status(500).json({
        error: 'Internal Error',
        message: error.message,
        reply: 'Service temporarily unavailable. Please try again in a moment.'
      });
    }
  }
});

export default router;
