# Persona Goal Analysis: Current Backend vs. Desired Approach

## What You Want to Accomplish

### Desired Persona Behavior:
1. **Persona = Coach** (not student)
2. **"Not-knowing"** = Coach doesn't have all answers, asks questions, helps student think
3. **Context-aware** = Knows about courses, majors, prerequisites from visualization
4. **Decision Quality Framework** = Uses DQ dimensions (Framing, Values, Alternatives, Information, Reasoning, Commitment) to guide coaching
5. **Bidirectional Integration** = Persona sees visualization state, visualization adapts to coaching

### Key Characteristics:
- Persona helps students make decisions
- Persona is empathetic but doesn't give direct answers
- Persona uses Socratic questioning
- Persona references specific courses/majors from curriculum
- Persona progresses based on student's decision-making quality

---

## What Current Backend Does

### Current Persona Behavior:
1. **Persona = Student** (not coach)
2. **"Not-knowing"** = Student is confused, needs coaching
3. **Context-aware** = Only knows about Jamie's specific situation (mechanical engineering → art/design)
4. **Decision Quality Framework** = Scores how well the USER coaches the persona (not how well persona coaches)
5. **No Visualization Integration** = Doesn't know about curriculum visualization

### Current Architecture:
- Personas (Jamie, Andres, etc.) respond AS students being coached
- DQ scoring measures coaching quality (how well user coaches the persona)
- System prompts make AI respond as confused student
- No curriculum awareness

---

## The Fundamental Mismatch

### Current Backend:
```
User (coach) → Coaches → AI Persona (student) → Gets clearer
DQ Score = How well user coaches the persona
```

### What You Need:
```
Student → Asks questions → AI Persona (coach) → Helps student think
DQ Score = How well persona coaches the student (or student's decision quality)
```

**These are OPPOSITE roles!**

---

## What Needs to Change

### Option 1: Modify Existing Backend (Complex)

**Changes Needed:**
1. **Reverse the persona role:**
   - Current: Persona = student being coached
   - Needed: Persona = coach helping student

2. **Change system prompts:**
   - Current: "You are Jamie, a confused student..."
   - Needed: "You are a decision coach helping a student..."

3. **Reverse DQ scoring:**
   - Current: Scores how well user coaches persona
   - Needed: Scores how well persona coaches student (or student's decision quality)

4. **Add curriculum context:**
   - Current: Only knows about Jamie's specific situation
   - Needed: Knows about all courses, majors, prerequisites from visualization

5. **Add "not-knowing" coach behavior:**
   - Current: Persona is confused student
   - Needed: Persona is empathetic coach who asks questions, doesn't give direct answers

**Risk:** High - Would fundamentally change the backend, might break existing Jamie AI project

---

### Option 2: Create New Coach Persona (Safer)

**Approach:**
1. Add new `'coach'` persona to existing backend
2. Create coach-specific prompts (not student prompts)
3. Handle DQ scoring differently for coach persona
4. Pass curriculum context in messages

**Advantages:**
- Doesn't break existing personas
- Can test alongside existing system
- Easier to roll back if issues

**Challenges:**
- Still need to reverse the coaching approach
- DQ scoring logic needs modification
- Curriculum context needs to be passed in

---

### Option 3: Build Separate Backend (Safest)

**Approach:**
1. Create new backend specifically for Illinois Tech Skill Tree
2. Design from scratch for coach persona
3. Integrate curriculum data directly
4. Build bidirectional visualization integration

**Advantages:**
- Complete control
- No risk to existing project
- Can optimize for your specific use case
- Can build visualization integration from start

**Challenges:**
- More work upfront
- Need to deploy separately
- Can't reuse existing backend code easily

---

## Key Differences to Address

### 1. Persona Role Reversal

**Current:**
```javascript
// Persona responds as student
"You are Jamie, a confused student. You need help deciding..."
```

**Needed:**
```javascript
// Persona responds as coach
"You are a decision coach. Help the student think through their decision..."
```

### 2. "Not-Knowing" Approach

**Current:**
- Persona is confused and needs help
- User coaches persona

**Needed:**
- Persona is empathetic but doesn't give direct answers
- Persona asks questions, helps student think
- Student must actively engage

### 3. DQ Scoring Direction

**Current:**
- Scores: How well does user coach the persona?
- Higher score = Better user coaching

**Needed:**
- Scores: How well does persona coach the student? (or student's decision quality)
- Higher score = Better coaching/decision-making

### 4. Curriculum Integration

**Current:**
- Persona only knows about specific student situation (Jamie's engineering → design choice)
- No curriculum awareness

**Needed:**
- Persona knows about all courses, majors, prerequisites
- Persona references specific courses from visualization
- Persona adapts based on what student is viewing

### 5. Visualization Integration

**Current:**
- No visualization awareness
- No bidirectional communication

**Needed:**
- Persona "sees" what student is viewing
- Visualization adapts based on coaching
- Real-time updates

---

## Recommended Approach

### Phase 1: Quick Test (Option 2)
- Add `'coach'` persona to existing backend
- Create coach-specific prompts
- Test if "not-knowing" coach approach works
- Validate concept before building full solution

### Phase 2: Full Solution (Option 3)
- Build separate backend optimized for your use case
- Integrate curriculum data
- Build bidirectional visualization communication
- Implement proper DQ scoring for coaching

---

## Questions to Consider

1. **Do you want to keep using existing backend?**
   - If yes: Need to add coach persona carefully
   - If no: Build separate backend

2. **How important is preserving Jamie AI project?**
   - If critical: Use separate backend
   - If not: Can modify existing (with risk)

3. **Do you need the visualization integration immediately?**
   - If yes: Separate backend might be better
   - If no: Can start with modified existing backend

4. **What's your timeline?**
   - Quick test: Option 2 (add coach persona)
   - Production: Option 3 (separate backend)

---

## Bottom Line

**The current backend is designed for the OPPOSITE use case:**
- Current: User coaches AI student
- Needed: AI coach helps student

**To accomplish your goal, you need to either:**
1. Fundamentally modify the backend (risky)
2. Add a coach persona that works differently (moderate risk)
3. Build a new backend from scratch (safest, most work)

**The "not-knowing" approach is the same concept, but reversed:**
- Current: AI student is "not-knowing" (confused)
- Needed: AI coach is "not-knowing" (doesn't give direct answers, asks questions)

Both use the same principle (not-knowing), but in opposite roles.
