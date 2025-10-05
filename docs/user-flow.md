# Survy User Flow Documentation

## Overview

Survy provides two distinct user experiences: Manager Flow for creating and managing surveys, and Employee Flow for submitting survey responses via traditional form or voice agent.

---

## Manager Flow

### 1. **Authentication**

- Manager visits Survy platform
- Signs in using Clerk authentication (Google, email, etc.)
- Redirected to dashboard upon successful login

### 2. **Dashboard Overview**

- View list of existing forms/surveys
- See form statistics (submission count, creation date)
- Access to create new form button
- Navigation to individual form management pages

### 3. **Create New Survey**

#### Step 1: Form Builder

- Click "Create New Form" button
- Enter form title and description
- Add questions using form builder interface:
  - **TEXT type**: Open-ended questions for detailed feedback
  - **LIKERT type**: 1-5 scale for agreement/satisfaction ratings
- Configure each question:
  - Question title (displayed to user)
  - Description (optional clarification)
  - Field key (unique identifier)
  - Required/Optional flag
- Reorder questions via drag-and-drop
- Save form schema

#### Step 2: Form Configuration

- Set form status (Active/Inactive)
- Configure submission settings
- Generate shareable form link
- Generate access tokens for distribution

### 4. **Token Management**

Managers can generate two types of tokens:

#### **Individual Tokens**

- Unique token per employee
- Used for: Targeted distribution, tracking individual responses
- Generation: Click "Generate Token" → Copy → Send to specific employee
- Benefit: Can track who submitted, prevent duplicates per person

#### **Shared Tokens**

- Single token for multiple employees
- Used for: Anonymous surveys, department-wide distribution
- Generation: Click "Generate Shared Token" → Copy → Share with group
- Benefit: Simplifies distribution, maintains anonymity

### 5. **Distribution**

- Copy form link with embedded token
- Share via:
  - Email
  - Slack/Teams message
  - Company intranet
  - QR code (for physical distribution)

### 6. **Monitoring Submissions**

- View submissions table
- See real-time submission count
- Filter by date, employee, completion status
- Export responses to CSV/Excel
- View individual submission details

### 7. **Form Management**

- Edit existing forms (updates apply to future submissions)
- Deactivate forms (prevent new submissions)
- Delete forms (with confirmation)
- Clone forms (reuse structure)

---

## Employee Flow

Employees have **two ways** to complete surveys: Traditional Form or Voice Agent.

---

### Method 1: Traditional Form Submission

#### Step 1: Access Survey

- Receive form link from manager (via email, message, etc.)
- Click link → Redirected to survey page
- If token missing: Prompted to enter access token
- System validates token and loads form

#### Step 2: Token Validation

- System checks if employee has already submitted
- Cookie check: `form_submitted_{formId}_token_{token}`
- If already submitted: Show "Already Submitted" message
- If not submitted: Display form

#### Step 3: Complete Form

- Read each question
- Provide answers:
  - **TEXT questions**: Type response in text area
  - **LIKERT questions**: Select rating from 1-5 scale
- Visual indicators for required fields
- Can save as draft (if implemented)

#### Step 4: Review & Submit

- Review all answers
- Click "Submit Survey" button
- Form validation checks:
  - All required fields completed
  - Valid data types
  - No empty submissions

#### Step 5: Confirmation

- Success message displayed
- Cookie set to prevent resubmission (expires in 1 year)
- Thank you page with confirmation
- Optional: Redirect to company homepage

---

### Method 2: Voice Agent Submission

The voice agent provides a conversational, hands-free survey experience.

#### Step 1: Access Survey & Start Voice Agent

- Employee clicks form link with token
- Survey page loads with two options:
  - "Fill Form Manually" (traditional method)
  - "Start Voice Survey" (AI agent method)
- Click "Start Voice Survey" button
- Browser requests microphone permission
- Grant permission → Agent connection begins

#### Step 2: Agent Connection

**User sees:**

- "Connecting..." indicator with loading spinner
- Status: "Establishing connection to voice agent..."

**Behind the scenes:**

- System fetches ephemeral OpenAI token
- Generates schema instructions from form
- Creates RealtimeAgent with tools
- Establishes WebSocket connection
- Server VAD (Voice Activity Detection) activated

**Connection successful:**

- Status changes to "Connected"
- Green indicator appears
- Microphone icon shows active
- Agent begins greeting

#### Step 3: Greeting & Introduction

**Agent says:**

> "Hi! I have a few questions about your experience here. Let's get started!"

**User:**

- Listens to greeting
- Prepares to answer questions

**UI displays:**

- Real-time transcription of agent's speech
- Visual indicator when agent is speaking
- Microphone active indicator

#### Step 4: Question & Answer Cycle

For each question in the survey:

##### **TEXT Questions (Open-ended)**

**Agent asks:**

> "Tell me, what do you enjoy most about your work here?"

**User speaks:**

> "I really love collaborating with my team on challenging projects. The creative problem-solving aspect is very fulfilling."

**Agent behavior:**

- Waits for user to finish (VAD detects 500ms silence)
- If answer too brief ("good", "fine"):
  > "Could you tell me more about that?"
  - Waits for expanded answer
- If answer substantial:
  - Silently calls `update_submission(key, value)`
  - Acknowledges: "Got it, thanks!"
  - Moves to next question

**UI feedback:**

- User's speech transcribed in real-time
- Answer appears in submission preview
- Progress indicator updates

##### **LIKERT Questions (1-5 Scale)**

**Agent asks:**

> "I'd like to hear your thoughts on this: 'The company provides good benefits.' On a scale of 1 to 5, where 1 means you strongly disagree and 5 means you strongly agree, how would you rate that?"

**User speaks:**

> "I'd say a 4."

**Agent behavior:**

- Immediately calls `update_submission(key, "4")`
- Optionally asks follow-up: "What influenced your rating?"
- Listens to explanation (for context, not recorded separately)
- Acknowledges: "Thanks!"
- Moves to next question

**UI feedback:**

- Number recorded in submission preview
- Follow-up response shown in transcript (not saved)
- Progress indicator updates

#### Step 5: Quality Control

The agent ensures quality responses:

**If user gives minimal answer:**

- **User:** "Good."
- **Agent:** "That's great! Could you tell me a bit more about that?"
- **User:** [Provides more detail]
- Agent records the fuller response

**If user seems to skip:**

- Agent gently redirects: "Let me make sure I have your answer to this question..."

**If user interrupts:**

- VAD handles natural conversation flow
- Agent pauses when user starts speaking

#### Step 6: Progress Tracking

**Throughout conversation:**

- UI shows:
  - Questions completed: "3 of 8"
  - Current submission data
  - Transcript of conversation
  - Visual progress bar

**User can:**

- See their answers in real-time
- Confirm agent is recording correctly
- Track how many questions remain

#### Step 7: Completion & Confirmation

**After all questions answered:**

**Agent says:**

> "Perfect! Just to confirm, everything looks good to you?"

**User responds:**

> "Yes, looks good!" or "Actually, can I change my answer to question 2?"

**If user confirms:**

- Agent proceeds to submission

**If user wants changes:**

- [Future feature: Agent allows editing specific answers]
- Currently: Agent proceeds if user ultimately confirms

#### Step 8: Submission

**Agent says:**

> "Great! Let me submit your responses."

**Behind the scenes:**

- Agent calls `submit_form()` tool
- Tool executes `handleSubmit()` callback
- Server action validates and saves to database
- Cookie set: `form_submitted_{formId}_token_{token}=true`
- Expires: 1 year (prevents resubmission)

**Success:**

- **Agent says:** "Thank you! Your feedback has been submitted successfully."
- 2-second delay
- Session automatically disconnects
- UI shows: "Submission Successful ✓"
- Thank you message displayed

**Failure:**

- **Agent says:** "I apologize, there was an error. Please try using the manual form."
- Session remains connected
- User can disconnect and use traditional form
- Error logged for debugging

#### Step 9: Disconnection

**Automatic disconnection (after successful submission):**

- Agent says goodbye
- 2-second delay
- WebSocket closes gracefully
- Microphone access released
- UI returns to "Disconnected" state

**Manual disconnection (user clicks "Disconnect"):**

- User clicks red "Disconnect" button anytime
- Confirmation: "Are you sure? Progress will be lost."
- If confirmed:
  - Session closes immediately
  - Partial answers NOT saved
  - User can restart or use manual form

#### Step 10: Post-Submission

**User sees:**

- "Submission Successful" page
- Confirmation message
- Option to view copy of their responses (if enabled)
- Return to homepage link

**System behavior:**

- Cookie prevents resubmission
- If user visits link again: "You have already submitted this survey"
- Submission data saved to database
- Manager can view response in dashboard

---

## Voice Agent Special Features

### 1. **Natural Conversation**

- No rigid scripting
- Agent uses varied phrases
- Empathetic acknowledgments
- Conversational tone (not robotic)

### 2. **Quality Probing**

- Detects brief/vague answers
- Gently asks for elaboration
- Ensures substantive feedback
- Improves survey data quality

### 3. **Hands-Free Experience**

- No typing required
- Perfect for:
  - Mobile users
  - Users with accessibility needs
  - Multitasking scenarios
  - Typing-averse respondents

### 4. **Real-Time Feedback**

- See transcription instantly
- Verify answers as you go
- Visual progress tracking
- Transparent process

### 5. **Error Recovery**

- Connection issues: Auto-reconnect attempt
- Microphone problems: Clear error messages
- Submission failures: Fallback to manual form
