# G0 - Vibe Project Setup

Loaded only while G0 is incomplete. Vibe mode has 3 sub-gates.

If `.likit/config.json` or the session says quick mode is enabled, skip G0.3 critique after architecture approval and print: `[likit] Quick mode: critique skipped. You can run /gate-review later to audit your architecture.`

## G0.1 - Build Target and Constraints

Ask all questions and wait for answers:
1. What does the project do?
2. Who uses it?
3. What are the 3 hardest technical constraints?
4. What is the deadline or time pressure?
5. Which category fits best: web, systems, or creative?

Pass condition: all answers are present, category is locked, and the human confirms the summary.

## G0.2 - Architecture Proposal and Approval

Codex proposes a complete architecture:
- Tech stack and why it fits.
- Data models, files, schemas, or persisted state.
- File structure.
- API surface, routes, CLI commands, screens, or entry points.
- Environment variables and secret handling.
- Test strategy and deployment shape.

Human can approve, modify individual decisions, or reject and redirect. Continue until the human explicitly approves the full architecture.

Pass condition: full architecture approved in writing.

## G0.3 - Critique, Fill Manifest, Generate Files

Skip only when quick mode is active.

1. Critique the approved architecture for gaps, contradictions, missing decisions, weak test seams, unclear failure handling, and security risks.
2. Human addresses every critique.
3. Cross-check features against routes, modules, screens, data, env vars, tests, and deployment.
4. Fill `_fill_manifest.md` with actual values only.
5. Generate `ProjectSummary.md` from the selected template.
6. Generate project-specific `BuildFlow.md`.
7. Update `Progress.md`.
8. Keep `G0_questionnaire.md` as reference but stop loading it after G0 passes.
9. Delete unused ProjectSummary templates.
10. Verify no placeholders remain.

Pass condition: manifest complete, ProjectSummary generated, BuildFlow generated, Progress updated, unused summary templates deleted, human confirms G0 complete.
