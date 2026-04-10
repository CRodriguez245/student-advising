# Illinois Tech Academic Skill Tree

Interactive course planning visualization with mandala-style skill tree layout.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm start
```

The app will open at `http://localhost:3003` (this repo pins the dev server to **3003** so it does not clash with other projects on 3000).

## Features

- 🎯 Interactive course skill tree visualization
- 🔍 Course search and filtering
- 📊 Progress tracking
- 🤖 AI Course Advisor (or Decision Coach)
- 🗺️ Mini-map navigation
- 📈 Major pathway visualization

## Using Decision Coach

To use the Decision Coach Engine instead of the default advisor:

1. Edit `illinois-tech-full-catalog-skill-tree.jsx`
2. Find the feature flag near the top (around line 30):
   ```javascript
   const USE_DECISION_COACH = false; // Change to true
   ```
3. Make sure the Decision Coach backend is running:
   - Production: `https://jamie-backend.onrender.com/chat` (already running)
   - Local: `http://localhost:3001/chat` (if running locally)

## Project Structure

```
Advisor-DecisionCoach/
├── illinois-tech-full-catalog-skill-tree.jsx  # Main component
├── src/
│   ├── index.js                              # React entry point
│   └── components/
│       └── DecisionCoachAdapter.jsx            # Decision Coach integration
├── public/
│   └── index.html                               # HTML template
└── package.json                                 # Dependencies
```

## Development

- **Port**: 3003 (set in `npm start` so it stays off 3000)
- **Hot Reload**: Enabled automatically
- **Build**: `npm run build` (creates production build in `/build`)

## Troubleshooting

### Port Already in Use
```bash
# Temporary override (macOS/Linux)
PORT=3004 npx react-scripts start
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Decision Coach Not Connecting
- Check that backend URL is correct in `DecisionCoachAdapter.jsx`
- Verify backend is running (check browser console for errors)
- Try production URL: `https://jamie-backend.onrender.com/chat`
