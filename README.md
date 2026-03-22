# Likit — Lightweight Agentic Workflow

A gated mentoring system for [Claude Code](https://docs.anthropic.com/en/docs/claude-code). Claude acts as a senior engineer who guides you through building a project from scratch. It never writes your code — it questions, reviews, and teaches until you can build without it.

Built for students learning to code professionally.

---

## Context Window Footprint

These workflow files consume about 1–1.5% of Sonnet 4.6's 200k token context window (~2,000–2,500 tokens after setup). Claude Code's own system prompt and tool definitions take another 5,000–8,000 tokens. That leaves roughly 190k tokens for actual project work — reading your source files, discussing code, and holding conversation history.

The real constraint is never the workflow files. It is conversation length. As a session grows with back-and-forth messages, code reads, and tool outputs, those accumulate far faster than the workflow files do. The files were optimised for signal density — fewer irrelevant instructions means Claude reaches the ones that matter faster.

---

## How to Use

### Requirements

- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) installed and authenticated
- A terminal open in the project directory

### Getting Started

1. Clone or copy this template into your project folder.
2. Open a terminal in that folder and run `claude`.
3. Claude reads `CLAUDE.md` automatically and starts the setup questionnaire (G0).
4. Answer the questions. Claude will not move forward until each sub-gate passes.
5. Once G0 completes, your project files are generated and you begin building phase by phase.

### Commands

Run these in the Claude Code prompt at any time.

| Command | What it does |
|---------|-------------|
| `/phase-check` | Quick status — current phase, what is done, what is next, first command to run |
| `/progress-log` | Detailed report — all completed phases, blockers, next steps, overall percentage |
| `/progress-save` | Saves current session progress to Progress.md |
| `/phase-explain` | Deep explanation of the current phase — concepts, patterns, checkpoints, common traps |
| `/step-explain` | Deep explanation of a single checkpoint step — why it exists, how to verify it, what mistakes to avoid |

---

## How the Workflow Works

The entire workflow is a sequence of gates. Each gate has checkboxes. Every checkbox requires proof — a command output, a test result, a demonstration. Nothing moves forward until every box is checked.

**Gate 0 (G0)** is the project setup questionnaire. It asks about your project, your experience, your stack, and your constraints. It critiques your answers, cross-checks for gaps, then generates all your project files from a single manifest.

**Gates 1–17 (G1–G17)** are the build phases. Each phase produces one piece of the project. The naming is simple: G1 = P1, G2 = P2, and so on. G is the gate, P is the phase — same thing, two labels.

Claude enforces 13 professional habits throughout. Violating any of them blocks the current gate.

| # | Habit | What it means |
|---|-------|---------------|
| H1 | Walking Skeleton First | Prove the system works end-to-end with the thinnest possible slice before adding depth. |
| H2 | Vertical Slices | Complete one feature through every layer before starting the next. |
| H3 | Conventional Commits | `type(scope): description` format. Imperative mood, under 72 characters. Feature branches only. |
| H4 | Test First on Core Logic | Write the failing test before writing the function. Red, green, refactor. |
| H5 | Clean Code (Names, Functions, Errors) | Descriptive names, single-responsibility functions, cause-chained error handling. |
| H6 | YAGNI / KISS / DRY | Build only what the current phase needs. No speculative features, no premature abstractions. |
| H7 | Refactor in a Separate Commit | Never mix a refactor with a feature. Keeps code review possible. |
| H8 | DevOps Incrementally | `.gitignore` and branching from day one. Secrets never in the repo. Docker and CI when needed. |
| H9 | Structured Logging | Log objects with context (route, user ID, action). No bare print statements. |
| H10 | Document the Why | Comments explain decisions and tradeoffs, not what the code does. |
| H11 | Debug With Method | Reproduce, hypothesise, test one variable, read the full stack trace. No guessing. |
| H12 | Small Working Progress | Every session ends with something that runs and is committed. |
| H13 | Test Every Seam | Unit tests for pure logic, integration tests for entry points, E2E for critical flows. |

---

## File Map

```
project/
├── CLAUDE.md                          # Master control — read every session
├── README.md                          # This file
├── claude/
│   ├── Claude_guide.md                # Mentor rules, 13 habits, red lines
│   ├── BuildFlow.md                   # 17 phases with checkboxes and proof requirements
│   ├── Progress.md                    # Checkpoint tracker — source of truth for gate state
│   ├── ProjectSummary.md              # Architecture, models, structure (generated by G0)
│   ├── G0_questionnaire.md            # Setup questionnaire spec (loaded only during G0)
│   ├── _fill_manifest.md              # Intermediate data store used during G0.6
│   ├── ProjectSummary_web.md          # Template — deleted after G0
│   ├── ProjectSummary_systems.md      # Template — deleted after G0
│   └── ProjectSummary_creative.md     # Template — deleted after G0
└── .claude/
    └── commands/
        ├── phase-check.md
        ├── progress-log.md
        ├── progress-save.md
        ├── phase-explain.md
        └── step-explain.md
```

---

## What Each File Does

### CLAUDE.md
The entry point. Claude reads this every session. It defines the gate system, the G0 status check, the session start procedure, and the gate pass protocol. It tells Claude which files to load and when. Everything else flows from here.

### Claude_guide.md
The mentor rulebook. Contains the prime directive (never write code for the student), four response rules, 13 professional habits with enforcement actions, and red lines that block gates on violation. Loaded every session.

### BuildFlow.md
The build plan. 17 phases, each with a goal, checkboxes, and a proof line. Loaded on demand when entering a new phase. After G0 completes, every phase is filled with project-specific goals and proofs.

### Progress.md
The tracker. Mirrors BuildFlow's checkboxes but tracks state — not started, in progress, complete. This is the source of truth for which gate is current. Updated by `/progress-save`.

### ProjectSummary.md
The architecture reference. Contains your tech stack, data models, file structure, API routes or entry points, and environment variables. Generated during G0 from one of three templates (web, systems, or creative). Read every session so Claude understands what you are building.

### G0_questionnaire.md
The setup questionnaire specification. Six sub-gates that collect your project identity, developer profile, architecture, features, constraints, and then critique everything before generating files. Loaded only while G0 is incomplete. Never touched again after G0 passes.

### _fill_manifest.md
A flat key-value document that G0.6 fills with every answer from the questionnaire. Claude generates all other files from this manifest. It stays in the repo as a reference — never deleted.

### ProjectSummary templates
Three category-specific templates (web, systems, creative). G0.3 detects your project category. G0.6 fills the matching template and deletes the other two.

---

## How the Files Talk to Each Other

```
CLAUDE.md (master control)
  │
  ├── reads Claude_guide.md, ProjectSummary.md, Progress.md every session
  ├── loads BuildFlow.md on demand (new phase or /phase-check)
  ├── loads G0_questionnaire.md on demand (only during G0)
  │
  └── G0 questionnaire
        │
        ├── collects answers → writes _fill_manifest.md
        │
        └── _fill_manifest.md (single source of truth)
              │
              ├── generates ProjectSummary.md (from category template)
              ├── generates Claude_guide.md (fills developer profile, scopes, red lines)
              ├── generates BuildFlow.md (fills phase goals, checkboxes, proofs)
              └── generates Progress.md (fills phase names and checkboxes)
```

After G0, the flow is straightforward. Each session:

1. Claude reads the three core files (guide, summary, progress).
2. It determines the current gate from Progress.md.
3. It works on that gate only.
4. When all checkboxes pass with proof, it advances to the next gate.
5. BuildFlow.md is consulted when entering a new phase for its specific requirements.

The commands (`/phase-check`, `/progress-log`, etc.) are shortcuts that read these same files and produce structured reports or updates.

---

## Project Categories

G0.3 classifies your project into one of three categories. This determines which template, question set, and cross-checks are used.

| Category | When it applies |
|----------|----------------|
| **web** | Frontend + backend + database. SPAs, full-stack apps, API-only projects with a database. |
| **systems** | No browser UI. CLI tools, scripts, pipelines, libraries, batch jobs, background services. |
| **creative** | Game engines, mobile frameworks, desktop GUI frameworks. |

---

## License

MIT License. See [LICENSE](LICENSE).
