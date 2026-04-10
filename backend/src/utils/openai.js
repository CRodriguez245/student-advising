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
 * Class Advisor replies: at most `maxSentences` sentences (system prompt asks for six or fewer).
 */
function truncateAdvisorReply(reply, maxSentences = 6) {
  if (!reply || typeof reply !== 'string') return reply;
  const trimmed = reply.trim();
  const normalized = trimmed.replace(/\s+/g, ' ');
  const parts = normalized.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
  if (parts.length <= maxSentences) return trimmed;
  return parts.slice(0, maxSentences).join(' ');
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
  
  messages.push({
    role: "user",
    content: "[Reply in at most six sentences; ground course specifics in session context.] " + userMessage
  });
  
  const chat = await retryWithBackoff(async () => {
    return await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      messages: messages,
      temperature: 0.55,
      max_tokens: 450,
    });
  });

  const raw = chat.choices[0]?.message?.content || '';
  return truncateAdvisorReply(raw, 6);
}

/**
 * Score Decision Quality of coaching response
 * Measures how well the coach helps the student through DQ framework
 */
async function scoreCoachingQuality(coachResponse, studentMessage, conversationHistory) {
  const dqPrompt = `You are evaluating an Illinois Institute of Technology Class Advisor's reply to a student's academic planning question. The advisor should sound warm, efficient, and specific; stay within about six sentences; ground course and requirement claims in context when given; avoid inventing catalog facts; and end with a clear next step or one sharp question when appropriate.

SCORING PRINCIPLE: Score how well this single reply supports academic planning. A strong reply may touch several dimensions. Map dimensions loosely as: framing (clarifying the planning situation), alternatives (paths or combinations), information (correct use of context/catalog awareness), values (priorities that affect course choices), reasoning (tradeoffs), commitment (next step or decision momentum).

STUDENT'S QUESTION: ${studentMessage}

ADVISOR'S RESPONSE: ${coachResponse}

CONVERSATION CONTEXT:
${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n\n')}

Evaluate the advisor's response across these 6 dimensions (0.0 to 1.0):

1. **Framing** (0.0-1.0): Clarifies what academic planning question or constraint matters now.

2. **Alternatives** (0.0-1.0): Presents or compares concrete options or sequences when appropriate.

3. **Information** (0.0-1.0): Uses session/catalog context appropriately; says where to verify when uncertain; avoids fabricated course numbers or rules.

4. **Values** (0.0-1.0): Connects advice to the student's stated goals, priorities, or constraints (without vague life coaching).

5. **Reasoning** (0.0-1.0): Explains tradeoffs or sequencing logic briefly and clearly.

6. **Commitment** (0.0-1.0): Offers a clear next step or one focused follow-up question to move planning forward.

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
          { role: "system", content: "You are an academic advising quality evaluator. Return only valid JSON." },
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
