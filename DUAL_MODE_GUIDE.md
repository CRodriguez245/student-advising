# Dual-Mode Decision Coach Guide

## Overview

The Decision Coach now supports **two modes**:

### Mode 1: Get Coaching (AI Coach Helps Student)
- **Role:** AI is the coach, you are the student
- **Purpose:** Get help making academic decisions
- **How it works:** AI coach asks questions, helps you think through decisions
- **DQ Scoring:** Measures how well the AI coach helps you

### Mode 2: Practice Coaching (Student Coaches AI Persona)
- **Role:** You are the coach, AI persona is the student
- **Purpose:** Practice your coaching skills
- **How it works:** You coach an AI persona (Alex, Sam, or Jordan) through a difficult decision
- **DQ Scoring:** Measures how well you coach the AI persona
- **Persona Progression:** Personas get clearer as you coach better (confused → exploring → clarifying → deciding)

## How to Use

### Switching Modes

1. Open the Decision Coach (click the 🎯 button)
2. In the header, click either:
   - **"Get Coaching"** - AI helps you
   - **"Practice Coaching"** - You help AI persona

### Practice Mode: Choosing a Persona

When in Practice Mode, you can choose from three personas:

- **Alex** - First-year student, overwhelmed by options, interested in tech but unsure
- **Sam** - Sophomore, considering major change, worried about disappointing parents
- **Jordan** - First-year, interested in computing and humanities, feels forced to choose

### Persona Stages

In Practice Mode, watch the persona's stage indicator:
- **Confused** (0-30% progress) - Overwhelmed, needs guidance
- **Exploring** (30-60% progress) - Starting to see options
- **Clarifying** (60-80% progress) - Gaining clarity
- **Deciding** (80-100% progress) - Ready to commit

The persona's stage improves as you provide better coaching (measured by DQ scores).

## Example Conversations

### Get Coaching Mode
**You:** "Can I do computing and humanities?"
**AI Coach:** "That's a great question! What draws you to each of those areas? And what concerns do you have about combining them?"

### Practice Coaching Mode
**You:** "What's making you feel stuck right now?"
**Alex (persona):** "I'm really confused about everything right now. I want to do design but I also don't want to disappoint my parents. I don't even know where to start thinking about this."

## DQ Scoring

Both modes use the Decision Quality framework with 6 dimensions:
1. **Framing** - Clarifying the decision
2. **Alternatives** - Exploring options
3. **Information** - Gathering relevant data
4. **Values** - Understanding priorities
5. **Reasoning** - Thinking through trade-offs
6. **Commitment** - Moving toward a decision

Check the browser console (Cmd+Option+I) to see detailed DQ scores.

## Tips for Practice Mode

1. **Ask open-ended questions** - Help the persona think, don't give answers
2. **Explore values** - "What matters most to you?"
3. **Identify alternatives** - "Have you considered X?"
4. **Gather information** - "What do you know about Y?"
5. **Reason through trade-offs** - "What are the pros and cons?"
6. **Move toward commitment** - "It sounds like you're leaning toward..."

The better you coach, the clearer the persona becomes!

## Technical Details

- **Backend:** Handles both modes via `mode` parameter
- **Session State:** Tracks mode, persona, stage, and DQ scores
- **Persona Progression:** Based on smoothed DQ minimum scores
- **Curriculum Awareness:** Both modes use your actual course data
