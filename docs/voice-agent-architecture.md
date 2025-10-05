# Voice Agent Architecture

## Overview

The Survy voice agent system enables employees to complete satisfaction surveys through natural voice conversations using OpenAI's Realtime API. This document describes the technical architecture, implementation details, and design decisions.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Survy Voice Agent System                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐         ┌─────────────────┐                  │
│  │   Browser    │◄───────►│  React Client   │                  │
│  │  (Web Audio) │         │   Components    │                  │
│  └──────────────┘         └────────┬────────┘                  │
│                                     │                            │
│                           ┌─────────▼─────────┐                 │
│                           │  useVoiceAgent    │                 │
│                           │      Hook         │                 │
│                           └─────────┬─────────┘                 │
│                                     │                            │
│         ┌───────────────────────────┼───────────────────────┐   │
│         │                           │                       │   │
│    ┌────▼─────┐         ┌──────────▼────────┐   ┌────────▼──┐ │
│    │  Agent   │         │  Schema Template  │   │   Tools   │ │
│    │ Factory  │         │    Generator      │   │ (3 tools) │ │
│    └────┬─────┘         └───────────────────┘   └───────────┘ │
│         │                                                       │
│    ┌────▼──────────────────────────────────────────┐           │
│    │     OpenAI Realtime API (WebSocket)          │           │
│    │  Model: gpt-4o-mini-realtime-preview         │           │
│    └───────────────────────────────────────────────┘           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. **useVoiceAgent Hook** (`/hooks/use-voice-agent.ts`)

The main hook that manages the voice agent lifecycle and state.

**Responsibilities:**

- Establish and manage WebSocket connection to OpenAI Realtime API
- Handle authentication (fetch ephemeral token)
- Process conversation history and tool calls
- Manage React state for submission data
- Provide connection controls (connect/disconnect)

**Key State:**

```typescript
{
  isConnected: boolean,      // Connection status
  isConnecting: boolean,     // Loading state
  error: string | null,      // Error messages
  messages: Message[],       // Conversation history
  submission: Record<>,      // Current survey answers
}
```

**Refs:**

- `sessionRef`: Holds RealtimeSession instance
- `submissionRef`: Synced copy of submission state for tool closures
- `processedToolCallsRef`: Deduplication tracking for tool calls

### 2. **Agent Factory** (`/lib/voice-agent/agent-factory.ts`)

Creates RealtimeAgent instances with proper configuration.

**Configuration:**

```typescript
{
  model: "gpt-4o-mini-realtime-preview",
  voice: "alloy",
  turnDetection: {
    type: "server_vad",
    threshold: 0.5,
    prefixPaddingMs: 300,
    silenceDurationMs: 500
  },
  inputAudioTranscription: {
    model: "gpt-4o-mini-transcribe"
  }
}
```

### 3. **Schema Template Generator** (`/lib/voice-agent/schema-template.ts`)

Generates dynamic conversational instructions based on form schema.

**Functions:**

- `generateSchemaDescription()`: Formats form questions as list
- `generateSchemaInstructions()`: Creates complete prompt with:
  - Survey questions in order
  - Role and behavior instructions
  - Answer recording procedures
  - Step-by-step conversation flow
  - Quality tips and critical rules

**Key Instructions:**

- Wait for user to speak before recording
- Probe brief/vague answers for quality
- Call update_submission after every answer
- One question at a time
- Silent tool execution (no verbal announcements)

### 4. **Tools System** (`/lib/voice-agent/tools.ts`)

Three OpenAI function tools that enable the agent to interact with the application.

#### **Tool 1: update_submission**

**Purpose:** Records a single answer to a survey question.

**Parameters:**

- `key` (string): Field key from schema
- `value` (string): User's answer (text or number as string)

**Execution Model:** Hybrid

- Invoke method: Returns empty string (no-op)
- Actual processing: Manual in history handler
- Reason: Reliable React state updates require current closure

**Deduplication:** Yes - tracks unique `key_value` combinations to prevent duplicate processing.

#### **Tool 2: validate_submission** (Currently Disabled)

**Purpose:** Validates if all required fields are completed.

**Status:** Commented out for future implementation.

**Original Behavior:**

- Checks submission against schema
- Returns formatted result strings
- Lists missing required questions by title

#### **Tool 3: submit_form**

**Purpose:** Submits completed survey and disconnects session.

**Execution Model:** Invoke method

- Calls `handleSubmit()` callback
- Waits 2 seconds
- Calls `disconnect()`
- Returns success/failure status

**Error Handling:**

- Success: Agent thanks user, auto-disconnects
- Failure: Agent suggests manual form

## Data Flow

### Connection Flow

```
1. User clicks "Start Voice Survey"
   ↓
2. useVoiceAgent.connect() called
   ↓
3. Fetch ephemeral token from /api/openai/token
   ↓
4. Generate schema instructions from form
   ↓
5. Create three tools (update, validate, submit)
   ↓
6. Create RealtimeAgent with instructions + tools
   ↓
7. Create RealtimeSession with agent
   ↓
8. Setup history_updated event listener
   ↓
9. Connect to OpenAI WebSocket
   ↓
10. Set isConnected = true
```

### Answer Recording Flow

```
1. Agent asks question
   ↓
2. User speaks answer (VAD detects speech end)
   ↓
3. Agent receives transcription
   ↓
4. Agent calls update_submission(key, value)
   ↓
5. Tool call appears in history_updated event
   ↓
6. History handler detects "update_submission"
   ↓
7. Parse arguments {key, value}
   ↓
8. Create unique toolCallId = "update_submission_[key]_[value]"
   ↓
9. Check processedToolCallsRef.has(toolCallId)
   ↓
10. If duplicate: Skip (prevents double processing)
    If new: Process and add to Set
   ↓
11. Convert value to number if numeric string
   ↓
12. Update submission state via setSubmission()
   ↓
13. Sync submissionRef.current for tool closures
   ↓
14. Agent moves to next question
```

### Submission Flow

```
1. All questions answered
   ↓
2. Agent asks for confirmation
   ↓
3. User confirms
   ↓
4. [VALIDATION SKIPPED - disabled for now]
   ↓
5. Agent calls submit_form()
   ↓
6. Tool invoke method executes handleSubmit()
   ↓
7. handleSubmit() calls submitFormAction server action
   ↓
8. Server validates and saves to database
   ↓
9. Set cookie to prevent resubmission
   ↓
10. setTimeout(disconnect, 2000)
   ↓
11. Agent thanks user and disconnects
```

## Key Design Decisions

### 1. **Hybrid Tool Execution Model**

**Problem:** React state closures in tool invoke methods capture stale values.

**Solution:** Different execution patterns for different tools:

- `update_submission`: Manual processing in history handler (has current state)
- `validate_submission`: Invoke method (uses submissionRef for current data)
- `submit_form`: Invoke method (callbacks don't need state)

### 2. **Tool Call Deduplication**

**Problem:** Agent sometimes calls tools multiple times, causing state corruption.

**Solution:** Track processed tool calls in a Set with unique IDs:

```typescript
const toolCallId = `${name}_${key}_${value}`;
if (processedToolCallsRef.current.has(toolCallId)) return;
processedToolCallsRef.current.add(toolCallId);
```

### 3. **Empty String Returns**

**Problem:** Agent was acknowledging tool responses verbally ("I've recorded that").

**Solution:** update_submission returns empty string, agent instructed to ignore it.

### 4. **Validation Disabled**

**Problem:** Validation with stale state caused incorrect error messages.

**Solution:** Temporarily disabled, preserved code in comments for future implementation.

### 5. **Voice Activity Detection (VAD)**

**Configuration:**

```typescript
{
  type: "server_vad",
  threshold: 0.5,           // Sensitivity to speech
  prefixPaddingMs: 300,     // Include 300ms before detected speech
  silenceDurationMs: 500    // 500ms silence = end of speech
}
```

Allows natural turn-taking without manual push-to-talk.

## State Management

### React State

- `submission`: Primary source of truth for UI
- `messages`: Conversation history for display
- `isConnected`, `isConnecting`, `error`: UI control

### Refs

- `sessionRef`: WebSocket session instance
- `submissionRef`: Synchronized copy of submission for tool closures
- `processedToolCallsRef`: Set of processed tool call IDs

### Why Both State and Ref for Submission?

- State: Triggers re-renders for UI updates
- Ref: Provides current value to tool callbacks without stale closures

## Error Handling

### Connection Errors

- Caught in connect() try-catch
- Sets error state for UI display
- User can retry connection

### Tool Execution Errors

- Wrapped in try-catch in history handler
- Logged to console
- Does not crash the session

### Submission Errors

- Caught in submit_form tool
- Returns "SUBMISSION_FAILED: [error message]"
- Agent tells user to try manual form

## Performance Considerations

### Deduplication

Prevents redundant state updates and question skipping.

### Ref Usage

Avoids unnecessary re-renders while maintaining current data access.

### Event Listener Cleanup

useEffect cleanup removes listeners on unmount.

### Session Cleanup

disconnect() properly closes WebSocket and clears state.

## Security

### Token Management

- Ephemeral tokens fetched per session
- Short-lived, specific to user/form
- No long-lived credentials in client

### Form Access Control

- Token-based access to forms
- Cookie prevents duplicate submissions
- Server-side validation on submission

## Future Enhancements

### 1. **Re-enable Validation**

Fix state synchronization issues and restore validation step.

### 2. **Answer Editing**

Allow users to go back and change previous answers.

### 3. **Multi-language Support**

Detect user language and adapt agent responses.

### 4. **Audio Interruption**

Allow users to interrupt agent mid-sentence.

### 5. **Analytics**

Track completion rates, average time, drop-off points.

### 6. **Custom Voice Selection**

Let managers choose agent voice/personality.

## Troubleshooting

### Issue: Tool not being called

**Check:**

- Schema instructions mention tool name
- Tool is included in agent creation
- Console logs show history_updated events

### Issue: Duplicate answers

**Check:**

- Deduplication logic is active
- processedToolCallsRef is properly initialized
- Tool call IDs are unique

### Issue: Stale data in tools

**Check:**

- submissionRef.current is being updated
- Tool uses ref, not state closure
- Ref is passed correctly to tool creator

### Issue: Agent rushes through questions

**Check:**

- Schema instructions emphasize WAIT
- VAD settings allow sufficient silence detection
- Agent acknowledges only once per answer
