# How API Calls Work - Explained

## What "Making API Calls" Means

When I say "making API calls to the backend," I mean your Illinois Tech Skill Tree app sends **HTTP requests** over the internet to a **separate server** that runs the Decision Coach Engine. It's like your web browser talking to a website - they're separate programs communicating over the network.

## Architecture Overview

```
┌─────────────────────────────────────┐
│  Illinois Tech Skill Tree App        │
│  (Your current project)              │
│  - Runs in browser                   │
│  - Contains DecisionCoachAdapter.jsx │
└──────────────┬──────────────────────┘
               │
               │ HTTP Request (fetch)
               │ POST /chat
               │ { message: "..." }
               │
               ▼
┌─────────────────────────────────────┐
│  Decision Coach Backend Server      │
│  (jamie-backend)                    │
│  - Runs on Render.com or localhost  │
│  - Processes decision coaching       │
│  - Returns response                  │
└──────────────┬──────────────────────┘
               │
               │ HTTP Response
               │ { jamie_reply: "...", 
               │   dq_score: {...} }
               │
               ▼
┌─────────────────────────────────────┐
│  Illinois Tech Skill Tree App       │
│  (Receives response, displays it)  │
└─────────────────────────────────────┘
```

## The Actual Code

Here's what happens in `DecisionCoachAdapter.jsx`:

```javascript
// Line 153-160: This is the "API call"
const response = await fetch(BACKEND_URL, {
  method: 'POST',                    // HTTP method
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({             // Send data
    message: "What should I take next?",
    session_id: "session-123",
    character: "jamie"
  })
});

// Line 168: Get the response back
const data = await response.json();
// data contains: { jamie_reply: "...", dq_score: {...} }
```

## What This Means

### ✅ What It Does:
1. **Sends a request** - Your app sends a message to the backend server
2. **Backend processes it** - The Decision Coach Engine (running separately) processes the message
3. **Gets a response** - The backend sends back a coaching reply
4. **Displays it** - Your app shows the reply to the user

### ❌ What It Does NOT Do:
- **Does NOT import code** from DC-backup
- **Does NOT modify files** in DC-backup
- **Does NOT require DC-backup** to be in your project
- **Does NOT run the backend code** in your app

## Two Separate Things

### 1. Your Frontend App (Illinois Tech Skill Tree)
- Runs in the browser
- Contains the UI and adapter
- Makes requests to the backend

### 2. The Backend Server (Decision Coach Engine)
- Runs as a separate server process
- Can be on:
  - **Production**: `https://jamie-backend.onrender.com` (already running)
  - **Local**: `http://localhost:3001` (if you run it yourself)
- Processes requests and returns responses

## Why This Is Safe

1. **No Code Sharing**: Your app doesn't import or run backend code
2. **Network Communication Only**: Just HTTP requests/responses (like visiting a website)
3. **Backend Runs Separately**: The Decision Coach backend is independent
4. **Can't Modify Your Project**: The backend can only send responses, not modify your files

## Real-World Analogy

Think of it like ordering food:
- **Your app** = You (the customer)
- **API call** = Phone call to restaurant
- **Backend server** = Restaurant kitchen
- **Response** = Food delivered to you

The restaurant doesn't come into your house - you just call them and they deliver!

## What You Need

### Option 1: Use Production Backend (Easiest)
- Backend is already running at: `https://jamie-backend.onrender.com/chat`
- Your adapter already points to this
- **No setup needed** - just use it!

### Option 2: Run Backend Locally (For Development)
If you want to run the backend yourself:

```bash
# In DC-backup/jamie-backend folder
cd DC-backup/jamie-backend
npm install
# Set OPENAI_API_KEY in .env file
npm start
# Backend runs on http://localhost:3001
```

The adapter automatically detects localhost and uses it if available.

## Summary

**"Making API calls"** = Your app sends HTTP requests to a separate server, gets responses back. It's like your browser talking to a website - completely separate programs communicating over the network.

**No risk to your project** because:
- No code is shared
- No files are modified
- Just network communication (like visiting any website)
- Backend runs completely separately

The cloned `DC-backup` folder was only used to **understand** the API structure. The adapter doesn't need it - it just makes HTTP requests to the backend URL.
