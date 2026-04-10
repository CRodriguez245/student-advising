/**
 * DECISION COACH ADAPTER
 * 
 * Integrates the Decision Coach Engine (Jamie AI backend) with the Illinois Tech Skill Tree.
 * This adapter bridges the decision coach API with the course advisor UI.
 */

import React, { useState, useRef, useEffect } from 'react';

/** BUS 101, BUS-101, bus 101 → catalog ids */
function extractCatalogIdsFromRegexMessage(message, courses) {
  const re = /\b([A-Z]{2,4})\s*[-]?\s*(\d{3})\b/gi;
  const seen = new Set();
  const out = [];
  let m;
  while ((m = re.exec(message)) !== null) {
    const id = `${m[1].toUpperCase()}-${m[2]}`;
    if (seen.has(id)) continue;
    if (courses.some((c) => c.id === id)) {
      seen.add(id);
      out.push(id);
    }
  }
  return out;
}

/** Match exact catalog display codes in prose, e.g. "Intro to Business (BUS 101)" */
function extractCatalogIdsFromCodeLabels(message, courses) {
  const seen = new Set();
  const out = [];
  for (const c of courses) {
    if (!c.code || c.type === 'start') continue;
    const spaced = c.code.trim();
    const dashed = c.id;
    if (spaced.length < 5) continue;
    if (message.includes(spaced) || message.includes(dashed)) {
      if (!seen.has(c.id)) {
        seen.add(c.id);
        out.push(c.id);
      }
    }
  }
  return out;
}

/** Remove UI-style headers the model sometimes echoes (shown in chat bubble, not from our map code). */
function stripAdvisorMetaFromReply(content) {
  if (typeof content !== 'string') return content;
  const lines = content.split('\n');
  const out = [];
  for (const line of lines) {
    const trimmed = line.trim();
    const headerMatch = trimmed.match(/^(AI|Al)\s+Suggested\s*:\s*(.*)$/i);
    if (!headerMatch) {
      out.push(line);
      continue;
    }
    const after = (headerMatch[2] || '').trim();
    if (!after) continue;
    if (/^decision\s*coach\s*recommendation$/i.test(after)) continue;
    if (/\b[A-Z]{2,4}\s*[-]?\s*\d{3}\b/i.test(after)) out.push(after);
    else if (after.length > 48) out.push(after);
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd();
}

/** When the advisor omits codes, map user/reply language to a suggested pathway key */
function inferPathwayKeyFromConversation(userMessage, assistantMessage, pathways) {
  const t = `${userMessage || ''}\n${assistantMessage || ''}`.toLowerCase();
  const rules = [
    ['fin', /\b(business\s+major|business\s+student|business\s+degree|(i'?m|im)\s+a\s+business|i\s+am\s+a\s+business|finance\s+major|accounting\s+major|marketing\s+major)\b/i],
    ['cs', /\bcomputer\s+science\b|\bcs\s+major\b/i],
    ['ai', /\bartificial\s+intelligence\b|\bai\s+major\b/i],
    ['ds', /\bdata\s+science\b/i],
    ['ee', /\belectrical\s+engineering\b|\bee\s+major\b/i],
    ['cpe', /\bcomputer\s+engineering\b/i],
    ['me', /\bmechanical\s+engineering\b|\bme\s+major\b/i],
    ['ae', /\baerospace\b/i],
    ['ce', /\bcivil\s+engineering\b/i],
    ['che', /\bchemical\s+engineering\b/i],
    ['bme', /\bbiomedical\b/i],
    ['bio', /\bbiology\b|\bbio\s+major\b/i],
    ['chem', /\bchemistry\b/i],
    ['phys', /\bphysics\b/i],
    ['psych', /\bpsychology\b|\bpsych\s+major\b/i],
    ['gem', /\bgame\s+design\b/i],
    ['arch', /\barchitecture\b/i]
  ];
  for (const [key, re] of rules) {
    if (pathways[key] && re.test(t)) return key;
  }
  return null;
}

/** If the student names exactly one real course, return it (for opening the course detail panel). */
function pickSingleCatalogCourseFromMessage(message, courses) {
  let ids = extractCatalogIdsFromRegexMessage(message, courses);
  if (ids.length === 0) {
    ids = extractCatalogIdsFromCodeLabels(message, courses);
  }
  const real = [...new Set(ids)].filter((id) => {
    const c = courses.find((x) => x.id === id);
    return c && c.type !== 'start';
  });
  if (real.length !== 1) return null;
  return courses.find((c) => c.id === real[0]) || null;
}

function buildMapPathFromAdvisorReply({
  assistantMessage,
  userMessage,
  courses,
  pathways,
  selectedMajor,
  mode
}) {
  let ids = extractCatalogIdsFromRegexMessage(assistantMessage, courses);
  if (ids.length === 0) {
    ids = extractCatalogIdsFromCodeLabels(assistantMessage, courses);
  }
  if (ids.length >= 1) {
    return {
      courses: ['START', ...ids],
      color: '#00FF88'
    };
  }
  if (mode === 'coach' && selectedMajor && pathways[selectedMajor]?.courses?.length) {
    const p = pathways[selectedMajor];
    return {
      courses: [...p.courses],
      color: p.color || '#00FF88'
    };
  }
  let inferred =
    mode === 'coach' ? inferPathwayKeyFromConversation(userMessage, assistantMessage, pathways) : null;
  if (!inferred && mode === 'coach') {
    inferred = inferPathwayKeyFromConversation(userMessage, '', pathways);
  }
  if (inferred && pathways[inferred]?.courses?.length) {
    const p = pathways[inferred];
    return {
      courses: [...p.courses],
      color: p.color || '#00FF88'
    };
  }
  return null;
}

/**
 * Adapter component that bridges your decision coach engine
 * with the Illinois Tech Skill Tree UI
 * 
 * @param {Object} props - Same props as CourseAdvisorChat
 * @param {Set<string>} props.completedCourses - Set of completed course IDs
 * @param {string|null} props.selectedMajor - Currently selected major key
 * @param {Object|null} props.selectedCourse - Currently selected course object
 * @param {Array} props.courses - Full course catalog array
 * @param {Object} props.pathways - Major pathway definitions
 * @param {Object} props.careerOutcomes - Career outcome data
 * @param {Function} props.onSuggestPath - Callback to highlight a course path
 * @param {Function} props.onClearPaths - Callback to clear path highlights
 * @param {Function} [props.onOpenChange] - Callback when panel open state changes (e.g. (open: boolean) => {})
 * @param {Function} [props.onFocusCourse] - When the user asks about exactly one catalog course, called with that course object (open detail panel + map focus)
 */
const DecisionCoachAdapter = ({
  completedCourses,
  selectedMajor,
  selectedCourse,
  courses,
  pathways,
  careerOutcomes,
  onSuggestPath,
  onClearPaths,
  onOpenChange,
  onFocusCourse
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const openDelayRef = useRef(null);

  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  useEffect(() => {
    return () => {
      if (openDelayRef.current) clearTimeout(openDelayRef.current);
    };
  }, []);

  const handleOpenCoach = () => {
    onOpenChange?.(true);
    openDelayRef.current = setTimeout(() => {
      openDelayRef.current = null;
      setIsOpen(true);
    }, 300);
  };

  const [mode, setMode] = useState('coach'); // 'coach' or 'practice'
  const [persona, setPersona] = useState('alex'); // 'alex', 'sam', 'jordan'
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `illinois-tech-${Date.now()}`);
  const [personaStage, setPersonaStage] = useState(null);
  const [personaProgress, setPersonaProgress] = useState(null);
  const [dqCoverage, setDqCoverage] = useState({}); // For stateless API (e.g. Vercel): send with each request
  const messagesEndRef = useRef(null);
  
  // Initialize messages based on mode
  useEffect(() => {
    if (messages.length === 0) {
      if (mode === 'coach') {
        setMessages([{
          role: 'assistant',
          content: "I'm your IIT Class Advisor. If you share your term, major, credits completed, and one priority, I'll suggest a lean plan and what to confirm in your degree audit or the official catalog."
        }]);
      } else {
        const personaNames = { alex: 'Alex', sam: 'Sam', jordan: 'Jordan' };
        setMessages([{
          role: 'assistant',
          content: `Hi, I'm ${personaNames[persona]}. I'm a student at Illinois Tech and I'm feeling really confused about my academic path. Can you help me think through this?`
        }]);
      }
      setDqCoverage({});
    }
  }, [mode, persona]);
  
  // Configuration - Illinois Tech Decision Coach Backend
  // Production (e.g. Vercel): use same-origin /api/chat so the serverless function handles the request
  const BACKEND_URL = process.env.REACT_APP_DECISION_COACH_URL ||
    (typeof window !== 'undefined' && (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')
      ? `${window.location.origin}/api/chat`
      : (process.env.REACT_APP_BACKEND_URL || 'http://localhost:3002/chat'));
  const isStatelessApi = typeof window !== 'undefined' && (BACKEND_URL.includes('/api/chat') || BACKEND_URL.startsWith(window.location.origin));
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  /**
   * Build curriculum data for the decision coach backend
   * Sends structured data that the backend can use to build context-aware prompts
   */
  const buildCurriculumData = () => {
    // Find available courses (prerequisites met but not completed)
    const availableCourseIds = courses
      .filter(course => {
        if (completedCourses.has(course.id)) return false;
        return course.prerequisites.every(p => completedCourses.has(p) || p === 'START');
      })
      .map(c => c.id);

    return {
      completedCourses: Array.from(completedCourses).filter(id => id !== 'START'),
      availableCourses: availableCourseIds,
      selectedMajor: selectedMajor,
      selectedCourse: selectedCourse ? {
        id: selectedCourse.id,
        code: selectedCourse.code,
        title: selectedCourse.title,
        credits: selectedCourse.credits,
        description: selectedCourse.description,
        prerequisites: selectedCourse.prerequisites,
        department: selectedCourse.department,
        college: selectedCourse.college
      } : null,
      courses: courses, // Full course catalog
      pathways: pathways, // Major pathways
      careerOutcomes: careerOutcomes // Career outcome data
    };
  };
  
  /**
   * Handle sending a message to the decision coach engine
   */
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    
    try {
      // Build curriculum data for backend
      const curriculumData = buildCurriculumData();
      
      // For practice mode, check if this is the first user message
      // If so, we need to include the initial persona message in the conversation
      let shouldIncludeInitialPersonaMessage = false;
      if (mode === 'practice') {
        // Check if we have exactly 1 assistant message (the initial persona message)
        const assistantMessages = messages.filter(m => m.role === 'assistant');
        if (assistantMessages.length === 1 && messages.length === 1) {
          shouldIncludeInitialPersonaMessage = true;
        }
      }
      
      // Prepare request body for Decision Coach API
      const requestBody = {
        message: userMessage,
        session_id: sessionId,
        user_id: 'illinois-tech-student',
        mode: mode, // 'coach' or 'practice'
        persona: mode === 'practice' ? persona : undefined, // Only send in practice mode
        curriculum_data: curriculumData,
        reset: false,
        // Include initial persona message if this is the first user message in practice mode
        ...(shouldIncludeInitialPersonaMessage && {
          initial_persona_message: messages.find(m => m.role === 'assistant')?.content
        }),
        // Stateless API (Vercel /api/chat): send conversation history and DQ coverage so backend doesn't need session storage
        ...(isStatelessApi && {
          conversation_history: messages.map(m => ({ role: m.role, content: m.content })),
          dq_coverage: dqCoverage
        })
      };
      
      console.log('[Decision Coach] Sending request to:', BACKEND_URL);
      
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Decision Coach API Error:', errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('[Decision Coach] Response:', data);
      
      // Extract the reply based on mode (parse map from raw; show cleaned text in UI)
      const rawAssistant =
        mode === 'coach'
          ? (data.coach_reply || data.reply || "I'm sorry, I couldn't process that request.")
          : (data.persona_reply || data.reply || "I'm sorry, I couldn't process that request.");
      const assistantMessage =
        mode === 'coach' ? stripAdvisorMetaFromReply(rawAssistant) : rawAssistant;
      
      // Update persona stage/progress for practice mode
      if (mode === 'practice' && data.persona_stage) {
        setPersonaStage(data.persona_stage);
        setPersonaProgress(data.persona_progress);
      }
      
      // Map highlight + zoom: explicit codes in reply, else catalog labels, else UI pathway, else infer from text (e.g. "business major")
      const mapPath = buildMapPathFromAdvisorReply({
        assistantMessage: rawAssistant,
        userMessage,
        courses,
        pathways,
        selectedMajor,
        mode
      });
      if (mapPath && onSuggestPath) {
        onSuggestPath(mapPath);
      }

      const singleCourseFocus = pickSingleCatalogCourseFromMessage(userMessage, courses);
      if (singleCourseFocus && onFocusCourse) {
        onFocusCourse(singleCourseFocus);
      }
      
      // Add DQ score info to message if available
      const messageWithMetadata = {
        role: 'assistant',
        content: assistantMessage.trim()
          ? assistantMessage
          : 'See the highlighted path on the skill tree. Ask a follow-up if you want more detail.',
        ...(data.dq_score && { 
          dqScore: data.dq_score,
          dqScoreMinimum: data.dq_score_minimum 
        })
      };
      
      setMessages(prev => [...prev, messageWithMetadata]);
      if (data.dqCoverage && isStatelessApi) setDqCoverage(data.dqCoverage);

      // Log DQ scores for debugging
      if (data.dq_score) {
        console.log(`[Decision Coach] ${mode === 'coach' ? 'Coach' : 'Student'} DQ Score:`, {
          minimum: data.dq_score_minimum,
          components: data.dq_score,
          turnsUsed: data.turnsUsed,
          ...(mode === 'practice' && {
            personaStage: data.persona_stage,
            personaProgress: data.persona_progress
          })
        });
      }
      
    } catch (error) {
      console.error('Decision coach error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        backendUrl: BACKEND_URL
      });
      
      // More detailed error message
      let errorMessage = "I'm having trouble connecting to the Class Advisor right now.";
      if (isStatelessApi) {
        errorMessage += "\n\nIf this is your deployed site, add OPENAI_API_KEY in Vercel → Project Settings → Environment Variables, then redeploy.";
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage += "\n\nStart the backend in a separate terminal:\n  npm run backend\n\nOr from the backend folder:\n  cd backend && npm install && npm start\n\nThen test: curl http://localhost:3002/health";
      } else if (error.message.includes('CORS')) {
        errorMessage += "\n\nCORS error detected. The backend allows localhost; check that the backend is running (npm run backend).";
      } else {
        errorMessage += `\n\nError: ${error.message}`;
      }
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: errorMessage
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  // Collapsed button - bottom right, right-aligned
  if (!isOpen) {
    return (
      <button
        onClick={handleOpenCoach}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-[#2C73EB] border-none cursor-pointer shadow-[0_4px_20px_rgba(44,115,235,0.4)] flex items-center justify-center overflow-hidden z-[100] transition-transform hover:scale-110"
      >
        <img src={`${process.env.PUBLIC_URL || ''}/images/decision-coach-avatar.png`} alt="Class Advisor" className="w-full h-full object-cover" />
      </button>
    );
  }
  
  // Chat UI - bottom right, layout per reference image
  return (
    <div className="fixed bottom-6 right-6 w-[357px] h-[455px] backdrop-blur-[10px] bg-white/50 border border-black/20 rounded-[5px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden z-[100]">
      {/* Header: title + short hairline */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex justify-between items-center">
          <h3 className="text-black font-bold text-lg leading-tight m-0">Class Advisor</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="bg-transparent border-none text-gray-400 hover:text-black text-xl cursor-pointer p-0 leading-none"
          >
            ×
          </button>
        </div>
        <div className="mt-3 w-[99%] border-b border-gray-200/80" />
      </div>

      {/* Messages - coach: avatar left + bubble with left tail; user: bubble with right tail */}
      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-5">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <>
                <div className="w-12 h-12 rounded-full bg-[#2C73EB] flex-shrink-0 overflow-hidden flex items-center justify-center">
                  <img src={`${process.env.PUBLIC_URL || ''}/images/decision-coach-avatar.png`} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="ml-2 flex items-start">
                  <div className="px-4 py-3 rounded-[5px] bg-[#e0e0e0] text-black text-xs whitespace-pre-wrap max-w-[80%] leading-[1.35]">
                    {msg.content}
                  </div>
                </div>
              </>
            )}
            {msg.role === 'user' && (
              <div className="flex items-start justify-end max-w-[65%]">
                <div className="px-4 py-3 rounded-[5px] bg-[#e8f1f8] text-black text-xs leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="w-12 h-12 flex-shrink-0" />
            <div className="ml-2 px-4 py-3 rounded-[5px] bg-[#e0e0e0] text-gray-500 text-xs">
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-1">
        <div className="w-[99%] border-b border-gray-200/80 mb-1.5" />
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask your advisor..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-black placeholder:text-gray-400 min-w-0"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-transparent border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-[#2C73EB] hover:text-[#2563c7]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DecisionCoachAdapter;
