Bootstrap the planning files from `prompt.md`.

1. Read `prompt.md` at the project root. If it is missing, tell the user to run `npx likit init` (or create `prompt.md` with their specification) and stop.
2. Follow the Instruction section in `prompt.md`: use the Project Specification to populate `ProjectSummary.md`, `BuildFlow.md`, and `Progress.md` with content derived from the spec. Fill every section with real, project-specific content. Leave no placeholder text.
3. This is planning, not implementation. Propose the architecture and phase plan the spec implies; do not start writing feature code until the human approves the plan and a gate is active.
4. If the specification is missing something a planning file needs, ask the user rather than inventing it.
5. Confirm which planning files were updated and state which gate is now active.
