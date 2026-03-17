# Decision Coach Engine Interface Specification

**Fill this out with details about your decision coach engine, then I can create a custom adapter for you.**

## Basic Information

### 1. File Location
- **Path on your machine**: `_________________`
- **GitHub repo** (if applicable): `_________________`
- **Main entry file**: `_________________`

### 2. Technology Stack
- [ ] React/JavaScript
- [ ] Node.js
- [ ] Python (needs porting?)
- [ ] Other: `_________________`

## Interface Details

### 3. How do you initialize the engine?
```javascript
// Example formats - choose closest or describe:

// Option A: Class-based
const engine = new DecisionCoachEngine(config);

// Option B: Function-based
const engine = createDecisionCoach(config);

// Option C: Module exports
import { processDecision } from './engine';
```

**Your format**: `_________________`

### 4. What configuration/options does it need?
```javascript
// Example:
{
  apiKey: "...",
  model: "...",
  // ... what else?
}
```

**Your configuration**: `_________________`

### 5. How do you call it to process a decision/question?
```javascript
// Example formats:

// Option A: Method call
const response = await engine.processDecision({
  message: "What should I take next?",
  context: {...}
});

// Option B: Function call
const response = await processDecision(message, context);

// Option C: Different format
```

**Your call format**: `_________________`

### 6. What does it return?
```javascript
// Example formats:

// Option A: Simple text
"Here's my recommendation: ..."

// Option B: Structured object
{
  text: "...",
  recommendations: [...],
  reasoning: "..."
}

// Option C: Different format
```

**Your return format**: `_________________`

### 7. What context/data does it need?
- [ ] Student's completed courses
- [ ] Available courses
- [ ] Course catalog
- [ ] Major pathways
- [ ] Career outcomes
- [ ] Conversation history
- [ ] Other: `_________________`

### 8. Does it use an external API?
- [ ] Anthropic/Claude API
- [ ] OpenAI API
- [ ] Custom API
- [ ] No API (local processing)
- [ ] Other: `_________________`

### 9. Key Features
What makes your decision coach engine special?
- [ ] Structured decision-making framework
- [ ] Multi-step reasoning
- [ ] Course recommendation logic
- [ ] Career path analysis
- [ ] Other: `_________________`

## Quick Copy-Paste Option

If you can share just the **main function/class definition** (even if it's 50-100 lines), that would be enough! Just copy:

1. The class/function that processes decisions
2. How it's initialized
3. What it returns

You can paste it here or in a new file.
