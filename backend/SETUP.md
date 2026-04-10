# Backend Setup Instructions

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Set Up Environment Variables
Create a `.env` file in the `backend/` directory:

```bash
# Copy the example
cp .env.example .env

# Or create manually:
touch .env
```

Add your OpenAI API key:
```
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o
PORT=3002
NODE_ENV=development
```

### 3. Start the Server
```bash
npm start
```

You should see:
```
🚀 Illinois Tech Decision Coach backend running on http://localhost:3002
📡 Health check: http://localhost:3002/health
```

### 4. Test It
```bash
# Test health endpoint
curl http://localhost:3002/health

# Test chat endpoint
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

## Development Mode

For auto-reload during development:
```bash
npm run dev
```

## Next Steps

1. ✅ Backend is running on port 3002
2. ✅ Update frontend to use `http://localhost:3002/chat`
3. ✅ Test the Decision Coach in your frontend
4. ✅ Deploy to production when ready

## Troubleshooting

### "OPENAI_API_KEY is not defined"
- Make sure `.env` file exists in `backend/` directory
- Check that `OPENAI_API_KEY` is set in `.env`
- Restart the server after creating/updating `.env`

### "Port 3002 already in use"
- Change `PORT` in `.env` to a different port (e.g., `3010`; avoid `3003`, which this repo uses for the React app)
- Or stop whatever is using port 3002

### "Cannot find module"
- Run `npm install` in the `backend/` directory
- Make sure you're in the correct directory
