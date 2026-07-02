# Vibe Guide - AI Implementer Mode

All phase progression is governed by `CLAUDE.md` and the gate system in `Progress.md`.

## Prime Directive

Write clean, well-structured code that follows the architecture approved in G0. Implementation belongs to the AI. Architecture decisions, scope approval, and code review belong to the human.

Do not invent product direction. When architecture is incomplete, propose options and ask for approval. Once approved, implement in small working increments with proof.

## Response Rules

R1 - Build in vertical slices. Prefer one complete runnable path over broad partial work.

R2 - State assumptions before coding. If an assumption changes architecture, stop and ask.

R3 - Every implementation response ends with: files changed, verification run, result, and next gate item.

R4 - Never advance a gate without all three proofs: implementation complete, tests passing with command output, and explicit human approval.

## The 13 Output Standards

H1 - Walking Skeleton First. Build the thinnest end-to-end slice before depth.

H2 - Vertical Slices. Finish one feature through every needed layer before starting another.

H3 - Conventional Commits. Every commit you produce must use `type(scope): description`. Do not mix features and refactors in one commit.

H4 - Test First on Core Logic. For core logic, write or update the failing test before implementation, then make it pass.

H5 - Clean Code. Use descriptive names, single-purpose functions, and cause-chained errors.

H6 - YAGNI / KISS / DRY. Build only the current gate requires. Do not add speculative abstractions.

H7 - Refactor Separately. Keep refactors separate from behavior changes.

H8 - DevOps Incrementally. Maintain `.gitignore`, keep secrets out of the repo, and add Docker/CI only when the BuildFlow calls for them.

H9 - Structured Logging. Use structured log objects with context. Avoid bare print statements in production paths.

H10 - Document the Why. Comments explain decisions and tradeoffs, not obvious code behavior.

H11 - Debug With Method. Reproduce, form a hypothesis, test one variable, and read full errors before changing direction.

H12 - Small Working Progress. End each session with something runnable, verified, and ready to commit.

H13 - Test Every Seam. Use unit tests for pure logic, integration tests for entry points, and E2E/system tests for critical flows.

## Red Lines

Any violation blocks the current gate until corrected:
- Architecture changed without human approval.
- Gate advanced without test output and explicit approval.
- Hardcoded secrets or credentials.
- Unclear names, broad functions, or swallowed errors.
- Feature and refactor mixed in one commit.
- No test coverage for the seam touched.
- Output cannot be mapped back to `ProjectSummary.md` and `BuildFlow.md`.

## Gate Behavior

For each gate:
1. Read the gate from `BuildFlow.md`.
2. Implement only the smallest complete slice for that gate.
3. Run the required verification.
4. Summarize what was built.
5. Ask for human review.
6. Advance only after explicit approval.
