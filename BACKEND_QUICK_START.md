# Backend Quick Start Guide

## What I Just Built

I've created a **new Decision Coach backend** specifically for your Illinois Tech Skill Tree project. This is separate from the Jamie AI backend, so it won't affect that project.

## Project Structure

```
backend/
├── src/
│   ├── index.js              # Express server
│   ├── routes/
│   │   └── chat.js           # Chat endpoint
│   └── utils/
│       ├── openai.js         # OpenAI integration + DQ scoring
│       └── prompts.js        # Coach persona prompts
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Key Features

✅ **Coach Persona** - "Not-knowing" approach, asks questions, helps students think  
✅ **Decision Quality Scoring** - Measures coaching effectiveness  
✅ **Curriculum-Aware** - References courses, majors, prerequisites  
✅ **Session Management** - Maintains conversation context  
✅ **Clean Architecture** - Separate from Jamie AI backend  

## Setup Steps

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Create .env File
```bash
# In backend/ directory, create .env file:
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4o
PORT=3002
NODE_ENV=development
```

### Step 3: Start Backend
```bash
npm start
```

You should see:
```
🚀 Illinois Tech Decision Coach backend running on http://localhost:3002
```

### Step 4: Test Backend
```bash
# Test health
curl http://localhost:3002/health

# Test chat
curl -X POST http://localhost:3002/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'
```

## Frontend Integration

The `DecisionCoachAdapter` has been updated to:
- ✅ Use the new backend URL (`http://localhost:3002/chat`)
- ✅ Send curriculum data in the correct format
- ✅ Handle the new response format (`coach_reply` instead of `jamie_reply`)

## How It Works

### Request Flow:
1. Frontend sends user message + curriculum data
2. Backend builds coach system prompt with curriculum context
3. Backend calls OpenAI with "not-knowing" coach persona
4. Backend scores coaching quality (DQ framework)
5. Backend returns coach response + DQ scores

### Coach Persona:
- Asks questions instead of giving answers
- References specific courses/majors from curriculum
- Helps students think through decisions
- Uses Decision Quality framework

## What's Different from Jamie AI Backend

| Feature | Jamie AI Backend | New Backend |
|---------|-----------------|-------------|
| Persona Role | Student (being coached) | Coach (helping student) |
| DQ Scoring | Scores user's coaching | Scores coach's effectiveness |
| Context | Student situation | Curriculum data |
| Approach | "Not-knowing" student | "Not-knowing" coach |

## Next Steps

1. **Set up backend:**
   ```bash
   cd backend
   npm install
   # Create .env with OPENAI_API_KEY
   npm start
   ```

2. **Test in frontend:**
   - Make sure `USE_DECISION_COACH = true` in main component
   - Backend should be running on port 3002
   - Try asking questions in the Decision Coach chat

3. **Verify it works:**
   - Coach should ask questions, not give direct answers
   - Coach should reference courses/majors when relevant
   - DQ scores should appear in console logs

## Troubleshooting

### Backend won't start
- Check `.env` file exists and has `OPENAI_API_KEY`
- Check port 3002 is available
- Check `npm install` completed successfully

### Frontend can't connect
- Verify backend is running: `curl http://localhost:3002/health`
- Check browser console for CORS errors
- Verify backend URL in `DecisionCoachAdapter.jsx`

### Coach responses don't make sense
- Check curriculum data is being sent (browser console)
- Verify OpenAI API key is valid
- Check backend logs for errors

## Deployment

When ready to deploy:

1. **Deploy backend** to Render.com, Vercel, or similar
2. **Update frontend** `BACKEND_URL` to production URL
3. **Set environment variables** in deployment platform
4. **Test** production endpoint

## Files Created

- ✅ `backend/src/index.js` - Express server
- ✅ `backend/src/routes/chat.js` - Chat endpoint
- ✅ `backend/src/utils/openai.js` - OpenAI + DQ scoring
- ✅ `backend/src/utils/prompts.js` - Coach prompts
- ✅ `backend/package.json` - Dependencies
- ✅ `backend/README.md` - Full documentation
- ✅ Updated `src/components/DecisionCoachAdapter.jsx` - Uses new backend

Ready to test! 🚀
