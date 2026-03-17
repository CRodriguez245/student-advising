/**
 * DECISION COACH ADAPTER - Template
 * 
 * This is a template showing how to integrate your decision coach engine
 * with the Illinois Tech Skill Tree project.
 * 
 * INSTRUCTIONS:
 * 1. Copy this file to DecisionCoachAdapter.jsx
 * 2. Import your decision coach engine
 * 3. Implement the adapter logic based on your engine's interface
 * 4. Test with feature flag before full integration
 */

import React, { useState, useRef, useEffect } from 'react';
// TODO: Import your decision coach engine here
// import { DecisionCoachEngine } from '../engines/decisionCoachEngine';

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
 */
const DecisionCoachAdapter = ({
  completedCourses,
  selectedMajor,
  selectedCourse,
  courses,
  pathways,
  careerOutcomes,
  onSuggestPath,
  onClearPaths
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: "Hi! I'm your Decision Coach 🎯 I help you make informed academic decisions through structured reasoning.\n\nWhat decision are you trying to make?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // TODO: Initialize your decision coach engine here
  // const [coachEngine] = useState(() => new DecisionCoachEngine({
  //   courses,
  //   pathways,
  //   careerOutcomes
  // }));
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  /**
   * Build context for the decision coach engine
   * Adapt this to match what your engine expects
   */
  const buildContextForEngine = () => {
    return {
      student: {
        completedCourses: Array.from(completedCourses),
        selectedMajor: selectedMajor,
        selectedCourse: selectedCourse?.id || null,
        completedCredits: Array.from(completedCourses)
          .map(id => courses.find(c => c.id === id))
          .filter(Boolean)
          .reduce((sum, c) => sum + c.credits, 0)
      },
      catalog: {
        courses: courses,
        pathways: pathways,
        careerOutcomes: careerOutcomes
      }
    };
  };
  
  /**
   * Handle sending a message
   * Adapt this to use your decision coach engine's API
   */
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    
    try {
      // TODO: Replace this with your decision coach engine call
      // Example:
      // const context = buildContextForEngine();
      // const response = await coachEngine.processDecision({
      //   message: userMessage,
      //   context: context,
      //   conversationHistory: messages.slice(-10)
      // });
      
      // For now, this is a placeholder that mimics the current behavior
      // Remove this once you integrate your engine
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are a decision coach helping students make academic decisions. Use structured reasoning.`,
          messages: messages.slice(-10).concat([{ role: 'user', content: userMessage }])
        })
      });
      
      const data = await response.json();
      const assistantMessage = data.content?.[0]?.text || "I'm sorry, I couldn't process that request.";
      
      // TODO: Extract any structured outputs from your engine
      // Example: If your engine returns course recommendations
      // if (response.recommendedCourses) {
      //   onSuggestPath({
      //     courses: ['START', ...response.recommendedCourses],
      //     name: 'Recommended Path',
      //     color: '#00FF88'
      //   });
      // }
      
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (error) {
      console.error('Decision coach error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm having trouble connecting right now. Please try again in a moment." 
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
  
  // Collapsed button (same as original)
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'absolute',
          bottom: 24,
          right: 100,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #00D4FF 0%, #8B5CF6 100%)',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0, 212, 255, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          zIndex: 100,
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.boxShadow = '0 6px 30px rgba(0, 212, 255, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 4px 20px rgba(0, 212, 255, 0.4)';
        }}
      >
        🎯
      </button>
    );
  }
  
  // Chat UI (same structure as original, customize as needed)
  return (
    <div style={{
      position: 'absolute',
      bottom: 24,
      right: 24,
      width: 380,
      height: 520,
      background: 'linear-gradient(135deg, #0d0d14 0%, #1a1a2e 100%)',
      border: '1px solid #333',
      borderRadius: 16,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxShadow: '0 8px 40px rgba(0, 0, 0, 0.5)',
      zIndex: 100
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        background: 'linear-gradient(90deg, #00D4FF20 0%, #8B5CF620 100%)',
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🎯</span> Decision Coach
          </div>
          <div style={{ color: '#888', fontSize: 11, marginTop: 2 }}>Structured decision-making support</div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            color: '#888',
            fontSize: 24,
            cursor: 'pointer',
            padding: 0,
            lineHeight: 1
          }}
        >
          ×
        </button>
      </div>
      
      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              padding: '10px 14px',
              borderRadius: 12,
              background: msg.role === 'user' 
                ? 'linear-gradient(135deg, #00D4FF 0%, #8B5CF6 100%)'
                : '#1a1a2e',
              color: '#fff',
              fontSize: 13,
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              border: msg.role === 'assistant' ? '1px solid #333' : 'none'
            }}
          >
            {msg.content}
          </div>
        ))}
        {isLoading && (
          <div style={{
            alignSelf: 'flex-start',
            padding: '10px 14px',
            borderRadius: 12,
            background: '#1a1a2e',
            color: '#888',
            fontSize: 13
          }}>
            Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid #333',
        background: '#0d0d14'
      }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about courses, majors, or career paths..."
          style={{
            width: '100%',
            minHeight: 60,
            padding: '10px 12px',
            background: '#1a1a2e',
            border: '1px solid #333',
            borderRadius: 8,
            color: '#fff',
            fontSize: 13,
            resize: 'none',
            fontFamily: 'inherit'
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          style={{
            marginTop: 8,
            width: '100%',
            padding: '10px',
            background: input.trim() && !isLoading
              ? 'linear-gradient(135deg, #00D4FF 0%, #8B5CF6 100%)'
              : '#333',
            border: 'none',
            borderRadius: 8,
            color: '#fff',
            fontSize: 13,
            fontWeight: 'bold',
            cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
            opacity: input.trim() && !isLoading ? 1 : 0.5
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default DecisionCoachAdapter;
