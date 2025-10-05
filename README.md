# 🚀 ACTA Global Hackathon

## My Project: SurveyAI

SurveyAI is an innovative platform designed to streamline the process of creating and analyzing surveys using conversational AI.

Surveys can be tedious and often yield low engagement rates. SurveyAI transforms this experience by allowing users to interact with surveys through natural voice conversations.

### Architecture

The app runs off Next.js 15 with a React frontend. It uses Clerk for authentication and PostgreSQL with Prisma for database management. The core feature is the voice agent powered by OpenAI's Realtime API, enabling users to complete surveys through spoken dialogue.
The voice agent guides users through the survey questions, captures their responses, and ensures a smooth conversational flow. This approach not only enhances user engagement but also improves the quality of feedback collected.

### Key Features

- **Voice Agent**: Users can complete surveys by speaking, making the process faster and more natural.
- **AI Probing**: The agent can ask follow-up questions to gather more detailed responses
- **Manager Dashboard**: Create and manage surveys, generate access tokens, and view submissions.

### How to run locally

#### Prerequisites

- Node.js (v22+) (https://nodejs.org/)
- Docker (https://www.docker.com/)
- Make (https://www.gnu.org/software/make/)

#### Steps

1. Clone the repo
2. Create an `.env` file in the root directory based on the provided `.env.example` and fill in the required environment variables (Clerk keys, OpenAI key, etc.)
3. Install dependencies
   ```bash
   npm install
   ```
4. Run the app for development:
   ```bash
   make run-dev
   ```
   Or PROD-like:
   ```bash
   make run-start
   ```
5. Open your browser and navigate to `http://localhost:3000`

### How to use

#### As a survey creator:

1. Sign in
2. Create a new survey, follow the flow until you land on the sharable link
3. Share the link with employees

#### As a survey respondent:

1. Click the link shared by your manager
2. Sign in or continue as a guest
3. Interact with the voice agent to complete the survey (Optionally, you can also fill out a traditional form)
4. Submit your responses and see a summary of your answers

**24 hours to build something impressive.**

## ⏰ Timeline

- **Start**: Oct 4, 2025 at 12:00 CET
- **End**: Oct 5, 2025 at 12:00 CET
- **Duration**: 24 hours

## 🏆 Prizes

1. **1st**: One week in Cape Town (flights + hotel)
2. **2nd**: €300 + fast-tracked interview
3. **3rd**: Raspberry Pi + fast-tracked interview

## 💡 What to Build

**Option 1: Build anything you wish existed** (open format - truly anything!)

**Option 2: Choose one of these problem statements:**

### 1. Memory Keeper for Grandparents

Interactive AI conversations that capture grandparents' life memories and turn them into blog posts for family members. Think Duolingo but for preserving family stories and wisdom.

### 2. Graph-Based Learning System

Transform linear course content (like [MIT's Statistics course](https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2022/)) into an interactive graph-based learning experience. Organize concepts as nodes/connections to match how the brain actually learns - accelerating comprehension through visualization and non-linear exploration.

### 3. Agent Orchestration Layer

Build the n8n for AI agents - an orchestration platform for vertical agents to create AI-native companies. Solve context engineering and enable swarm intelligence across agent networks.

**Note**: These are extensive problems - MVPs are perfectly fine and expected!

## 🎯 Rules

- Solo or duo teams
- Greenfield projects only
- Any tech stack
- Must be buildable in 24 hours
- Read [RULES.md](./RULES.md) for anti-cheating requirements

## 🚀 Quick Start

```bash
# 1. Clone this repo
git clone <your-fork-url>
cd global-hackathon-v1

# 2. Create timestamp (REQUIRED for anti-cheating)
date > .hackathon-start
git add .hackathon-start
git commit -m "Starting hackathon - $(date)"
git push

# 3. Build your project here
# 4. Commit regularly (minimum 5 commits)
```

## 📤 Submission

**Deadline**: Oct 5, 2025 at 12:00 CET

**Submit at**: [https://forms.acta.so/r/wMobdM](https://forms.acta.so/r/wMobdM)

**You need**:

1. Public GitHub repo URL
2. 60-second demo video (Loom/YouTube - must be public)
3. Live demo URL (deployed app)
4. Your email and name

## ✅ Before Submitting

```bash
# Run verification
node verify-submission.js
```

Check:

- [ ] GitHub repo is public
- [ ] 60s video is public and accessible
- [ ] Live demo works in incognito window
- [ ] Made 5+ commits during the 24 hours
- [ ] README updated with project info

## 🎬 Judging

**Top 25 submissions** will be ranked 1-10 on each criterion:

### Craft (1-10)

Quality of execution, code quality, attention to detail, polish. Does it work smoothly? Is it well-built? A simple feature done exceptionally well scores higher than complex features done poorly.

### Novelty (1-10)

Originality and innovation. Is this a fresh take? Does it approach the problem differently? Bonus points for ideas that make judges think "why doesn't this exist yet?"

### Utility (1-10)

Practical usefulness and real-world value. Would people actually use this? Does it solve a genuine problem? Could this become a real product?

### Taste (1-10)

Design sensibility, user experience, aesthetic choices. Is it intuitive? Does it feel good to use? Great taste shows in the details - from UI design to interaction patterns to copy writing.

**Final scores** are calculated by summing all four dimensions. Highest total wins.

## 💡 Tips

- Start simple, iterate
- Commit often (proves authenticity)
- Deploy early (Vercel, Netlify, Railway)
- Record demo showing actual functionality
- Read [RULES.md](./RULES.md) to avoid disqualification

## 📞 Support

- **Discord**: [Join](https://discord.gg/9KbH3f5M2a)
- **Instagram**: [@acta.so](https://instagram.com/acta.so)
- **Web**: [acta.so/hackathon](https://www.acta.so/hackathon)

---

**Good luck! 🎉**
