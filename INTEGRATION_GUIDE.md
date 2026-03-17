# Decision Coach Engine Integration Guide

## Overview
This guide outlines a safe, incremental approach to integrating your decision coach engine into the Illinois Tech Skill Tree project without breaking existing functionality.

## Current Architecture
- **Single-file component**: All code in `illinois-tech-full-catalog-skill-tree.jsx`
- **Current chatbot**: `CourseAdvisorChat` component (lines ~1607-2208)
- **API**: Direct Anthropic API calls
- **State management**: React hooks (useState, useMemo, etc.)

## Recommended Integration Strategy

### Phase 1: Prepare the Foundation (Zero Risk)

#### Step 1.1: Create Module Structure
Create a new directory structure to separate concerns:

```
Advisor-DecisionCoach/
├── illinois-tech-full-catalog-skill-tree.jsx (existing - keep as-is)
├── src/
│   ├── components/
│   │   ├── CourseAdvisorChat.jsx (extracted from main file)
│   │   └── DecisionCoachAdapter.jsx (new - adapter layer)
│   ├── engines/
│   │   └── decisionCoachEngine.js (your decision coach engine)
│   └── utils/
│       └── contextBuilders.js (shared context building logic)
└── INTEGRATION_GUIDE.md (this file)
```

#### Step 1.2: Extract Current Chatbot (Backup First!)
1. **Create a git commit or backup** of the current working state
2. Extract `CourseAdvisorChat` component to `src/components/CourseAdvisorChat.jsx`
3. Keep the original component in the main file temporarily (commented out or as fallback)

### Phase 2: Create Adapter Layer (Low Risk)

#### Step 2.1: Design the Adapter Interface
The adapter should:
- Accept the same props as `CourseAdvisorChat` currently does
- Translate between your decision coach engine's API and the UI's expectations
- Maintain backward compatibility

**Example Adapter Structure:**
```javascript
// DecisionCoachAdapter.jsx
const DecisionCoachAdapter = ({
  completedCourses,
  selectedMajor,
  selectedCourse,
  courses,
  pathways,
  careerOutcomes,
  onSuggestPath,
  onClearPaths
}) => {
  // Wrap your decision coach engine
  // Translate props to engine format
  // Translate engine responses to UI format
}
```

#### Step 2.2: Create Feature Flag
Add a simple toggle to switch between old and new implementations:

```javascript
const USE_DECISION_COACH = false; // Start with false for safety
```

### Phase 3: Incremental Integration (Controlled Risk)

#### Step 3.1: Side-by-Side Testing
1. Keep both implementations available
2. Add a dev-only toggle to switch between them
3. Test thoroughly before switching

#### Step 3.2: Gradual Migration
1. **Week 1**: Extract chatbot, test in isolation
2. **Week 2**: Create adapter, test with mock data
3. **Week 3**: Integrate decision coach engine, test with real data
4. **Week 4**: Switch feature flag, monitor for issues

### Phase 4: Full Integration (After Validation)

Once confident:
1. Remove old implementation
2. Remove feature flag
3. Clean up unused code

## Implementation Details

### Option A: Direct Replacement (Simpler)
If your decision coach engine has a similar interface:

```javascript
// In main component
import DecisionCoachAdapter from './src/components/DecisionCoachAdapter';

// Replace CourseAdvisorChat with:
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
```

### Option B: Wrapper Pattern (More Flexible)
If you want to keep both options available:

```javascript
// Create a wrapper that chooses implementation
const AdvisorWrapper = (props) => {
  const useDecisionCoach = process.env.REACT_APP_USE_DECISION_COACH === 'true';
  
  if (useDecisionCoach) {
    return <DecisionCoachAdapter {...props} />;
  }
  return <CourseAdvisorChat {...props} />;
};
```

## Key Considerations

### 1. Props Interface Compatibility
Ensure your decision coach engine can work with these props:
- `completedCourses`: Set of completed course IDs
- `selectedMajor`: Currently selected major key
- `selectedCourse`: Currently selected course object
- `courses`: Full course catalog array
- `pathways`: Major pathway definitions
- `careerOutcomes`: Career outcome data
- `onSuggestPath`: Callback to highlight a course path
- `onClearPaths`: Callback to clear path highlights

### 2. Message Format Compatibility
The current chatbot expects:
- Messages array: `[{ role: 'user'|'assistant', content: string }]`
- Loading state management
- Error handling

### 3. Context Building
The current implementation builds context from:
- Student's completed courses
- Available courses (prerequisites met)
- Selected major/course
- Course catalog summary
- Career outcomes

Your decision coach engine may need similar context - extract this logic to a shared utility.

### 4. API Differences
If your decision coach engine uses a different API:
- Create an abstraction layer
- Map between formats
- Handle errors gracefully

## Testing Strategy

### 1. Unit Tests (Before Integration)
- Test decision coach engine in isolation
- Test adapter with mock data
- Test context builders

### 2. Integration Tests (During Integration)
- Test with real course data
- Test all major pathways
- Test edge cases (empty state, all courses completed, etc.)

### 3. User Acceptance Testing
- Test with actual use cases
- Verify UI responsiveness
- Check for performance issues

## Rollback Plan

If issues arise:
1. **Immediate**: Switch feature flag back to old implementation
2. **Short-term**: Revert to previous git commit
3. **Long-term**: Fix issues in decision coach engine, retry integration

## Questions to Answer Before Starting

1. **Where is your decision coach engine?**
   - Is it in a separate repository?
   - What language/framework is it in?
   - Does it need to be ported to JavaScript/React?

2. **What's the interface of your decision coach engine?**
   - What inputs does it expect?
   - What outputs does it provide?
   - Does it use the same API (Anthropic) or different?

3. **What features does it have that the current chatbot doesn't?**
   - Structured decision-making?
   - Multi-step conversations?
   - Different reasoning approach?

4. **Do you want to keep the old chatbot as a fallback?**
   - Or completely replace it?

## Next Steps

1. **Share your decision coach engine code** or location
2. **Identify the interface differences** between current and new
3. **Choose integration approach** (Option A or B)
4. **Create the adapter layer** based on your engine's interface
5. **Test incrementally** with feature flags
6. **Deploy gradually** once validated

## Support

If you need help with any step:
- Share your decision coach engine code
- Describe the interface/API it uses
- Explain any specific requirements or constraints
