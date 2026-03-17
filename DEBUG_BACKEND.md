# Debugging Decision Coach Backend Connection

## Issue
Getting error: "I'm having trouble connecting to the decision coach right now"

## Quick Test in Browser Console

Open browser console (Cmd+Option+I) and run this to test the backend:

```javascript
fetch('https://jamie-backend.onrender.com/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: "test message",
    session_id: "test-session",
    user_id: "test-user",
    character: "jamie"
  })
})
.then(response => {
  console.log('Status:', response.status);
  console.log('Headers:', response.headers);
  return response.json();
})
.then(data => {
  console.log('Success:', data);
})
.catch(error => {
  console.error('Error:', error);
});
```

## Common Issues & Solutions

### Issue 1: CORS Error
**Error message:** "Access to fetch at '...' has been blocked by CORS policy"

**Solution:** The backend needs to allow CORS from localhost. Check if backend has CORS enabled.

### Issue 2: Backend is Down
**Error message:** "Failed to fetch" or network error

**Solution:** 
- Check if backend is running: Visit `https://jamie-backend.onrender.com` in browser
- Render.com free tier may spin down after inactivity
- First request may take 30-60 seconds to wake up

### Issue 3: Timeout
**Error message:** Request times out

**Solution:**
- Backend on free tier may be slow
- Wait longer (up to 60 seconds for first request)
- Check Render.com dashboard for backend status

### Issue 4: Wrong URL
**Error message:** 404 Not Found

**Solution:**
- Verify URL is correct: `https://jamie-backend.onrender.com/chat`
- Check if backend endpoint changed

## Check Backend Status

1. **Visit backend directly:**
   ```
   https://jamie-backend.onrender.com
   ```
   Should show something (even if just an error page)

2. **Check Render.com dashboard:**
   - Go to https://dashboard.render.com
   - Check if `jamie-backend` service is running
   - Look for any error messages

3. **Check backend logs:**
   - In Render dashboard, check "Logs" tab
   - Look for errors or startup messages

## Alternative: Use Local Backend

If production backend is down, you can run backend locally:

```bash
cd DC-backup/jamie-backend
npm install
# Set OPENAI_API_KEY in .env file
npm start
```

Then the adapter will automatically use `http://localhost:3001/chat` when running locally.

## Check Adapter Configuration

Verify the backend URL in `src/components/DecisionCoachAdapter.jsx`:

```javascript
const BACKEND_URL = process.env.REACT_APP_DECISION_COACH_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3001/chat'
    : 'https://jamie-backend.onrender.com/chat');
```

This should automatically detect localhost and use local backend if available.

## Next Steps

1. **Test backend in browser console** (code above)
2. **Check browser console for specific error** (Cmd+Option+I → Console)
3. **Check Network tab** (Cmd+Option+I → Network) to see the actual request/response
4. **Try local backend** if production is down
