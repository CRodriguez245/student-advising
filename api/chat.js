/**
 * Vercel serverless function: Decision Coach chat.
 * Same behavior as backend POST /chat, but stateless: send conversation_history and dq_coverage in the body; response includes updated dqCoverage.
 * Set OPENAI_API_KEY in Vercel project environment variables.
 */
// Load env from root .env or backend/.env (local dev). On Vercel, use Project Settings → Environment Variables.
require('dotenv').config();
try { require('dotenv').config({ path: require('path').join(__dirname, '..', 'backend', '.env') }); } catch (_) {}
const { processChatTurn } = require('../backend/src/chatHandler');

module.exports = async (req, res) => {
  // Allow same-origin and Vercel preview URLs
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const {
    message,
    session_id: sessionId,
    mode = 'coach',
    persona = 'alex',
    curriculum_data: curriculumData = {},
    conversation_history: conversationHistory,
    dq_coverage: dqCoverage,
    initial_persona_message: initialPersonaMessage
  } = body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }
  if (mode !== 'coach' && mode !== 'practice') {
    return res.status(400).json({ error: 'Mode must be "coach" or "practice"' });
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not set');
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'OPENAI_API_KEY is not configured. Add it in Vercel Project Settings → Environment Variables.'
    });
  }

  try {
    const result = await processChatTurn({
      message,
      session_id: sessionId || `vercel-${Date.now()}`,
      mode,
      persona,
      curriculum_data: curriculumData,
      conversation_history: conversationHistory,
      dq_coverage: dqCoverage,
      initial_persona_message: initialPersonaMessage
    });
    res.status(200).json(result);
  } catch (err) {
    console.error('[api/chat] Error:', err);
    res.status(500).json({
      error: 'Failed to process message',
      message: err.message || 'Unknown error'
    });
  }
};
