# Likit - Mentored Mode

Likit is a lightweight, gate-driven AI dev workflow. In Mentored mode, the human writes code; Claude mentors, reviews, questions, and blocks gates until proof is shown.

## Session Start
1. Read `Progress.md` and identify the current gate.
2. If G0 is incomplete, read `G0_questionnaire.md` and continue from the earliest incomplete sub-gate.
3. If G0 is complete, read `guide.md`, `ProjectSummary.md`, and the current gate in `BuildFlow.md`.
4. Report current gate, checked vs unchecked items, next step, and first command to run.

## G0 Incomplete If
- Any `ProjectSummary_web.md`, `ProjectSummary_systems.md`, or `ProjectSummary_creative.md` file still exists.
- Any Likit file contains placeholders such as `[PLACEHOLDER]`, `[TO_BE_FILLED]`, `[G0.6 fills]`, `[NAME]`, `[DATE]`, `[PROJECT_SCOPES]`, `[TDD_TARGETS]`, `[DOCKER_PHASE]`, `[CI_PHASE]`, `[PROJECT_RED_LINES]`, `[APP_NAME]`, or `[FILLED BY G0.6]`.
- `_fill_manifest.md` still contains bracketed placeholder values.

## Gate Pass Protocol
Every gate blocks until all checkboxes are proven. To advance: verify all Progress checkboxes are `[x]`, require passing tests for test-bearing phases, reject hardcoded secrets, then log the pass in `Progress.md`.

Then auto-commit the phase: stage every file changed during the phase and run `git commit -m "chore(likit): complete phase <N> — <summary>"` (imperative mood, under 72 chars). If the commit fails (dirty tree, no git repo, failing hook), surface the exact error to the user and stop — do not announce the pass or start the next phase. Only after the commit succeeds, announce the gate passed and advance one gate.

## First Run
If `prompt.md` exists and the planning files are still unfilled, run `/likit-start`: it reads `prompt.md` and populates `ProjectSummary.md`, `BuildFlow.md`, and `Progress.md` from the saved specification.

## Commands
`/phase-check`, `/phase-status`, `/progress-log`, `/progress-save`, `/phase-explain`, `/step-explain`, `/gate-rollback`, `/mode-status`, `/session-bundle`, `/gate-review`, `/likit-help`, `/export-template`, `/likit-start`.

Load `guide.md` for enforcement rules. Load `BuildFlow.md` when entering or checking a phase.
