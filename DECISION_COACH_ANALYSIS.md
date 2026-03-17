# Decision Coach Engine Analysis & Integration

## Repository Analysis

I've analyzed your Decision Coach Engine from the DC-backup repository. Here's what I found:

### Architecture Overview

**Backend (jamie-backend/):**
- Express.js server running on port 3001
- Main endpoint: `POST /chat`
- Uses OpenAI API for generating coaching responses
- Implements Decision Quality (DQ) scoring across 6 dimensions
- Persona-based coaching system (jamie, kavya, daniel, sarah, andres)
- Session state management with turn limits

**Frontend (jamie-ai-frontend/):**
- React application
- Connects to backend via fetch API
- Displays DQ scores and coaching conversations

### API Interface

**Endpoint:** `POST /chat`

**Request Body:**
```json
{
  "message": "user's question/message",
  "session_id": "unique-session-id",
  "user_id": "user-identifier",
  "character": "jamie" | "kavya" | "daniel" | "sarah" | "andres",
  "reset": false  // Set to true to reset session
}
```

**Response:**
```json
{
  "jamie_reply": "coach's response text",
  "dq_score": {
    "framing": 0.0-1.0,
    "alternatives": 0.0-1.0,
    "information": 0.0-1.0,
    "values": 0.0-1.0,
    "reasoning": 0.0-1.0,
    "commitment": 0.0-1.0,
    "overall": 0.0-1.0,
    "rationale": "explanation"
  },
  "dq_score_minimum": 0.0-1.0,
  "turnsUsed": 5,
  "turnsRemaining": 15,
  "dqCoverage": {
    "framing": true,
    "alternatives": false,
    // ... etc
  },
  "conversationStatus": "in-progress" | "dq-complete" | "turn-limit-reached",
  "sessionSummary": { ... },
  "persona_stage": "stage-key",
  "persona": "jamie",
  "timestamp": "ISO string"
}
```

### Backend URLs

- **Development:** `http://localhost:3001/chat`
- **Production:** `https://jamie-backend.onrender.com/chat`

The adapter automatically detects the environment and uses the appropriate URL.

## Integration Complete

I've created `src/components/DecisionCoachAdapter.jsx` which:

1. ✅ **Matches the CourseAdvisorChat interface** - Same props, same UI structure
2. ✅ **Calls the Decision Coach API** - Sends requests to your backend
3. ✅ **Builds academic context** - Includes completed courses, available courses, major info, career outcomes
4. ✅ **Extracts course recommendations** - Parses course codes from responses and highlights paths
5. ✅ **Handles errors gracefully** - Falls back with helpful error messages
6. ✅ **Maintains session state** - Uses consistent session IDs

## How to Use

### Step 1: Set Up Backend (if not already running)

If you want to run the backend locally:

```bash
cd DC-backup/jamie-backend
npm install
# Set up .env with OPENAI_API_KEY
npm start
```

Or use the production backend at `https://jamie-backend.onrender.com/chat`

### Step 2: Add Feature Flag to Main Component

In `illinois-tech-full-catalog-skill-tree.jsx`, add near the top (after imports):

```javascript
// Feature flag for decision coach engine
const USE_DECISION_COACH = false; // Set to true when ready to test
```

### Step 3: Import and Use the Adapter

Find where `CourseAdvisorChat` is used (around line 3498) and replace with:

```javascript
{/* AI Course Advisor Chatbot */}
{USE_DECISION_COACH ? (
  <DecisionCoachAdapter
    completedCourses={completedCourses}
    selectedMajor={selectedMajor}
    selectedCourse={selectedCourse}
    courses={COURSES}
    pathways={MAJOR_PATHWAYS}
    careerOutcomes={CAREER_OUTCOMES}
    onSuggestPath={setChatSuggestedPath}
    onClearPaths={clearAllPaths}
  />
) : (
  <CourseAdvisorChat
    completedCourses={completedCourses}
    selectedMajor={selectedMajor}
    selectedCourse={selectedCourse}
    courses={COURSES}
    pathways={MAJOR_PATHWAYS}
    careerOutcomes={CAREER_OUTCOMES}
    onSuggestPath={setChatSuggestedPath}
    onClearPaths={clearAllPaths}
  />
)}
```

Add the import at the top:

```javascript
import DecisionCoachAdapter from './src/components/DecisionCoachAdapter';
```

### Step 4: Test Incrementally

1. **Start with feature flag OFF** (`USE_DECISION_COACH = false`)
   - Verify existing functionality still works
   
2. **Test adapter** (`USE_DECISION_COACH = true`)
   - Make sure backend is running (local or production)
   - Test with various questions
   - Check that course recommendations are extracted correctly

3. **Once stable, remove old code**
   - Remove `CourseAdvisorChat` component
   - Remove feature flag
   - Clean up unused imports

## Configuration Options

### Custom Backend URL

Set environment variable:
```bash
REACT_APP_DECISION_COACH_URL=https://your-backend-url.com/chat
```

Or edit the `BACKEND_URL` constant in `DecisionCoachAdapter.jsx`

### Change Persona

Edit the `character` field in the request body (line ~150):
```javascript
character: 'jamie', // Change to 'kavya', 'daniel', 'sarah', or 'andres'
```

## Key Features

### Context Building
The adapter automatically builds rich context including:
- Student's completed courses and credits
- Available courses (prerequisites met)
- Selected major and course
- Career outcomes
- Major pathways

### Course Recommendation Extraction
The adapter automatically:
- Parses course codes from coach responses (e.g., "CS-115", "MATH-151")
- Validates codes against the course catalog
- Highlights recommended paths on the skill tree
- Calls `onSuggestPath` callback when recommendations found

### Error Handling
- Graceful fallback if backend is unavailable
- Helpful error messages
- Console logging for debugging

## Differences from Original Chatbot

| Feature | CourseAdvisorChat | DecisionCoachAdapter |
|---------|------------------|---------------------|
| API | Anthropic/Claude direct | Decision Coach backend |
| Scoring | None | DQ scoring (6 dimensions) |
| Personas | Single advisor | Multiple personas (jamie, kavya, etc.) |
| Session Management | Simple | Advanced with turn limits |
| Context | Course-focused | Decision-making focused |

## Next Steps

1. **Test the integration** with the feature flag
2. **Customize the context** if needed (edit `buildContextForEngine`)
3. **Adjust course extraction** logic if needed (edit regex pattern)
4. **Add DQ score display** if you want to show scores in the UI
5. **Remove old chatbot** once you're confident in the new one

## Troubleshooting

### Backend Not Responding
- Check that backend is running: `curl http://localhost:3001/chat`
- Verify OPENAI_API_KEY is set in backend .env
- Check browser console for CORS errors

### Course Recommendations Not Showing
- Check console logs for extracted course codes
- Verify course ID format matches (e.g., "CS-115" not "CS115")
- Test with a message that explicitly mentions course codes

### Session Issues
- Each browser session gets a unique session ID
- Set `reset: true` in request body to start fresh
- Session state is maintained in backend (in-memory, not persistent)

## Notes

- The Decision Coach is designed for general decision-making, not specifically academic planning
- The adapter adds academic context to make it relevant for course planning
- DQ scores are logged to console but not displayed in UI (can be added if needed)
- Session state is maintained per browser session (not persisted across refreshes)
