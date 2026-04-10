const express = require('express');
const { 
  getCoachResponse, 
  scoreCoachingQuality,
  getStudentPersonaResponse,
  scoreStudentCoachingQuality
} = require('../utils/openai');
const { 
  getCoachSystemPrompt, 
  buildCurriculumContext,
  getStudentPersonaPrompt,
  getPersonaStage,
  studentPersonas
} = require('../utils/prompts');

const router = express.Router();

// In-memory session state (for production, use Redis or database)
const sessionState = {};

/**
 * POST /chat
 * Main endpoint for Decision Coach conversations
 */
router.post('/', async (req, res) => {
  const {
    message: userMessage,
    session_id: sessionId = `session-${Date.now()}`,
    user_id: userId = 'anon-user',
    mode = 'coach', // 'coach' or 'practice'
    persona = 'alex', // Only used in practice mode: 'alex', 'sam', 'jordan'
    curriculum_data: curriculumData = {},
    initial_persona_message: initialPersonaMessage = null, // Initial persona message for practice mode
    reset = false
  } = req.body;

  // Validate input
  if (!userMessage || typeof userMessage !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Validate mode
  if (mode !== 'coach' && mode !== 'practice') {
    return res.status(400).json({ error: 'Mode must be "coach" or "practice"' });
  }

  // Handle session reset
  if (reset && sessionState[sessionId]) {
    console.log(`🔄 Resetting session ${sessionId}`);
    delete sessionState[sessionId];
  }

  // Initialize session if needed
  if (!sessionState[sessionId]) {
    sessionState[sessionId] = {
      mode: mode,
      persona: mode === 'practice' ? persona : null,
      turnsUsed: 0,
      dqCoverage: {
        framing: false,
        alternatives: false,
        information: false,
        values: false,
        reasoning: false,
        commitment: false
      },
      personaStage: mode === 'practice' ? 'confused' : null,
      personaProgress: mode === 'practice' ? 0.0 : null,
      conversationHistory: []
    };
    
    // If practice mode and initial persona message provided, add it to conversation history
    if (mode === 'practice' && initialPersonaMessage) {
      sessionState[sessionId].conversationHistory.push({
        role: 'assistant',
        content: initialPersonaMessage
      });
      console.log(`[Session ${sessionId}] Added initial persona message to conversation history`);
    }
    
    console.log(`🆕 Created new session ${sessionId} in ${mode} mode`);
  }

  // Update mode if changed
  if (sessionState[sessionId].mode !== mode) {
    console.log(`🔄 Switching session ${sessionId} from ${sessionState[sessionId].mode} to ${mode} mode`);
    sessionState[sessionId].mode = mode;
    sessionState[sessionId].persona = mode === 'practice' ? persona : null;
    sessionState[sessionId].personaStage = mode === 'practice' ? 'confused' : null;
    sessionState[sessionId].personaProgress = mode === 'practice' ? 0.0 : null;
  }

  const session = sessionState[sessionId];
  session.turnsUsed += 1;

  try {
    console.log(`[Session ${sessionId}] Mode: ${mode}, Turn ${session.turnsUsed}: ${userMessage.substring(0, 50)}...`);

    // Build curriculum context
    const curriculumContext = buildCurriculumContext(curriculumData);

    let response;
    let dqScores;
    let dqMinimum;

    if (mode === 'coach') {
      // MODE 1: AI Coach helps student (pass DQ coverage so coach progresses incrementally)
      const systemPrompt = getCoachSystemPrompt(curriculumContext);
      const coachResponse = await getCoachResponse(
        userMessage,
        systemPrompt,
        session.conversationHistory
      );

      // Score AI coach's effectiveness
      dqScores = await scoreCoachingQuality(
        coachResponse,
        userMessage,
        session.conversationHistory
      );

      // Update conversation history
      session.conversationHistory.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: coachResponse }
      );

      // Calculate minimum DQ score
      const dqDimensions = ['framing', 'alternatives', 'information', 'values', 'reasoning', 'commitment'];
      const dqValues = dqDimensions
        .map(dim => dqScores[dim])
        .filter(val => val !== null && val !== undefined && !isNaN(val));
      dqMinimum = dqValues.length > 0 ? Math.min(...dqValues) : 0;

      // Update DQ coverage
      Object.keys(dqScores).forEach(dimension => {
        if (dimension !== 'overall' && dimension !== 'rationale' && dqScores[dimension] >= 0.3) {
          session.dqCoverage[dimension] = true;
        }
      });

      response = {
        mode: 'coach',
        session_id: sessionId,
        user_id: userId,
        user_message: userMessage,
        coach_reply: coachResponse,
        dq_score: dqScores,
        dq_score_minimum: dqMinimum,
        turnsUsed: session.turnsUsed,
        dqCoverage: session.dqCoverage,
        conversationStatus: Object.values(session.dqCoverage).every(Boolean) ? 'dq-complete' : 'in-progress',
        timestamp: new Date().toISOString()
      };

    } else {
      // MODE 2: Student coaches AI persona
      const currentStage = session.personaStage || 'confused';
      console.log(`[Session ${sessionId}] Practice mode - Persona: ${persona}, Stage: ${currentStage}`);
      
      const systemPrompt = getStudentPersonaPrompt(persona, currentStage, curriculumContext);
      console.log(`[Session ${sessionId}] System prompt length: ${systemPrompt.length}`);
      
      // Get persona response (persona responds to student's coaching)
      let personaResponse;
      try {
        personaResponse = await getStudentPersonaResponse(
          userMessage,
          systemPrompt,
          session.conversationHistory
        );
        console.log(`[Session ${sessionId}] Persona response received: ${personaResponse.substring(0, 50)}...`);
        
        if (!personaResponse || personaResponse.trim().length === 0) {
          throw new Error('Persona response is empty');
        }
      } catch (error) {
        console.error(`[Session ${sessionId}] Error getting persona response:`, error);
        personaResponse = "I'm sorry, I'm having trouble processing that right now. Can you try rephrasing your question?";
      }

      // Score student's coaching quality
      dqScores = await scoreStudentCoachingQuality(
        userMessage,
        personaResponse,
        session.conversationHistory
      );

      // Calculate minimum DQ score
      const dqDimensions = ['framing', 'alternatives', 'information', 'values', 'reasoning', 'commitment'];
      const dqValues = dqDimensions
        .map(dim => dqScores[dim])
        .filter(val => val !== null && val !== undefined && !isNaN(val));
      dqMinimum = dqValues.length > 0 ? Math.min(...dqValues) : 0;

      // Update persona stage based on coaching quality (persona gets clearer as student coaches better)
      const newStage = getPersonaStage(dqMinimum);
      const stageProgress = dqMinimum; // 0.0 to 1.0
      
      // Smooth stage transitions (prevent rapid jumping)
      if (session.personaProgress !== null) {
        const smoothingFactor = 0.7;
        session.personaProgress = (smoothingFactor * stageProgress) + ((1 - smoothingFactor) * session.personaProgress);
      } else {
        session.personaProgress = stageProgress;
      }

      // Update stage if progress is significant
      const smoothedStage = getPersonaStage(session.personaProgress);
      if (smoothedStage !== session.personaStage) {
        console.log(`[Session ${sessionId}] Persona ${persona} progressing from ${session.personaStage} to ${smoothedStage} (DQ: ${dqMinimum.toFixed(2)})`);
        session.personaStage = smoothedStage;
      }

      // Update conversation history
      session.conversationHistory.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: personaResponse }
      );

      // Update DQ coverage
      Object.keys(dqScores).forEach(dimension => {
        if (dimension !== 'overall' && dimension !== 'rationale' && dqScores[dimension] >= 0.3) {
          session.dqCoverage[dimension] = true;
        }
      });

      response = {
        mode: 'practice',
        session_id: sessionId,
        user_id: userId,
        user_message: userMessage,
        persona_reply: personaResponse,
        persona: persona,
        persona_stage: session.personaStage,
        persona_progress: session.personaProgress,
        dq_score: dqScores,
        dq_score_minimum: dqMinimum,
        turnsUsed: session.turnsUsed,
        dqCoverage: session.dqCoverage,
        conversationStatus: Object.values(session.dqCoverage).every(Boolean) ? 'dq-complete' : 'in-progress',
        timestamp: new Date().toISOString()
      };
    }

    // Add session summary if DQ complete
    if (response.conversationStatus === 'dq-complete') {
      response.sessionSummary = {
        totalTurns: session.turnsUsed,
        dqAreasCompleted: Object.keys(session.dqCoverage).filter(k => session.dqCoverage[k]),
        feedback: mode === 'coach' 
          ? 'The advisor covered key areas of academic planning.'
          : 'You covered all key areas of Decision Quality in your coaching.'
      };
    }

    res.status(200).json(response);

  } catch (error) {
    console.error(`[Session ${sessionId}] Error:`, error);
    res.status(500).json({
      error: 'Failed to process message',
      message: error.message
    });
  }
});

module.exports = router;
