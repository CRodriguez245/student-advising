# Troubleshooting: "Safari can't connect to server"

## Problem
The development server isn't running. Here's how to fix it:

## Solution: Start the Server

### Step 1: Open Terminal
Open Terminal app on your Mac (Applications → Utilities → Terminal)

### Step 2: Navigate to Project
```bash
cd "/Users/carlosrodriguez/Documents/DocumentsBackUp/CursorAI Workspace/Advisor-DecisionCoach"
```

### Step 3: Install Dependencies (First Time Only)
```bash
npm install
```
Wait for this to complete (2-5 minutes). You should see:
```
added 1234 packages in 2m
```

### Step 4: Start the Server
```bash
npm start
```

### Step 5: Wait for Compilation
You should see:
```
Compiled successfully!

You can now view illinois-tech-skill-tree in the browser.

  Local:            http://localhost:3003
```

The browser should open automatically. If not, manually go to:
```
http://localhost:3003
```

## Common Issues

### Issue: "npm: command not found"
**Solution:** Install Node.js
1. Go to https://nodejs.org/
2. Download LTS version
3. Install it
4. Restart Terminal
5. Try again

### Issue: "Port 3003 already in use"
**Solution:** Use a different port
```bash
PORT=3004 npx react-scripts start
```
Then go to `http://localhost:3004`

### Issue: "Cannot find module 'react-scripts'"
**Solution:** Dependencies not installed
```bash
npm install
```

### Issue: "EACCES: permission denied"
**Solution:** Don't use sudo. Instead:
```bash
# Fix npm permissions (one time)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
npm install
```

### Issue: Server starts but page is blank
**Solution:** Check browser console (Cmd+Option+I) for errors

### Issue: "Module not found" errors
**Solution:** Clear cache and reinstall
```bash
rm -rf node_modules package-lock.json
npm install
npm start
```

## Verify Server is Running

After running `npm start`, you should see:
- ✅ Terminal shows "Compiled successfully!"
- ✅ Browser opens automatically
- ✅ URL is `http://localhost:3003`
- ✅ You see the skill tree visualization

## Stop the Server

Press `Ctrl+C` in the terminal to stop the server.

## Quick Checklist

- [ ] Node.js installed? (`node --version`)
- [ ] npm installed? (`npm --version`)
- [ ] In correct directory? (`pwd`)
- [ ] Dependencies installed? (`ls node_modules`)
- [ ] Server started? (`npm start`)
- [ ] Browser at `http://localhost:3003`?

## Still Having Issues?

1. Check Terminal output for error messages
2. Check browser console (Cmd+Option+I → Console tab)
3. Try a different port: `PORT=3004 npx react-scripts start`
4. Try a different browser (Chrome, Firefox)
