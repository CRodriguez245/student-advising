# Testing the Decision Coach Engine

## Quick Test Guide

### Step 1: Enable Decision Coach

1. Open `src/illinois-tech-full-catalog-skill-tree.jsx`
2. Find line 3 (near the top, after imports)
3. Change:
   ```javascript
   const USE_DECISION_COACH = false;
   ```
   To:
   ```javascript
   const USE_DECISION_COACH = true;
   ```
4. Save the file

The React dev server will automatically recompile and reload.

### Step 2: Open the Chat Interface

1. Look for the **🎯 Decision Coach** button in the bottom right of the skill tree
2. Click it to open the chat interface

### Step 3: Test Basic Functionality

Try asking questions like:
- "What should I take next?"
- "I'm interested in computer science, what courses should I consider?"
- "What's the difference between CS and AI majors?"
- "Help me decide between mechanical engineering and aerospace"

### Step 4: Check the Response

**What to look for:**
- ✅ Coach responds with helpful advice
- ✅ Response mentions specific courses (e.g., "CS-115", "MATH-151")
- ✅ Course recommendations appear highlighted on the skill tree
- ✅ Response is relevant to your question

**If it's working:**
- You'll see a thoughtful response from the Decision Coach
- Course codes mentioned in the response will be highlighted on the skill tree
- The conversation flows naturally

**If it's not working:**
- Check browser console (Cmd+Option+I → Console tab) for errors
- Look for error messages like "Failed to fetch" or "Network error"
- Verify backend URL is correct

## Testing Checklist

### ✅ Backend Connection Test

1. **Check if backend is accessible:**
   - Open browser console (Cmd+Option+I)
   - Look for network requests to `jamie-backend.onrender.com`
   - Check if requests return 200 status

2. **Test backend directly:**
   ```bash
   curl -X POST https://jamie-backend.onrender.com/chat \
     -H "Content-Type: application/json" \
     -d '{"message": "test", "session_id": "test", "user_id": "test", "character": "jamie"}'
   ```
   Should return JSON with `jamie_reply` field

### ✅ UI Test

1. **Chat button appears** - Bottom right, 🎯 icon
2. **Chat opens** - Clicking button opens chat panel
3. **Input works** - Can type messages
4. **Send works** - Clicking send or pressing Enter sends message
5. **Response appears** - Coach response shows in chat

### ✅ Functionality Test

1. **Context awareness:**
   - Ask about completed courses
   - Ask about selected major
   - Ask about available courses

2. **Course recommendations:**
   - Ask "What should I take next?"
   - Check if courses are highlighted on skill tree
   - Verify recommended courses match prerequisites

3. **Decision coaching:**
   - Ask for help making a decision
   - Check if response uses structured reasoning
   - Verify response is helpful and relevant

## Troubleshooting

### Issue: "Failed to fetch" or Network Error

**Possible causes:**
- Backend is down
- CORS issue
- Network connectivity

**Solutions:**
1. Check backend status: `https://jamie-backend.onrender.com/chat`
2. Check browser console for specific error
3. Try using production URL in `DecisionCoachAdapter.jsx`

### Issue: No Response / Timeout

**Possible causes:**
- Backend is slow
- Request is too large
- API key issue

**Solutions:**
1. Wait longer (backend may be slow on free tier)
2. Check backend logs if you have access
3. Try a simpler question

### Issue: Response but No Course Highlighting

**Possible causes:**
- Course codes not in correct format
- Course codes don't match catalog

**Solutions:**
1. Check if response mentions courses (e.g., "CS-115")
2. Verify course IDs match format in catalog
3. Check browser console for errors

### Issue: Chat Button Doesn't Appear

**Possible causes:**
- Feature flag not enabled
- Component not rendering
- CSS issue

**Solutions:**
1. Verify `USE_DECISION_COACH = true`
2. Check browser console for errors
3. Hard refresh (Cmd+Shift+R)

## Expected Behavior

### Working Decision Coach:
- ✅ Responds within 5-10 seconds
- ✅ Provides structured, helpful advice
- ✅ Mentions specific courses when relevant
- ✅ Highlights courses on skill tree
- ✅ Maintains conversation context

### Current Chatbot (CourseAdvisorChat):
- ✅ Responds quickly
- ✅ Provides course-specific advice
- ✅ Uses Anthropic API directly

## Comparison Test

To compare both:

1. **Test with `USE_DECISION_COACH = false`** (current chatbot)
   - Note response style
   - Note response time
   - Note features

2. **Test with `USE_DECISION_COACH = true`** (Decision Coach)
   - Compare response style
   - Compare response time
   - Compare features (DQ scoring, structured reasoning)

## Advanced Testing

### Test DQ Scoring (if visible)
- Decision Coach provides Decision Quality scores
- Check browser console for DQ score logs
- Scores should be between 0.0 and 1.0

### Test Session Management
- Have a multi-turn conversation
- Check if context is maintained
- Verify responses build on previous messages

### Test Course Recommendations
- Ask specific questions about courses
- Verify courses are highlighted correctly
- Check if prerequisites are considered

## Success Criteria

✅ **Decision Coach is working if:**
- Chat interface opens and works
- Responses are received from backend
- Responses are relevant and helpful
- Course recommendations appear on skill tree
- No errors in browser console

## Next Steps After Testing

Once you've confirmed it works:
1. Keep `USE_DECISION_COACH = true` to use it
2. Or set it back to `false` to use the original chatbot
3. Customize the adapter if needed
4. Consider building your own backend for more control
