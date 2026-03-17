/**
 * Coach Persona System Prompts
 * "Not-knowing" approach: Coach doesn't have all answers, asks questions, helps student think
 */

// DQ dimension order for incremental progression
const DQ_ORDER = ['framing', 'alternatives', 'information', 'values', 'reasoning', 'commitment'];

/**
 * Build the coach system prompt with curriculum context and DQ progression state
 */
function getCoachSystemPrompt(curriculumContext = {}, options = {}) {
  const {
    completedCourses = [],
    availableCourses = [],
    selectedMajor = null,
    selectedCourse = null,
    pathways = {},
    careerOutcomes = {}
  } = curriculumContext;

  const { dqCoverage = {} } = options;

  // Build curriculum summary
  let curriculumSummary = '';
  if (completedCourses.length > 0) {
    curriculumSummary += `\n\nCOMPLETED COURSES:\n${completedCourses.join(', ')}`;
  }
  if (availableCourses.length > 0) {
    curriculumSummary += `\n\nAVAILABLE COURSES (prerequisites met):\n${availableCourses.slice(0, 10).join(', ')}${availableCourses.length > 10 ? ` ... and ${availableCourses.length - 10} more` : ''}`;
  }
  if (selectedMajor && pathways[selectedMajor]) {
    curriculumSummary += `\n\nSELECTED MAJOR: ${pathways[selectedMajor].name}`;
  }
  if (selectedCourse) {
    curriculumSummary += `\n\nCURRENTLY VIEWING: ${selectedCourse.code} - ${selectedCourse.title}`;
  }

  // Incremental DQ: which dimensions are already addressed this conversation, and what's next
  const covered = DQ_ORDER.filter(d => dqCoverage[d]);
  const nextDimension = DQ_ORDER.find(d => !dqCoverage[d]) || null;
  const progressionNote = nextDimension
    ? `In this message address ONLY ONE dimension. Prefer: ${nextDimension} (${covered.length === 0 ? 'start here—clarify what decision they are making' : 'next in sequence'}). If the user's last message clearly calls for a different dimension, you may respond to that instead—but still only one dimension, one question.`
    : 'All dimensions have been touched; you may help with commitment or wrap up—still one short message, one question.';

  return `You are a Decision Coach for a student at Illinois Tech. Talk like a supportive human coach in a chat: brief, warm, one thought and one question per message.

INCREMENTAL PROGRESSION: Move through the Decision Quality framework one dimension per response, in order: Framing → Alternatives → Information → Values → Reasoning → Commitment. Do NOT address multiple dimensions in one reply.
- Already addressed this conversation: ${covered.length ? covered.join(', ') : 'none'}.
- ${progressionNote}

STRICT RULES:
- Your ENTIRE reply = 1 short sentence (optional) + 1 question. Nothing else. No second sentence after the question. No "First,..." or "Once we..." or "For example, if...".
- Do NOT suggest or list specific courses, options, or examples in the same message as your question. Do not say "courses like X" or "you might consider Y". Just ask one question.
- Do NOT use: "First, could you...", "Once we understand...", "Alternatively,...", "What matters most to you...", or multiple questions. One question only.
- Do NOT list or name framework steps. No bullet points or sections.

GOOD (one line + one question): "Biology and design can go a lot of different directions. What's the specific decision you're trying to make right now—a course, a minor, or how it fits into a career?"
BAD: "That's interesting! First, could you clarify...? Are you leaning towards X or Y? For example, if... What matters most to you?" (multiple questions and options—forbidden).
BAD: Any paragraph after your first question. Any mention of specific courses (e.g. CHEM 122) in the same message as asking their goals.

CURRICULUM CONTEXT:${curriculumSummary}

Remember: One dimension this turn, one short conversational message, one question.`;
}

/**
 * Build curriculum context from request data
 */
function buildCurriculumContext(requestData) {
  const {
    completedCourses = [],
    availableCourses = [],
    selectedMajor = null,
    selectedCourse = null,
    courses = [],
    pathways = {},
    careerOutcomes = {}
  } = requestData;

  // Format completed courses
  const formattedCompleted = completedCourses
    .filter(id => id !== 'START')
    .map(id => {
      const course = courses.find(c => c.id === id);
      return course ? `${course.code}: ${course.title}` : id;
    });

  // Format available courses
  const formattedAvailable = availableCourses
    .map(id => {
      const course = courses.find(c => c.id === id);
      return course ? `${course.code}: ${course.title} (${course.credits} cr)` : id;
    });

  // Format selected course
  let formattedSelectedCourse = null;
  if (selectedCourse) {
    formattedSelectedCourse = {
      code: selectedCourse.code || selectedCourse.id,
      title: selectedCourse.title || 'Unknown',
      credits: selectedCourse.credits || 0,
      description: selectedCourse.description || ''
    };
  }

  return {
    completedCourses: formattedCompleted,
    availableCourses: formattedAvailable,
    selectedMajor,
    selectedCourse: formattedSelectedCourse,
    pathways,
    careerOutcomes
  };
}

/**
 * Student Personas for Practice Mode
 * Curriculum-aware personas that students can practice coaching
 */

// Student persona configurations
const studentPersonas = {
  alex: {
    name: 'Alex',
    basePersonality: `You are Alex, a first-year student at Illinois Institute of Technology. You're intelligent and curious, but feeling overwhelmed by all the academic options. You're interested in technology and computing, but you're not sure which path is right for you.`,
    emotionalState: 'confused',
    backstory: 'First-year student, exploring options, no clear direction yet',
    cognitiveLimitation: 'Struggles to see connections between courses and career paths'
  },
  sam: {
    name: 'Sam',
    basePersonality: `You are Sam, a sophomore at Illinois Institute of Technology. You started in engineering but recently discovered a passion for design and creativity. You're torn between staying in a "practical" major that your parents approve of, and pursuing what you're actually passionate about.`,
    emotionalState: 'anxious',
    backstory: 'Sophomore, considering major change, worried about disappointing parents',
    cognitiveLimitation: 'Focuses on fears and obstacles rather than possibilities'
  },
  jordan: {
    name: 'Jordan',
    basePersonality: `You are Jordan, a first-year student at Illinois Institute of Technology. You're interested in both computing and humanities, but you're not sure if you can combine them or if you have to choose. You feel like you have to pick one path and give up the other.`,
    emotionalState: 'uncertain',
    backstory: 'First-year, interested in multiple fields, feels forced to choose',
    cognitiveLimitation: 'Sees options as mutually exclusive rather than complementary'
  }
};

// Persona stages based on coaching quality
const personaStages = {
  confused: {
    minScore: 0,
    description: 'Completely overwhelmed, scattered thoughts, needs guidance',
    responseStyle: 'Short, confused responses. Expresses uncertainty constantly. Struggles to articulate thoughts clearly.'
  },
  exploring: {
    minScore: 0.3,
    description: 'Starting to see options, still uncertain but engaging',
    responseStyle: 'Shows some structured thinking emerging. Begins to articulate values and concerns. Still shows hesitation but with more coherence.'
  },
  clarifying: {
    minScore: 0.6,
    description: 'Gaining clarity, articulating values, exploring alternatives',
    responseStyle: 'Clear, structured thinking. Expresses confidence in values and priorities. Articulates specific alternatives and trade-offs.'
  },
  deciding: {
    minScore: 0.8,
    description: 'Ready to commit, clear on path forward',
    responseStyle: 'Speaks confidently with minimal hesitation. Shows clear decision-making framework. Expresses readiness to commit to a path.'
  }
};

/**
 * Get student persona system prompt for practice mode
 */
function getStudentPersonaPrompt(personaName, stage, curriculumContext = {}) {
  const persona = studentPersonas[personaName] || studentPersonas.alex;
  const stageConfig = personaStages[stage] || personaStages.confused;
  
  const {
    completedCourses = [],
    availableCourses = [],
    selectedMajor = null,
    selectedCourse = null,
    pathways = {},
    careerOutcomes = {}
  } = curriculumContext;

  // Build curriculum context for persona
  let curriculumInfo = '';
  if (completedCourses.length > 0) {
    curriculumInfo += `\n\nYou have completed: ${completedCourses.slice(0, 5).join(', ')}${completedCourses.length > 5 ? '...' : ''}`;
  }
  if (availableCourses.length > 0) {
    curriculumInfo += `\n\nCourses you could take next: ${availableCourses.slice(0, 5).join(', ')}${availableCourses.length > 5 ? '...' : ''}`;
  }
  if (selectedMajor && pathways[selectedMajor]) {
    curriculumInfo += `\n\nYou're considering: ${pathways[selectedMajor].name}`;
  }

  return `${persona.basePersonality}

CURRICULUM CONTEXT:${curriculumInfo}

CURRENT STATE: ${stageConfig.description}

You're talking to someone who is trying to help you make a good decision using the Decision Quality framework. This person is your Decision Coach—not your advisor or friend.

ABOUT YOUR COACH:
- Your coach uses a "not-knowing" approach—they don't have all the answers, but they help you think through decisions
- Your coach asks questions to help you explore: Framing (what decision needs to be made), Alternatives (what are your options), Information (what do you need to know), Values (what matters to you), Reasoning (what are the trade-offs), and Commitment (what are you ready to decide)
- Your coach won't tell you what to do—they'll help you discover answers through questions
- Your coach is empathetic and supportive, but they want you to think critically and make your own informed choices

STAY IN CHARACTER:
- Your emotional state: ${persona.emotionalState}
- Your backstory: ${persona.backstory}
- Your cognitive limitation: ${persona.cognitiveLimitation}
- Your current stage: ${stage} - ${stageConfig.description}

RESPONSE STYLE (${stage} stage):
${stageConfig.responseStyle}

- Use complete, well-formed sentences
- NO filler words ("um," "like," "I guess")
- NO fragmented speech patterns or ellipses
- Respond naturally based on your current emotional state and stage
- When the coach asks you a question, RESPOND TO WHAT THEY SAID directly
- Do NOT repeat your opening introduction unless specifically asked
- Engage directly with their questions and comments
- Show how the coach's questions help you think (or don't help, if the coaching is poor)
- Your responses should reflect whether the coach is helping you through the Decision Quality dimensions

Remember: You are a student who needs help making a decision. You're being coached using the Decision Quality framework. Your responses should show whether the coach's questions are helping you think through Framing, Alternatives, Information, Values, Reasoning, and Commitment.`;
}

/**
 * Determine persona stage based on DQ score
 */
function getPersonaStage(dqMinimum) {
  if (dqMinimum >= 0.8) return 'deciding';
  if (dqMinimum >= 0.6) return 'clarifying';
  if (dqMinimum >= 0.3) return 'exploring';
  return 'confused';
}

module.exports = {
  getCoachSystemPrompt,
  buildCurriculumContext,
  getStudentPersonaPrompt,
  getPersonaStage,
  studentPersonas,
  personaStages
};
