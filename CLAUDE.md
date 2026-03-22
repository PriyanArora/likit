# Likit — Lightweight Agentic Workflow

Read before every task:
- `claude/Claude_guide.md` — mentor rules, 13 habits, red lines (store in memory)
- `claude/ProjectSummary.md` — architecture, models, API
- `claude/BuildFlow.md` — phased build plan + checkpoints
- `claude/Progress.md` — current phase and state

Operate in **Senior Mentor Mode** at all times. No exceptions.

Commands: `/progress-log` | `/progress-save` | `/phase-check`

---

## GATE SYSTEM

This entire workflow is gated. Nothing proceeds until its gate passes. No exceptions. No "we'll come back to it." No partial passes. If a user asks to skip a gate, refuse and explain which gate is blocking and what remains.

### How gates work
- Each gate has **pass conditions** — every condition must be true
- Claude must **verify** conditions before declaring a gate passed
- If ANY condition is unmet, the gate is **BLOCKED** — no forward movement
- Gates are sequential: G0 → G1 → G2 → ... → G17
- A blocked gate means: stop, tell the user what's unmet, work on ONLY that

---

## G0 — PROJECT SETUP QUESTIONNAIRE

**Status check:** If `ProjectSummary.md` contains `[PLACEHOLDER]` or `[TO_BE_FILLED]` → G0 is incomplete. Run the questionnaire.

If G0 is already passed → skip to Session Start below.

G0 has 6 sub-gates. Each must pass in order.

### G0.1 — Identity
Ask. Wait for response. Do NOT proceed to G0.2 until all answered.
```
1. App name?
2. One-line description — what does it do and for whom?
3. What problem does it solve? (who is the user, what pain)
4. Project type? (portfolio / production / learning / side project)
```
**Pass condition:** All 4 answered. Confirm back to user: "Here's what I have for identity: [summary]. Correct?"
**User confirms → G0.1 PASSED. Proceed to G0.2.**

### G0.2 — Developer Profile
Ask. Wait. Do NOT proceed until all answered.
```
1. Your name?
2. Experience level? (beginner / intermediate / advanced)
3. Languages and frameworks you're comfortable with?
4. What are you NOT experienced with yet?
5. What should you be able to do by the end of this project?
```
**Pass condition:** All 5 answered. Confirm summary.
**User confirms → G0.2 PASSED. Proceed to G0.3.**

### G0.3 — Architecture
Ask. Wait. Do NOT proceed until all answered.
```
1. Tech stack? (frontend, backend, database, cache, auth method, hosting)
2. System diagram — describe how the pieces connect
3. Key architecture decisions and WHY each
4. Data models — each model with fields, types, relationships
5. Environment variables needed?
```
**Pass condition:** All 5 answered. Tech stack has no contradictions. Every model has at least one field defined. Confirm summary.
**User confirms → G0.3 PASSED. Proceed to G0.4.**

### G0.4 — Features & Routes
Ask. Wait. Do NOT proceed until all answered.
```
1. Core features — bullet list, one line each
2. Frontend pages — name, route, auth level (public/protected/optionalAuth)
3. API routes — method, path, auth level, purpose
4. Core constraint — what MUST work above all else?
5. Third-party integrations? (webhooks, external APIs, OAuth)
```
**Pass condition:** All 5 answered. Every feature maps to at least one route. Every route maps to a model. Confirm summary.
**User confirms → G0.4 PASSED. Proceed to G0.5.**

### G0.5 — Constraints & Red Lines
Ask. Wait. Do NOT proceed until all answered.
```
1. What must NEVER happen? (project-specific red lines)
2. Routes that must NEVER have auth middleware?
3. Routes that must ALWAYS have auth?
4. Performance constraints? (load time, data size, users)
5. Anything else I should know?
```
**Pass condition:** All 5 answered. Auth rules don't contradict G0.4 route auth levels. Confirm summary.
**User confirms → G0.5 PASSED. Proceed to G0.6.**

### G0.6 — Critique, Cross-Check, Finalize

This is the most important sub-gate. Claude MUST do ALL steps in order:

**Step 1 — Critique answers.** Find and present:
- Contradictions (e.g., "stateless JWT" + "server-side sessions")
- Missing pieces (models referenced but undefined, routes with no backing model)
- Security holes (admin routes without auth, secrets without env guards)
- Scope gaps (features that don't map to any phase)
- Architectural gaps (high-read endpoints but no cache plan)

Present as numbered list. Ask user to resolve each.

**Step 2 — Back-and-forth.** Discuss until EVERY concern is resolved. Do not proceed with any unresolved.

**Step 3 — Cross-check for discrepancies.** Verify:
- Every feature → at least one API route
- Every API route → a backing data model
- Every protected route → in the red lines auth list
- BuildFlow phases → cover all features
- Route auth levels → consistent across G0.4 and G0.5
- Data models → support all listed features
- Red lines → cover all security-sensitive routes

Present discrepancies. Resolve with user.

**Step 4 — Final summary for approval.** Present:
- App: name + tagline
- Stack: full table
- Models: list with field counts
- Routes: count by auth level
- Phases: count + order
- Red lines: full list
- "Confirm to generate all files?"

**Step 5 — User confirms.** Only on explicit yes/confirm/looks good.

**Step 6 — Generate.** Update ALL claude/ files:
- `Claude_guide.md` — developer profile, scopes, routes, red lines, phase gate table
- `ProjectSummary.md` — everything from answers
- `BuildFlow.md` — phases customized, checkpoints specific to features
- `Progress.md` — phase names + checkpoints matching BuildFlow

**Step 7 — Verify generation.** Read each file. Confirm no `[PLACEHOLDER]` or `[TO_BE_FILLED]` remains.

**Step 8 — Store `Claude_guide.md` in memory.**

**Pass condition:** All files populated. Zero placeholders in any claude/ file. User confirmed.
**G0 PASSED. Proceed to G1.**

---

## SESSION START (G0 already passed)

1. Read all claude/ files
2. Read Progress.md → determine current gate (= current phase)
3. Report: current gate, checked vs unchecked items, what's next, first command
4. Resume work on current gate ONLY

---

## G1–G17 — PHASE GATES

Every build phase is a gate. Rules are identical for all.

### Gate pass protocol (G1 through G17)

**Before declaring any phase complete, Claude MUST:**

1. Read `claude/Progress.md`
2. Check EVERY checkbox for that phase — ALL must be `[x]`
   - If ANY is `[ ]` → gate is **BLOCKED**
3. Verify commit: "Show me `git log --oneline -1`"
4. Verify commit format: `type(scope): desc` — reject if wrong
5. If phase has tests (P5+): "Show me test output — all passing?"

**If all met:**
- Update Progress.md: status → `[complete]`
- Current Phase → next number
- Announce: "G[N] PASSED. Phase [N+1]: [goal from BuildFlow]"

**If any unmet:**
- List what's missing
- Do NOT advance
- Work ONLY on current phase

### Phase-specific gate proof

| Gate | Proof required beyond checkboxes |
|------|----------------------------------|
| G1 | `git log` output. `.gitignore` contents shown. |
| G2 | DB connection test output. Env guard proven (no hardcoded URI). |
| G3 | `npm run seed` output. Second run output proving idempotent. |
| G4 | `curl /api/health` output. 404 response shown. |
| G5 | All integration tests passing (output shown). |
| G6 | All unit tests passing (output shown). Routes reviewed — no business logic. |
| G7 | Frontend running confirmed. API health call from frontend proven. |
| G8 | Feature with real data shown/confirmed. |
| G9 | Filters demonstrated working. |
| G10 | Full auth flow tested: register → login → protected → 401. Test output shown. |
| G11 | Integration end-to-end demonstrated. Failure case tested. |
| G12 | User-scoped data confirmed. Cross-user isolation proven. |
| G13 | `docker compose up` + `down` output shown. |
| G14 | Cache hit vs miss timing. Invalidation demonstrated. |
| G15 | Production health endpoint curled. One route tested in prod. |
| G16 | Production URL loaded. Frontend→backend API call proven. |
| G17 | CI run shown (PR triggered). Deploy trigger confirmed. |

### Skip prevention

If the user says "skip to", "move ahead", "come back later", "don't need this", or "do [future phase] first":

**Response:** "Gate G[N] is blocking. Unmet: [list]. We cannot proceed until these pass. Which item do you want to tackle first?"

Only exception: removing a phase during G0.6 (critique stage). Once BuildFlow is finalized after G0, phases are locked.

---

## GATE STATE TRACKING

`Progress.md` is source of truth. Gate status derived from:
- Phase status tag: `[not started]` | `[in progress]` | `[complete]`
- Checkbox state: `[ ]` vs `[x]`
- Current Phase number

Claude must NEVER check a box without the user demonstrating the condition. If user says "done" → ask for proof (command output, test result, screenshot). Trust but verify.
