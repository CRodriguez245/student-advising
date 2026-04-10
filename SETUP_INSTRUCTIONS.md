# Setup Instructions - Run Locally

## Step 1: Install Dependencies

Open your terminal in this directory and run:

```bash
cd /Users/carlosrodriguez/Documents/DocumentsBackUp/CursorAI\ Workspace/Advisor-DecisionCoach
npm install
```

This will install:
- React 18
- React DOM
- React Scripts (Create React App tooling)

**Expected time:** 2-5 minutes

## Step 2: Start the Development Server

```bash
npm start
```

This will:
- Start the React development server
- Open your browser to `http://localhost:3003`
- Enable hot-reload (changes update automatically)

**You should see:**
```
Compiled successfully!

You can now view illinois-tech-skill-tree in the browser.

  Local:            http://localhost:3003
  On Your Network:  http://192.168.x.x:3003
```

## Step 3: View the App

The app should automatically open in your browser. If not, navigate to:
```
http://localhost:3003
```

## Troubleshooting

### "npm: command not found"
You need to install Node.js first:
1. Go to https://nodejs.org/
2. Download and install the LTS version
3. Restart your terminal
4. Try `npm install` again

### "Port 3003 already in use"
Use a different port:
```bash
PORT=3004 npx react-scripts start
```

### "Module not found" errors
Delete node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Permission errors
If you see permission errors, try:
```bash
sudo npm install
```
(Only if necessary - usually not needed)

## What I Created

I've set up the following files for you:

1. **package.json** - Dependencies and scripts
2. **public/index.html** - HTML template
3. **src/index.js** - React entry point that renders your component
4. **.gitignore** - Ignores node_modules and build files
5. **README.md** - Project documentation

## Next Steps After Running

Once the app is running:

1. **Test the basic functionality** - Click around, explore courses
2. **Try the Decision Coach** - Add the feature flag to test it
3. **Customize** - Modify colors, add features, etc.

## Using Decision Coach

To enable the Decision Coach:

1. Open `illinois-tech-full-catalog-skill-tree.jsx`
2. Find where `CourseAdvisorChat` is used (around line 3498)
3. Add this near the top (after imports):
   ```javascript
   import DecisionCoachAdapter from './src/components/DecisionCoachAdapter';
   const USE_DECISION_COACH = true; // Add this flag
   ```
4. Replace the `CourseAdvisorChat` component with the conditional:
   ```javascript
   {USE_DECISION_COACH ? (
     <DecisionCoachAdapter {...props} />
   ) : (
     <CourseAdvisorChat {...props} />
   )}
   ```

The Decision Coach backend is already running at:
- `https://jamie-backend.onrender.com/chat` (production)

## Stopping the Server

Press `Ctrl+C` in the terminal to stop the development server.
