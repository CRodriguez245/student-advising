# Quick Start: Integrating Decision Coach Engine

## Step-by-Step Integration

### Step 1: Set Up Directory Structure
```bash
mkdir -p src/components src/engines src/utils
```

### Step 2: Copy Your Decision Coach Engine
Place your decision coach engine code in:
```
src/engines/decisionCoachEngine.js
```

### Step 3: Create the Adapter
1. Copy the example adapter:
   ```bash
   cp src/components/DecisionCoachAdapter.example.jsx src/components/DecisionCoachAdapter.jsx
   ```
2. Edit `DecisionCoachAdapter.jsx` and:
   - Import your decision coach engine
   - Replace the placeholder API calls with your engine's interface
   - Adapt the context building to match your engine's needs

### Step 4: Add Feature Flag to Main Component

In `illinois-tech-full-catalog-skill-tree.jsx`, add this near the top (after imports):

```javascript
// Feature flag for decision coach engine
const USE_DECISION_COACH = false; // Set to true when ready to test
```

Then, find where `CourseAdvisorChat` is used (around line 3498) and replace it with:

```javascript
{/* AI Course Advisor Chatbot */}
{USE_DECISION_COACH ? (
  <DecisionCoachAdapter
    completedCourses={completedCourses}
    selectedMajor={selectedMajor}
    selectedCourse={selectedCourse}
    courses={COURSES}
    pathways={MAJOR_PATHWAYS}
    careerOutcomes={CAREER_OUTCOMES}
    onSuggestPath={setChatSuggestedPath}
    onClearPaths={clearAllPaths}
  />
) : (
  <CourseAdvisorChat
    completedCourses={completedCourses}
    selectedMajor={selectedMajor}
    selectedCourse={selectedCourse}
    courses={COURSES}
    pathways={MAJOR_PATHWAYS}
    careerOutcomes={CAREER_OUTCOMES}
    onSuggestPath={setChatSuggestedPath}
    onClearPaths={clearAllPaths}
  />
)}
```

And add the import at the top:
```javascript
import DecisionCoachAdapter from './src/components/DecisionCoachAdapter';
```

### Step 5: Test Incrementally

1. **Start with feature flag OFF** (`USE_DECISION_COACH = false`)
   - Verify existing functionality still works
   
2. **Test adapter in isolation** (if possible)
   - Create a test page that only uses the adapter
   - Verify it works with mock data

3. **Turn feature flag ON** (`USE_DECISION_COACH = true`)
   - Test with real data
   - Compare behavior with old implementation
   - Fix any issues

4. **Once stable, remove old code**
   - Remove `CourseAdvisorChat` component
   - Remove feature flag
   - Clean up unused imports

## Common Integration Patterns

### Pattern 1: Direct API Replacement
If your decision coach engine uses the same message format:

```javascript
// In DecisionCoachAdapter.jsx
import { DecisionCoachEngine } from '../engines/decisionCoachEngine';

const handleSend = async () => {
  // ... setup ...
  
  const engine = new DecisionCoachEngine({
    courses,
    pathways,
    careerOutcomes
  });
  
  const response = await engine.processMessage({
    message: userMessage,
    context: buildContextForEngine(),
    history: messages.slice(-10)
  });
  
  setMessages(prev => [...prev, { 
    role: 'assistant', 
    content: response.text 
  }]);
};
```

### Pattern 2: Different Response Format
If your engine returns structured data:

```javascript
const handleSend = async () => {
  // ... setup ...
  
  const response = await decisionCoachEngine.analyze({
    question: userMessage,
    studentContext: buildContextForEngine()
  });
  
  // Handle structured response
  if (response.recommendations) {
    // Extract course recommendations
    const courseIds = response.recommendations
      .filter(r => r.type === 'course')
      .map(r => r.courseId);
    
    if (courseIds.length > 0) {
      onSuggestPath({
        courses: ['START', ...courseIds],
        name: response.reasoning || 'Recommended Path',
        color: '#00FF88'
      });
    }
  }
  
  // Format response for display
  const displayText = formatDecisionCoachResponse(response);
  setMessages(prev => [...prev, { 
    role: 'assistant', 
    content: displayText 
  }]);
};
```

### Pattern 3: Async/Streaming Responses
If your engine streams responses:

```javascript
const handleSend = async () => {
  // ... setup ...
  
  const stream = await decisionCoachEngine.streamDecision({
    message: userMessage,
    context: buildContextForEngine()
  });
  
  // Add placeholder message
  const messageId = Date.now();
  setMessages(prev => [...prev, { 
    id: messageId,
    role: 'assistant', 
    content: '' 
  }]);
  
  // Stream updates
  for await (const chunk of stream) {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, content: msg.content + chunk }
        : msg
    ));
  }
};
```

## Troubleshooting

### Issue: Import errors
**Solution**: Make sure your build system (if any) is configured to handle the new directory structure. For a single-file React component, you may need to:
- Use relative imports: `'./src/components/DecisionCoachAdapter'`
- Or inline the adapter code in the main file initially

### Issue: Props mismatch
**Solution**: Create a prop mapper function:
```javascript
const mapPropsToEngine = (props) => {
  return {
    // Map to your engine's expected format
    student: {
      completed: Array.from(props.completedCourses),
      major: props.selectedMajor,
      // ... etc
    }
  };
};
```

### Issue: State management conflicts
**Solution**: Keep the adapter's state isolated. Only use callbacks (`onSuggestPath`, `onClearPaths`) to communicate with the parent component.

## Next Steps

1. **Share your decision coach engine code** so I can help create a more specific adapter
2. **Identify interface differences** between current and new implementations
3. **Test with feature flag** before full integration
4. **Iterate based on feedback** and real-world usage

## Need Help?

If you encounter issues:
1. Check the `INTEGRATION_GUIDE.md` for detailed strategies
2. Share your decision coach engine code for specific guidance
3. Test incrementally with the feature flag approach
