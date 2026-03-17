# Dual-Mode Decision Coach Design

## Two Modes

### Mode 1: AI Coach Helps Students
- **Role:** AI is the coach, student is being coached
- **Purpose:** Help students make academic decisions
- **Approach:** "Not-knowing" coach asks questions, helps think
- **DQ Scoring:** Measures how well AI coach helps student

### Mode 2: Students Coach AI Personas
- **Role:** Student is the coach, AI persona is being coached
- **Purpose:** Students practice coaching skills
- **Approach:** AI personas are confused students with emotional states
- **DQ Scoring:** Measures how well student coaches the AI persona

## Implementation Plan

### Backend Changes

1. **Add Mode Parameter**
   - Request includes `mode: 'coach' | 'practice'`
   - `coach` = AI coach helps student
   - `practice` = Student coaches AI persona

2. **Add Student Personas**
   - Create curriculum-aware student personas
   - Each has emotional states, backstories, cognitive limitations
   - Progress through stages based on student's coaching quality

3. **Dual DQ Scoring**
   - Mode 1: Score AI coach's effectiveness
   - Mode 2: Score student's coaching quality

4. **Persona Progression**
   - In practice mode: Personas get clearer as student coaches better
   - Track persona stages based on DQ scores

### Frontend Changes

1. **Mode Selector**
   - UI to choose: "Get Coaching" vs "Practice Coaching"
   - Or toggle between modes

2. **Different UI for Each Mode**
   - Coach mode: Shows AI coach helping student
   - Practice mode: Shows student coaching AI persona

3. **DQ Score Display**
   - Show appropriate scores for each mode
   - Different visualizations

## Persona Design for Practice Mode

### Student Personas (Curriculum-Aware)

**Example: "Alex" - Undecided CS Student**
- Emotional state: Confused, overwhelmed by options
- Backstory: First-year student, interested in tech but unsure
- Cognitive limitation: Struggles to see connections between courses
- Progresses: Gets clearer as student coaches better

**Example: "Sam" - Switching Majors**
- Emotional state: Anxious about disappointing parents
- Backstory: Engineering major considering design
- Cognitive limitation: Focuses on fears, not possibilities
- Progresses: Gains confidence through good coaching

### Persona Stages (Based on Coaching Quality)

- **Confused** (DQ < 0.3): Overwhelmed, scattered thoughts
- **Exploring** (DQ 0.3-0.6): Starting to see options, still uncertain
- **Clarifying** (DQ 0.6-0.8): Gaining clarity, articulating values
- **Deciding** (DQ > 0.8): Ready to commit, clear on path

## API Design

### Request Format
```json
{
  "message": "user's message",
  "mode": "coach" | "practice",
  "persona": "alex" | "sam" | null,  // Only for practice mode
  "session_id": "session-123",
  "curriculum_data": {...}
}
```

### Response Format
```json
{
  "mode": "coach" | "practice",
  "reply": "AI response",
  "dq_score": {...},
  "persona_stage": "confused" | "exploring" | "clarifying" | "deciding",  // Only for practice
  "persona_progress": 0.0-1.0  // Only for practice
}
```

## Next Steps

1. Add mode parameter to backend
2. Create student personas with curriculum awareness
3. Implement persona progression system
4. Update DQ scoring for both modes
5. Update frontend to support mode switching
