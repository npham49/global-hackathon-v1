# Voice Agent Structure Documentation

## Overview

This document details the conversational AI agent's internal structure, behavior patterns, and prompt engineering strategies used in the Survy voice survey system.

---

## Agent Configuration

### Base Model

```
Model: gpt-4o-mini-realtime-preview
Voice: alloy
Provider: OpenAI Realtime API
Protocol: WebSocket
```

### Voice Settings

```typescript
{
  voice: "alloy",              // Neutral, professional tone
  turnDetection: {
    type: "server_vad",        // Server-side Voice Activity Detection
    threshold: 0.5,            // Medium sensitivity
    prefixPaddingMs: 300,      // Capture 300ms before speech start
    silenceDurationMs: 500     // 500ms silence = turn complete
  }
}
```

**Why these settings?**

- `server_vad`: Offloads detection to server, more reliable
- `threshold: 0.5`: Balanced (not too sensitive to noise, not too strict)
- `prefixPaddingMs: 300`: Catches beginning of words
- `silenceDurationMs: 500`: Natural pause length in conversation

---

## Dynamic Prompt Generation

The agent's behavior is entirely driven by dynamically generated prompts based on the form schema. No hard-coded questions.

### Prompt Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     GENERATED PROMPT                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. SURVEY QUESTIONS (ask in order)                          │
│     [Dynamically generated from FormSchema]                  │
│     - [REQUIRED] What do you enjoy... (Type: TEXT, Key: q1)  │
│     - [OPTIONAL] Rate your satisfaction... (Type: LIKERT...) │
│     ...                                                       │
│                                                               │
│  2. YOUR ROLE                                                │
│     [Defines agent personality and responsibilities]         │
│                                                               │
│  3. HOW TO RECORD ANSWERS                                    │
│     [Instructions for each question type]                    │
│     - TEXT: Record full spoken response                      │
│     - LIKERT: Record number 1-5 as string                    │
│                                                               │
│  4. STEP-BY-STEP PROCESS                                     │
│     [Conversation flow from greeting to submission]          │
│                                                               │
│  5. QUALITY TIPS                                             │
│     [Guidelines for improving response quality]              │
│                                                               │
│  6. CRITICAL RULES                                           │
│     [Important constraints and behaviors]                    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Personality & Tone

### Defined Characteristics

**Primary Role:**

> "You are a friendly employee satisfaction survey interviewer conducting a conversation."

**Key Traits:**

- **Warm**: Uses friendly greetings and acknowledgments
- **Professional**: Maintains appropriate boundaries
- **Empathetic**: Shows genuine interest in responses
- **Efficient**: Doesn't waste time with unnecessary chatter
- **Natural**: Conversational, not robotic

### Tone Examples

**Good (Natural):**

> "Thanks! Now, I'd like to ask about your workload. How would you describe your typical day-to-day?"

**Bad (Robotic):**

> "Question 2: Describe workload. Please respond."

**Good (Empathetic):**

> "I appreciate you sharing that. Could you tell me more about what makes that challenging?"

**Bad (Dismissive):**

> "Okay. Next question."

---

## Conversation Flow

### State Machine

```
┌─────────────┐
│   START     │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│   GREETING      │  "Hi! I have a few questions..."
└──────┬──────────┘
       │
       ▼
┌─────────────────────────────────────────────────┐
│   QUESTION LOOP (for each question)             │
│   ┌─────────────────────────────────────────┐   │
│   │  1. ASK QUESTION                        │   │
│   │  2. WAIT FOR USER                       │   │
│   │  3. LISTEN TO ANSWER                    │   │
│   │  4. CHECK QUALITY                       │   │
│   │     ├─ Brief? → PROBE (go to 2)        │   │
│   │     └─ Good? → CONTINUE                 │   │
│   │  5. CALL update_submission              │   │
│   │  6. ACKNOWLEDGE ("Thanks!")             │   │
│   │  7. MOVE TO NEXT (or END LOOP)          │   │
│   └─────────────────────────────────────────┘   │
└──────┬──────────────────────────────────────────┘
       │
       ▼
┌─────────────────┐
│ CONFIRMATION    │  "Everything looks good?"
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  [VALIDATION]   │  (Currently disabled)
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  SUBMISSION     │  Call submit_form()
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│   GOODBYE       │  "Thank you!"
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│   DISCONNECT    │  (Auto after 2s)
└─────────────────┘
```

### Critical State Transitions

**ASK → WAIT:**

- Agent MUST stop and wait for user to speak
- Prevents rushing ahead with multiple questions

**LISTEN → CHECK:**

- Agent evaluates answer quality
- Decision point: Accept or probe?

**CHECK → PROBE (if brief):**

- Trigger phrases: "good", "fine", "yes", "no" only
- Agent asks: "Could you tell me more?"
- Loops back to WAIT

**CHECK → CONTINUE (if good):**

- Answer is substantial
- Proceeds to record

**CALL TOOL → ACKNOWLEDGE:**

- Tool returns empty string (ignored)
- Agent gives single acknowledgment
- NO mention of "recording" or "saving"

---

## Question Type Handling

### TEXT Questions

**Schema Example:**

```typescript
{
  type: "TEXT",
  key: "work_enjoyment",
  title: "What do you enjoy most about your work?",
  required: true
}
```

**Agent Behavior:**

1. **Ask naturally:**

   > "Tell me, what do you enjoy most about your work here?"

2. **Wait for response:**
   - VAD detects when user starts speaking
   - Transcription captures full response

3. **Evaluate quality:**
   - Good: "I really enjoy the collaborative environment and the challenging projects that push me to grow."
   - Brief: "Good."

4. **If brief, probe:**

   > "That's great! Could you tell me a bit more about that?"

5. **Record full answer:**

   ```typescript
   update_submission(
     key: "work_enjoyment",
     value: "I really enjoy the collaborative environment and the challenging projects that push me to grow."
   )
   ```

6. **Acknowledge once:**
   > "Got it, thanks!"

### LIKERT Questions

**Schema Example:**

```typescript
{
  type: "LIKERT",
  key: "benefits_satisfaction",
  title: "The company provides good benefits",
  required: true
}
```

**Agent Behavior:**

1. **Present statement and scale:**

   > "I'd like to hear your thoughts on this: 'The company provides good benefits.' On a scale of 1 to 5, where 1 means you strongly disagree and 5 means you strongly agree, how would you rate that?"

2. **Wait for number:**
   - User says: "I'd say a 4"
   - Or: "Four"
   - Or: "4"

3. **Record immediately:**

   ```typescript
   update_submission(
     key: "benefits_satisfaction",
     value: "4"  // Always as string
   )
   ```

4. **Optional follow-up (for context):**

   > "Thanks! What influenced your rating?"
   - Listen to explanation
   - DO NOT record this separately
   - Just for natural conversation

5. **Move to next question:**
   > "Great. Now, let's talk about..."

---

## Quality Control Mechanisms

### 1. **Answer Length Detection**

**Brief answers that trigger probing:**

- Single words: "good", "fine", "okay", "yes", "no"
- Very short phrases: "It's fine"
- Question repetition: "What do I enjoy? Well, work."

**Probing phrases:**

- "Could you tell me more about that?"
- "That's interesting! What specifically makes you feel that way?"
- "I'd love to hear more details."

### 2. **Contextual Probing**

**For positive brief answers:**

> "That's great! What specifically do you enjoy about it?"

**For negative brief answers:**

> "I understand. Can you help me understand what's challenging about it?"

**For neutral brief answers:**

> "I see. Could you elaborate on that a bit?"

### 3. **Acknowledgment Patterns**

**Variety prevents monotony:**

- "Thanks!"
- "Got it!"
- "Thank you for sharing that."
- "I appreciate that."
- "Understood."

**NEVER:**

- "I'm recording that now"
- "Saving your answer"
- "Let me save that"
- Repeat "thank you" multiple times

---

## Tool Invocation Logic

### When to Call Tools

```
┌──────────────────────────────────────────────────────────┐
│  Agent Decision Tree                                      │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  Did user give an answer to the current question?         │
│    │                                                       │
│    ├─ YES → Is it substantial?                           │
│    │         │                                            │
│    │         ├─ YES → Call update_submission()           │
│    │         │        Return ""                           │
│    │         │        Give acknowledgment                 │
│    │         │        Move to next question               │
│    │         │                                            │
│    │         └─ NO → Probe for more detail               │
│    │                 Wait for expanded answer             │
│    │                 Loop back to evaluation              │
│    │                                                       │
│    └─ NO → Still waiting for this question's answer      │
│            Don't move forward                             │
│                                                            │
│  Are all questions answered AND user confirmed?           │
│    └─ YES → Call submit_form()                           │
│              Return success/failure message               │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

### Tool Call Arguments

**update_submission:**

```typescript
{
  key: string,    // Exact key from schema (e.g., "work_enjoyment")
  value: string   // User's answer OR rating number as string
}
```

**Examples:**

```typescript
// TEXT question
update_submission(
  (key = "feedback"),
  (value = "The team collaboration is excellent and I feel valued")
);

// LIKERT question
update_submission((key = "satisfaction"), (value = "5"));
```

---

## Error Handling & Recovery

### User Corrections

**Scenario:** User wants to change an answer

**Current behavior:**

- Agent proceeds with existing answer
- Validation disabled (would catch this)

**Future behavior (when validation re-enabled):**

- Agent: "Which question would you like to update?"
- User specifies question
- Agent re-asks that question
- Records new answer (overwrites previous)

### Unclear Responses

**Scenario:** Agent doesn't understand

**Agent says:**

> "I'm sorry, I didn't quite catch that. Could you repeat your answer?"

**Agent behavior:**

- Does NOT record unclear response
- Waits for clarification
- Tries again (max 2-3 attempts)
- If still unclear: "Let's move to the next question and we can come back to this one."

### Technical Issues

**Connection Lost:**

- Agent automatically attempts reconnection
- User sees "Reconnecting..." indicator
- If reconnection fails: Fallback to manual form

**Microphone Issues:**

- Agent can't hear user (no audio input detected)
- After 10 seconds of silence: "I'm not receiving any audio. Please check your microphone."

**Submission Failure:**

- Agent calls submit_form()
- Returns: "SUBMISSION_FAILED: [error]"
- Agent says: "I apologize, there was an error submitting your responses. Please try using the manual form below."
- Session stays connected (user can disconnect manually)

---

## Prompt Engineering Strategies

### 1. **Explicit Instructions**

**Bad (implicit):**

> "Ask questions conversationally."

**Good (explicit):**

> "For EACH question in the list above:
> a. Ask the question conversationally
> b. STOP and WAIT for the user to speak
> c. Listen to their complete answer
> d. If too brief → Probe with: 'Could you tell me more?' and WAIT again
> e. Once you have HEARD a good answer → Call update_submission(key, value)"

### 2. **Negative Examples**

Telling the agent what NOT to do is as important as what to do:

```
⚠️ DO NOT:
- Ask multiple questions in a row without waiting for answers
- Say "thank you" multiple times
- Mention that you're "recording" or "saving"
- Move to next question without calling update_submission first
```

### 3. **Emphasis Markers**

Use visual markers to draw attention:

- `⚠️ CRITICAL:` for must-follow rules
- `WAIT` in caps for important pauses
- `IMMEDIATELY` for urgent actions

### 4. **Concrete Examples**

Provide exact examples of desired behavior:

```
Example: update_submission(key="feedback", value="I really love collaborating with my team")
```

Not just: "Call the tool with the answer"

### 5. **State Reminders**

Repeat critical rules multiple times in different sections:

- In "YOUR ROLE": "Call update_submission after EVERY answer"
- In "HOW TO RECORD": "IMMEDIATELY call: update_submission(...)"
- In "STEP-BY-STEP": "Once you have HEARD a good answer → Call update_submission"
- In "CRITICAL RULES": "You MUST call update_submission ONLY after the user speaks"

---

## Behavioral Constraints

### Do's

✅ **Do:**

- Wait for user to finish speaking (respect VAD detection)
- Probe brief answers for quality
- Acknowledge answers naturally
- Move at a steady, comfortable pace
- Use varied phrasing to avoid monotony
- Be warm and empathetic
- Stay on topic (survey questions only)

### Don'ts

❌ **Don't:**

- Rush through questions
- Accept one-word answers without probing
- Say "thank you" multiple times per answer
- Announce that you're recording
- Ask questions the user didn't answer yet
- Make small talk beyond the survey
- Repeat exact same phrases every time
- Interrupt user mid-sentence

---

## Performance Optimization

### Prompt Length Management

**Challenge:** Long prompts increase latency and cost.

**Solution:**

- Only include relevant question types (TEXT, LIKERT)
- Omit questions with `required: false` from critical path
- Use concise but complete instructions
- Remove redundant explanations

### Response Time

**Goal:** Agent should respond within 1-2 seconds of user finishing.

**Achieved through:**

- Server-side VAD (faster than client-side)
- `silenceDurationMs: 500` (not too long)
- Streaming responses from LLM
- Tool calls processed asynchronously

### Token Usage

**Typical session:**

- Initial prompt: ~800 tokens
- Per question exchange: ~150 tokens
- 8-question survey: ~2,000 tokens total
- Cost: ~$0.02 per survey (gpt-4o-mini pricing)

---

## Testing & Validation

### Agent Behavior Tests

**Test scenarios:**

1. **Happy path:** User gives good answers to all questions
2. **Brief answers:** User says only "good" or "fine"
3. **Interruptions:** User speaks while agent is talking
4. **Silence:** User doesn't respond for 10+ seconds
5. **Corrections:** User wants to change previous answer
6. **Submission failure:** Backend returns error

### Quality Metrics

**Measure:**

- Average questions per minute (target: 1.5-2)
- Probing rate (target: 20-30% of questions)
- Average answer length in characters (target: >100 for TEXT)
- Completion rate (target: >90%)
- User satisfaction score (post-survey feedback)

---

## Future Enhancements

### 1. **Context Awareness**

Track previous answers to ask follow-up questions:

> "Earlier you mentioned enjoying team collaboration. How does that tie into your overall satisfaction?"

### 2. **Sentiment Analysis**

Detect negative sentiment and probe deeper:

> "It sounds like that's been frustrating. Can you tell me more about what's been challenging?"

### 3. **Multi-turn Clarifications**

Allow extended back-and-forth on complex questions:

```
Agent: "What do you think could improve?"
User: "The tools we use."
Agent: "Which tools specifically?"
User: "The CRM system, it's slow."
```

### 4. **Answer Summarization**

For very long answers, agent could summarize:

> "So to summarize, you enjoy the collaborative environment but feel the tools could be better. Is that accurate?"

### 5. **Personality Customization**

Let managers choose agent personality:

- Formal vs. Casual
- Concise vs. Conversational
- Empathetic vs. Neutral

---

## Appendix: Full Prompt Template

See `schema-template.ts` for the complete, up-to-date prompt template with all instructions and formatting.

**Key sections:**

1. Dynamic survey questions list
2. Role definition
3. Recording procedures
4. Step-by-step process
5. Quality tips
6. Critical rules and warnings
