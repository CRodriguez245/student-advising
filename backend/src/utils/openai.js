const OpenAI = require('openai');
// Load environment variables (in case dotenv hasn't loaded yet)
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Retry OpenAI API calls with exponential backoff for rate limit errors
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isRateLimitError = error?.status === 429 ||
        error?.code === 'rate_limit_exceeded' ||
        error?.message?.includes('rate limit');
      
      if (!isRateLimitError || attempt === maxRetries - 1) {
        throw error;
      }
      
      const retryAfterMs = error?.headers?.['retry-after-ms']
        ? parseInt(error.headers['retry-after-ms'])
        : baseDelay * Math.pow(2, attempt);
      const delay = Math.min(retryAfterMs, 30000);
      
      console.log(`⏳ Rate limit hit, retrying in ${(delay / 1000).toFixed(1)}s (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

/**
 * Enforce short coach reply: keep only first 1–3 sentences up to and including the first question.
 * Cuts off multi-paragraph or multi-dimension responses.
 */
function truncateCoachReply(reply) {
  if (!reply || typeof reply !== 'string') return reply;
  const trimmed = reply.trim();
  // Drop everything after phrases that start a new "section" (model ignoring one-step rule)
  const dropFrom = [
    /\s*\n\s*\*\*Framing\*\*/i,
    /\s*\n\s*\*\*Alternatives\*\*/i,
    /\s*\n\s*\*\*Information\*\*/i,
    /\s*\n\s*\*\*Values\*\*/i,
    /\s*\n\s*\*\*Reasoning\*\*/i,
    /\s*\n\s*\*\*Commitment\*\*/i,
    /\s+First,?\s+/i,
    /\s+Once we (?:understand|know)\s+/i,
    /\s+For example,?\s+(?:if|you)\s+/i,
    /\s+Alternatively,?\s+/i,
    /\s+What matters most (?:to you|in)\s+/i,
    /\s+Understanding your goals\s+/i,
    /\s+(?:Courses?|For example),?\s+(?:like|if)\s+/i,
    /\s+you might consider\s+/i,
    /\s+Next,\s+/i,
    /\s+Finally,\s+/i,
    /\s+Lastly[,.]/i,
    /\s+To start[,.]/i,
    /\.\s+In terms of\s+/i,
    /\.\s+Additionally[,.]/i,
    /\.\s+Furthermore[,.]/i,
    /\.\s+Gathering information/i,
    /\.\s+Once you['’]ve reflected/i,
    /\.\s+Think about how you plan/i,
    /\.\s+What steps do you think/i,
    /\s+Regarding your values/i,
    /\s+Let me know what you're thinking/i,
    /\s+we can continue to explore/i
  ];
  let out = trimmed;
  for (const re of dropFrom) {
    const idx = out.search(re);
    if (idx !== -1) out = out.slice(0, idx).trim();
  }
  // Keep only first question and at most one short sentence before it. Hard cap ~180 chars.
  const sentences = out.split(/(?<=[.?!])\s+/).map(s => s.trim()).filter(Boolean);
  const take = [];
  for (const s of sentences) {
    take.push(s);
    if (s.includes('?')) break;
    if (take.length >= 2) break;
  }
  let result = take.join(' ').trim() || trimmed.slice(0, 120);
  if (result.length > 180) {
    result = result.slice(0, 180);
    const lastSpace = result.lastIndexOf(' ');
    if (lastSpace > 100) result = result.slice(0, lastSpace);
  }
  return result.trim();
}

/**
 * Get coach response from OpenAI
 */
async function getCoachResponse(userMessage, systemPrompt, conversationHistory = []) {
  const messages = [
    { role: "system", content: systemPrompt }
  ];
  
  // Add conversation history
  conversationHistory.forEach(msg => {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    });
  });
  
  // Add current user message (prepend length reminder so model sees it every turn)
  messages.push({
    role: "user",
    content: "[One short sentence + one question only. No lists, no 'First...', no course examples.] " + userMessage
  });
  
  const chat = await retryWithBackoff(async () => {
    return await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      messages: messages,
      temperature: 0.5,
      max_tokens: 60,
    });
  });

  const raw = chat.choices[0]?.message?.content || '';
  return truncateCoachReply(raw);
}

/**
 * Score Decision Quality of coaching response
 * Measures how well the coach helps the student through DQ framework
 */
async function scoreCoachingQuality(coachResponse, studentMessage, conversationHistory) {
  const dqPrompt = `You are evaluating a decision coach's response to a student's question. Score how well the coach helps the student through the Decision Quality framework.

SCORING PRINCIPLE: The best coach replies are short, conversational, and focus on ONE dimension per message (e.g. one clarifying question, or one question about options). Give LOWER scores to replies that try to cover multiple dimensions, list framework steps (Framing, Alternatives, Information, Values, Reasoning, Commitment), or ask many questions at once. Score the dimension that this reply PRIMARILY addresses; other dimensions should be low (0.0-0.3) when the reply does not focus on them.

STUDENT'S QUESTION: ${studentMessage}

COACH'S RESPONSE: ${coachResponse}

CONVERSATION CONTEXT:
${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n\n')}

Evaluate the coach's response across 6 dimensions (0.0 to 1.0). Give high scores only to the one dimension the reply actually focuses on:

1. **Framing** (0.0-1.0): Does the coach help clarify what decision needs to be made? Does the coach help the student understand the problem clearly?

2. **Alternatives** (0.0-1.0): Does the coach help explore different options? Does the coach suggest or help identify multiple paths forward?

3. **Information** (0.0-1.0): Does the coach help gather relevant information? Does the coach reference specific courses, majors, or requirements?

4. **Values** (0.0-1.0): Does the coach help the student understand what matters to them? Does the coach explore the student's goals and priorities?

5. **Reasoning** (0.0-1.0): Does the coach help the student think through trade-offs? Does the coach help them reason about pros and cons?

6. **Commitment** (0.0-1.0): Does the coach help the student move toward a decision? Does the coach help them commit to next steps?

Return ONLY a JSON object with this exact format:
{
  "framing": 0.0-1.0,
  "alternatives": 0.0-1.0,
  "information": 0.0-1.0,
  "values": 0.0-1.0,
  "reasoning": 0.0-1.0,
  "commitment": 0.0-1.0,
  "overall": 0.0-1.0,
  "rationale": "brief explanation"
}`;

  try {
    const response = await retryWithBackoff(async () => {
      return await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o",
        messages: [
          { role: "system", content: "You are a Decision Quality evaluator. Return only valid JSON." },
          { role: "user", content: dqPrompt }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      });
    });
    
    const content = response.choices[0]?.message?.content || '{}';
    return JSON.parse(content);
  } catch (error) {
    console.error('DQ scoring error:', error);
    // Return default scores if scoring fails
    return {
      framing: 0.5,
      alternatives: 0.5,
      information: 0.5,
      values: 0.5,
      reasoning: 0.5,
      commitment: 0.5,
      overall: 0.5,
      rationale: "Scoring unavailable"
    };
  }
}

/**
 * Get student persona response (for practice mode)
 */
async function getStudentPersonaResponse(userMessage, systemPrompt, conversationHistory = []) {
  const messages = [
    { role: "system", content: systemPrompt }
  ];
  
  // Add conversation history
  conversationHistory.forEach(msg => {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    });
  });
  
  // Add current user message (this is the student coaching the persona)
  messages.push({ role: "user", content: userMessage });
  
  try {
    const chat = await retryWithBackoff(async () => {
      return await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o",
        messages: messages,
        temperature: 0.8, // Higher temperature for more varied persona responses
        max_tokens: 300, // Shorter responses for student personas
      });
    });
    
    const response = chat.choices[0]?.message?.content || '';
    if (!response || response.trim().length === 0) {
      console.error('Empty persona response from OpenAI');
      return "I'm not sure how to respond to that. Can you help me understand what you're asking?";
    }
    
    return response;
  } catch (error) {
    console.error('Error in getStudentPersonaResponse:', error);
    throw error; // Re-throw to be caught by route handler
  }
}

/**
 * Score student's coaching quality (for practice mode)
 * Measures how well the student coaches the AI persona
 */
async function scoreStudentCoachingQuality(studentMessage, personaResponse, conversationHistory) {
  const dqPrompt = `You are evaluating how well a student coaches an AI persona through a difficult decision. Score the student's coaching message using the Decision Quality framework.

STUDENT'S COACHING MESSAGE: ${studentMessage}

PERSONA'S RESPONSE: ${personaResponse}

CONVERSATION CONTEXT:
${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n\n')}

Evaluate the student's coaching message across 6 dimensions (0.0 to 1.0):

1. **Framing** (0.0-1.0): Does the student help clarify what decision needs to be made? Do they help the persona understand the problem?

2. **Alternatives** (0.0-1.0): Does the student help explore different options? Do they suggest or help identify multiple paths?

3. **Information** (0.0-1.0): Does the student help gather relevant information? Do they reference courses, majors, or requirements?

4. **Values** (0.0-1.0): Does the student help the persona understand what matters to them? Do they explore goals and priorities?

5. **Reasoning** (0.0-1.0): Does the student help think through trade-offs? Do they help reason about pros and cons?

6. **Commitment** (0.0-1.0): Does the student help move toward a decision? Do they help commit to next steps?

Return ONLY a JSON object with this exact format:
{
  "framing": 0.0-1.0,
  "alternatives": 0.0-1.0,
  "information": 0.0-1.0,
  "values": 0.0-1.0,
  "reasoning": 0.0-1.0,
  "commitment": 0.0-1.0,
  "overall": 0.0-1.0,
  "rationale": "brief explanation"
}`;

  try {
    const response = await retryWithBackoff(async () => {
      return await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o",
        messages: [
          { role: "system", content: "You are a Decision Quality evaluator. Return only valid JSON." },
          { role: "user", content: dqPrompt }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      });
    });
    
    const content = response.choices[0]?.message?.content || '{}';
    return JSON.parse(content);
  } catch (error) {
    console.error('Student coaching DQ scoring error:', error);
    return {
      framing: 0.5,
      alternatives: 0.5,
      information: 0.5,
      values: 0.5,
      reasoning: 0.5,
      commitment: 0.5,
      overall: 0.5,
      rationale: "Scoring unavailable"
    };
  }
}

module.exports = {
  getCoachResponse,
  scoreCoachingQuality,
  getStudentPersonaResponse,
  scoreStudentCoachingQuality
};
