# How to Start the Backend

## Quick Start

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Verify Setup
```bash
# Check .env file exists
ls -la .env

# Check dependencies installed
ls -la node_modules
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
In a new terminal:
```bash
# Health check
curl http://localhost:3002/health

# Test chat
curl -X POST http://localhost:3002/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What should I take next?",
    "curriculum_data": {
      "completedCourses": [],
      "courses": []
    }
  }'
```

## Troubleshooting

### "Cannot find module"
```bash
npm install
```

### "OPENAI_API_KEY is not defined"
- Check `.env` file exists in `backend/` directory
- Verify it contains: `OPENAI_API_KEY=sk-proj-...`
- Restart server after creating/updating `.env`

### "Port 3002 already in use"
- Change `PORT` in `.env` to a different port (e.g., `3003`)
- Or stop whatever is using port 3002

### Server starts but doesn't respond
- Check console for error messages
- Verify OpenAI API key is valid
- Check network connectivity

## Running in Background

To run in background (so you can use terminal for other things):
```bash
npm start &
```

Or use a process manager like `pm2`:
```bash
npm install -g pm2
pm2 start src/index.js --name decision-coach
pm2 logs decision-coach
```
