# Survy Voice Agent Documentation

Welcome to the Survy voice agent documentation. This folder contains comprehensive guides for understanding, using, and maintaining the voice-powered survey system.

## 📚 Documentation Structure

### 1. [Voice Agent Architecture](./voice-agent-architecture.md)

**Technical deep-dive into the system architecture**

Topics covered:

- High-level system architecture diagram
- Core components (useVoiceAgent hook, Agent Factory, Schema Template, Tools)
- Data flow (connection, answer recording, submission)
- Key design decisions and rationale
- State management (React state, refs, deduplication)
- Error handling and recovery
- Performance considerations
- Security and privacy
- Future enhancements
- Troubleshooting guide

**Audience:** Developers, Technical Leads, System Architects

### 2. [User Flow](./user-flow.md)

**End-to-end user experience documentation**

Topics covered:

- Manager flow (creating surveys, token management, distribution)
- Employee flow - Traditional form submission
- Employee flow - Voice agent submission (detailed step-by-step)
- Comparison between voice and traditional methods
- Real-world usage examples
- Accessibility features
- Best practices for managers and employees
- Troubleshooting common issues
- Privacy and data handling

**Audience:** Product Managers, UX Designers, End Users, Training Teams

### 3. [Agent Structure](./agent-structure.md)

**AI agent behavior, prompts, and conversation design**

Topics covered:

- Agent configuration and settings
- Dynamic prompt generation structure
- Personality and tone guidelines
- Conversation flow state machine
- Question type handling (TEXT, LIKERT)
- Quality control mechanisms
- Tool invocation logic
- Error handling and recovery strategies
- Prompt engineering best practices
- Behavioral constraints (do's and don'ts)
- Performance optimization
- Testing and validation
- Future AI enhancements

**Audience:** AI/ML Engineers, Prompt Engineers, Conversation Designers

---

## 🚀 Quick Start

### For Developers

1. Read [Voice Agent Architecture](./voice-agent-architecture.md) first
2. Understand the tool execution model and deduplication logic
3. Review troubleshooting section for common issues

### For Product/UX Teams

1. Start with [User Flow](./user-flow.md)
2. Understand both manager and employee experiences
3. Review accessibility features and best practices

### For AI/Conversation Designers

1. Read [Agent Structure](./agent-structure.md)
2. Understand prompt engineering strategies
3. Review quality control mechanisms and behavioral constraints

---

## 🏗️ System Overview

**What is Survy?**

Survy is an employee satisfaction survey platform that allows companies to collect feedback through both traditional forms and AI-powered voice conversations.

**Key Innovation:**

The voice agent feature enables employees to complete surveys through natural spoken conversation, dramatically improving:

- **Engagement:** Conversational format feels more natural
- **Speed:** Speaking is faster than typing
- **Accessibility:** Perfect for mobile users and accessibility needs
- **Quality:** AI probing ensures detailed, thoughtful responses

**Technology Stack:**

- Frontend: Next.js 15, React 19, TypeScript
- Voice AI: OpenAI Realtime API (gpt-4o-mini-realtime-preview)
- Authentication: Clerk
- Database: PostgreSQL with Prisma
- UI: Tailwind CSS + shadcn/ui components

---

## 📊 Architecture at a Glance

```
┌─────────────────────────────────────────────────────────┐
│                    Survy Platform                        │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Manager Dashboard                Employee Experience    │
│  ├─ Create Forms                  ├─ Traditional Form   │
│  ├─ Generate Tokens               └─ Voice Agent        │
│  └─ View Submissions                  ↓                  │
│                                   ┌───────────────┐      │
│                                   │ useVoiceAgent │      │
│                                   │     Hook      │      │
│                                   └───────┬───────┘      │
│                                           │              │
│                              ┌────────────┼────────────┐ │
│                              │            │            │ │
│                         Agent Factory  Schema      Tools │
│                              │       Template        │ │
│                              └────────────┼────────────┘ │
│                                           │              │
│                              ┌────────────▼────────────┐ │
│                              │  OpenAI Realtime API   │ │
│                              │  (WebSocket)           │ │
│                              └────────────────────────┘ │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Features

### Voice Agent Capabilities

- ✅ Natural conversation flow
- ✅ Quality probing for detailed responses
- ✅ Support for TEXT and LIKERT question types
- ✅ Real-time transcription display
- ✅ Automatic submission on completion
- ✅ Duplicate answer prevention
- ✅ Error recovery and fallback to manual form

### Traditional Form

- ✅ Standard form interface
- ✅ Field validation
- ✅ Save and resume (planned)
- ✅ Mobile responsive
- ✅ Accessibility compliant

### Manager Features

- ✅ Drag-and-drop form builder
- ✅ Individual and shared token generation
- ✅ Real-time submission monitoring
- ✅ Export to CSV/Excel
- ✅ Form versioning

---

## 🔧 Technical Highlights

### 1. Hybrid Tool Execution Model

Different tools use different execution patterns for optimal performance:

- `update_submission`: Manual processing in history handler (reliable React state)
- `validate_submission`: Invoke method (currently disabled)
- `submit_form`: Invoke method (immediate callback execution)

### 2. Deduplication Logic

Prevents duplicate tool call processing that could cause question skipping:

```typescript
const toolCallId = `${name}_${key}_${value}`;
if (processedToolCallsRef.current.has(toolCallId)) return;
```

### 3. Dynamic Prompt Generation

Agent instructions generated from form schema at runtime:

```typescript
const schemaDescription = generateSchemaDescription(schema);
const schemaInstructions = generateSchemaInstructions(schemaDescription);
```

### 4. Voice Activity Detection (VAD)

Server-side VAD for natural turn-taking:

```typescript
{
  type: "server_vad",
  threshold: 0.5,
  silenceDurationMs: 500
}
```

---

## 📈 Performance Metrics

**Target Metrics:**

- Survey completion time: 3-5 minutes (8 questions)
- Agent response latency: <2 seconds
- Completion rate: >90%
- Cost per survey: ~$0.02 (voice agent)

**Quality Metrics:**

- Probing rate: 20-30% of questions
- Average answer length: >100 characters (TEXT)
- User satisfaction: >4.5/5

---

## 🔒 Security & Privacy

- Ephemeral tokens for API access (short-lived)
- Voice audio transmitted encrypted (TLS)
- Audio not permanently stored
- Token-based form access control
- Cookie-based resubmission prevention
- Server-side validation on all submissions

---

## 🐛 Common Issues & Solutions

### Issue: Agent not calling update_submission

**Solution:** Check schema template instructions, verify tool is registered

### Issue: Duplicate answers

**Solution:** Deduplication logic active, check processedToolCallsRef

### Issue: Agent rushing through questions

**Solution:** Schema instructions emphasize WAIT, check VAD settings

### Issue: Connection lost

**Solution:** Auto-reconnect implemented, fallback to manual form

See [Architecture doc](./voice-agent-architecture.md#troubleshooting) for full troubleshooting guide.

---

## 🚧 Known Limitations

1. **Validation disabled**: Temporarily disabled due to state synchronization issues
2. **No answer editing**: Users can't go back to change previous answers (yet)
3. **Progress not saved**: If connection lost, progress is not saved
4. **English only**: Multi-language support planned
5. **No interruption handling**: User can't interrupt agent mid-sentence (yet)

---

## 📖 Related Resources

### External Documentation

- [OpenAI Realtime API Docs](https://platform.openai.com/docs/guides/realtime)
- [Next.js Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [Clerk Authentication](https://clerk.com/docs)

### Internal Resources

- `/lib/voice-agent/` - Core voice agent code
- `/hooks/use-voice-agent.ts` - Main hook
- `/components/submission/` - Submission UI components
- `/app/actions/submission-actions.ts` - Server actions

---
