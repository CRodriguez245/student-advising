/**
 * Shared chat turn logic for Decision Coach.
 * Used by both Express (with session) and Vercel serverless (stateless).
 * Stateless callers must pass conversation_history and dq_coverage and use the returned values on the next request.
 */
const {
  getCoachResponse,
  scoreCoachingQuality,
  getStudentPersonaResponse,
  scoreStudentCoachingQuality
} = require('./utils/openai');
const {
  getCoachSystemPrompt,
  buildCurriculumContext,
  getStudentPersonaPrompt,
  getPersonaStage
} = require('./utils/prompts');

const DQ_DIMENSIONS = ['framing', 'alternatives', 'information', 'values', 'reasoning', 'commitment'];

function defaultDqCoverage() {
  return {
    framing: false,
    alternatives: false,
    information: false,
    values: false,
    reasoning: false,
    commitment: false
  };
}

/**
 * Process one chat turn. Stateless: pass in conversationHistory and dqCoverage, get back updated values in the response.
 * @param {Object} params
 * @param {string} params.message - User message
 * @param {string} params.mode - 'coach' | 'practice'
 * @param {string} [params.persona] - 'alex' | 'sam' | 'jordan' (practice only)
 * @param {Object} [params.curriculum_data] - Curriculum context
 * @param {Array<{role:string,content:string}>} [params.conversation_history] - Previous messages (for stateless)
 * @param {Object} [params.dq_coverage] - Current DQ coverage (for stateless)
 * @param {string} [params.initial_persona_message] - First assistant message in practice (optional)
 * @param {string} [params.session_id] - For logging
 */
async function processChatTurn(params) {
  const {
    message: userMessage,
    mode = 'coach',
    persona = 'alex',
    curriculum_data: curriculumData = {},
    conversation_history: passedHistory = [],
    dq_coverage: passedCoverage = null,
    initial_persona_message: initialPersonaMessage = null,
    session_id: sessionId = 'stateless'
  } = params;

  const conversationHistory = Array.isArray(passedHistory) ? passedHistory : [];
  const dqCoverage = passedCoverage && typeof passedCoverage === 'object'
    ? { ...defaultDqCoverage(), ...passedCoverage }
    : defaultDqCoverage();

  const curriculumContext = buildCurriculumContext(curriculumData);
  const turnsUsed = Math.floor(conversationHistory.length / 2) + 1;

  if (mode === 'coach') {
    const systemPrompt = getCoachSystemPrompt(curriculumContext);
    const coachResponse = await getCoachResponse(
      userMessage,
      systemPrompt,
      conversationHistory
    );
    const dqScores = await scoreCoachingQuality(
      coachResponse,
      userMessage,
      conversationHistory
    );
    const newHistory = [
      ...conversationHistory,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: coachResponse }
    ];
    const dqValues = DQ_DIMENSIONS
      .map(d => dqScores[d])
      .filter(v => v != null && !isNaN(v));
    const dqMinimum = dqValues.length > 0 ? Math.min(...dqValues) : 0;
    const newCoverage = { ...dqCoverage };
    DQ_DIMENSIONS.forEach(dim => {
      if (dqScores[dim] >= 0.3) newCoverage[dim] = true;
    });
    const conversationStatus = Object.values(newCoverage).every(Boolean) ? 'dq-complete' : 'in-progress';
    const response = {
      mode: 'coach',
      session_id: sessionId,
      user_message: userMessage,
      coach_reply: coachResponse,
      dq_score: dqScores,
      dq_score_minimum: dqMinimum,
      turnsUsed,
      dqCoverage: newCoverage,
      conversationStatus,
      timestamp: new Date().toISOString()
    };
    if (conversationStatus === 'dq-complete') {
      response.sessionSummary = {
        totalTurns: turnsUsed,
        dqAreasCompleted: DQ_DIMENSIONS.filter(d => newCoverage[d]),
        feedback: 'The advisor covered key areas of academic planning.'
      };
    }
    return response;
  }

  // Practice mode
  const currentStage = 'confused'; // stateless: we don't persist persona stage; could pass in body if needed
  const systemPrompt = getStudentPersonaPrompt(persona, currentStage, curriculumContext);
  let personaResponse;
  try {
    personaResponse = await getStudentPersonaResponse(
      userMessage,
      systemPrompt,
      conversationHistory
    );
    if (!personaResponse || !personaResponse.trim()) {
      personaResponse = "I'm sorry, I'm having trouble processing that right now. Can you try rephrasing your question?";
    }
  } catch (err) {
    personaResponse = "I'm sorry, I'm having trouble processing that right now. Can you try rephrasing your question?";
  }
  const dqScores = await scoreStudentCoachingQuality(
    userMessage,
    personaResponse,
    conversationHistory
  );
  const dqValues = DQ_DIMENSIONS
    .map(d => dqScores[d])
    .filter(v => v != null && !isNaN(v));
  const dqMinimum = dqValues.length > 0 ? Math.min(...dqValues) : 0;
  const newStage = getPersonaStage(dqMinimum);
  const newCoverage = { ...dqCoverage };
  DQ_DIMENSIONS.forEach(dim => {
    if (dqScores[dim] >= 0.3) newCoverage[dim] = true;
  });
  const conversationStatus = Object.values(newCoverage).every(Boolean) ? 'dq-complete' : 'in-progress';
  const response = {
    mode: 'practice',
    session_id: sessionId,
    user_message: userMessage,
    persona_reply: personaResponse,
    persona,
    persona_stage: newStage,
    persona_progress: dqMinimum,
    dq_score: dqScores,
    dq_score_minimum: dqMinimum,
    turnsUsed,
    dqCoverage: newCoverage,
    conversationStatus,
    timestamp: new Date().toISOString()
  };
  if (conversationStatus === 'dq-complete') {
    response.sessionSummary = {
      totalTurns: turnsUsed,
      dqAreasCompleted: DQ_DIMENSIONS.filter(d => newCoverage[d]),
      feedback: 'You covered all key areas of Decision Quality in your coaching.'
    };
  }
  return response;
}

module.exports = { processChatTurn, defaultDqCoverage };
