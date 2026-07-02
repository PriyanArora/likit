# Likit - Vibe Mode

Likit is a lightweight, gate-driven AI dev workflow. In Vibe mode, Codex implements; the human directs architecture and reviews output.

Codex automatically discovers project instructions from `AGENTS.md`. Treat this as the compact entry point and load referenced Likit files only when needed.

## Session Start
1. Read `Progress.md` and identify the current gate.
2. If G0 is incomplete, read `G0_questionnaire.md` and continue from the earliest incomplete sub-gate.
3. If G0 is complete, read `guide.md`, `ProjectSummary.md`, and the current gate in `BuildFlow.md`.
4. Report current gate, unchecked proof items, next implementation slice, and verification command.

## G0 Incomplete If
- Any `ProjectSummary_web.md`, `ProjectSummary_systems.md`, or `ProjectSummary_creative.md` file still exists.
- Any Likit file contains placeholders such as `[PLACEHOLDER]`, `[TO_BE_FILLED]`, `[G0 fills]`, `[APP_NAME]`, or `[FILLED BY G0]`.
- `_fill_manifest.md` still contains bracketed placeholder values.

## Gate Pass Protocol
Every gate blocks until three proofs are present:
1. Implementation complete - summarize what was built.
2. Tests passing - paste or cite command output.
3. Human review passed - human explicitly approves.

Then update `Progress.md` and auto-commit the phase: stage every file changed during the phase and run `git commit -m "chore(likit): complete phase <N> — <summary>"` (imperative mood, under 72 chars). If the commit fails (dirty tree, no git repo, failing hook), surface the exact error to the user and stop — do not advance. Only after the commit succeeds, advance one gate.

## First Run
If `prompt.md` exists and the planning files are unfilled, the user says "read prompt.md and populate the planning files." Use the saved spec to fill `ProjectSummary.md`, `BuildFlow.md`, and `Progress.md`, then report the active gate.

## Requests
Codex does not load slash commands. Ask in plain language; honour: show phase status; explain this phase/step; save progress or full progress report; roll back the last gate; show mode/config; regenerate the session bundle; review architecture; list commands; export template; read prompt.md and populate the planning files.

Load `guide.md` for output standards. Load `BuildFlow.md` when entering or checking a phase.
