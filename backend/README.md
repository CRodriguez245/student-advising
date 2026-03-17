# Illinois Tech Decision Coach Backend

Decision Coach backend for the Illinois Tech Academic Skill Tree platform. Implements a "not-knowing" coach persona that helps students make informed academic decisions through the Decision Quality framework.

## Features

- 🤖 **Coach Persona**: "Not-knowing" approach - asks questions, helps students think
- 📊 **Decision Quality Scoring**: Measures coaching effectiveness across 6 dimensions
- 🎓 **Curriculum-Aware**: References specific courses, majors, and prerequisites
- 💬 **Session Management**: Maintains conversation context
- 🔄 **Real-time Integration**: Works with curriculum visualization

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Copy `.env.example` to `.env` and add your OpenAI API key:
```bash
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

### 3. Start Server
```bash
npm start
# Or for development with auto-reload:
npm run dev
```

Server runs on `http://localhost:3002`

## API Endpoints

### POST /chat
Main endpoint for Decision Coach conversations.

**Request:**
```json
{
  "message": "What should I take next?",
  "session_id": "optional-session-id",
  "user_id": "optional-user-id",
  "curriculum_data": {
    "completedCourses": ["CS-100", "MATH-151"],
    "availableCourses": ["CS-115", "CS-116"],
    "selectedMajor": "cs",
    "selectedCourse": { "code": "CS-115", "title": "..." },
    "courses": [...],
    "pathways": {...},
    "careerOutcomes": {...}
  },
  "reset": false
}
```

**Response:**
```json
{
  "session_id": "session-123",
  "user_id": "user-123",
  "user_message": "What should I take next?",
  "coach_reply": "That's a great question! What matters most to you...",
  "dq_score": {
    "framing": 0.8,
    "alternatives": 0.7,
    "information": 0.9,
    "values": 0.6,
    "reasoning": 0.8,
    "commitment": 0.7,
    "overall": 0.75,
    "rationale": "..."
  },
  "dq_score_minimum": 0.6,
  "turnsUsed": 3,
  "dqCoverage": {
    "framing": true,
    "alternatives": true,
    "information": true,
    "values": false,
    "reasoning": true,
    "commitment": false
  },
  "conversationStatus": "in-progress",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "illinois-tech-decision-coach"
}
```

## Decision Quality Framework

The coach helps students through 6 dimensions:

1. **Framing**: Clarifying what decision needs to be made
2. **Alternatives**: Exploring different options
3. **Information**: Gathering relevant information
4. **Values**: Understanding what matters to the student
5. **Reasoning**: Thinking through trade-offs
6. **Commitment**: Moving toward a decision

## "Not-Knowing" Approach

The coach persona:
- ✅ Asks thoughtful questions
- ✅ Helps students think critically
- ✅ References curriculum when relevant
- ✅ Doesn't give direct answers
- ✅ Builds decision-making skills

## Development

### Project Structure
```
backend/
├── src/
│   ├── index.js          # Express server setup
│   ├── routes/
│   │   └── chat.js       # Chat endpoint
│   └── utils/
│       ├── openai.js      # OpenAI integration
│       └── prompts.js    # Coach prompts
├── package.json
└── README.md
```

### Environment Variables
- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `OPENAI_MODEL`: Model to use (default: "gpt-4o")
- `PORT`: Server port (default: 3002)
- `NODE_ENV`: Environment (development/production)

## Deployment

### Render.com
1. Connect GitHub repository
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables in dashboard

### Other Platforms
Standard Node.js deployment. Ensure:
- Node.js 18+ installed
- Environment variables set
- Port configured (or use platform's PORT)

## Testing

Test the health endpoint:
```bash
curl http://localhost:3002/health
```

Test the chat endpoint:
```bash
curl -X POST http://localhost:3002/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What should I take next?",
    "curriculum_data": {
      "completedCourses": ["CS-100"],
      "courses": []
    }
  }'
```

## License

ISC
