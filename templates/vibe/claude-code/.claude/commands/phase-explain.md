Read Progress.md, BuildFlow.md, guide.md, and ProjectSummary.md.

Identify the current phase from Progress.md. Produce a deep explanation of that phase so the human reviewer and the AI implementer share the same plan before any code is written. Structure it exactly as follows:

---

## Phase [N] — [Name] — What We're Shipping

**In one sentence:** [what this phase produces and why the project can't move forward without it]

---

### Why This Phase Exists

Explain the engineering purpose. What does it unlock? What would break or become painful if it were skipped or done out of order?

---

### Architecture Decisions In Play

List the decisions from ProjectSummary.md that this phase depends on or exercises. For each, state the decision and the one constraint it must respect. Flag any decision the spec leaves ambiguous — those need human input before implementation.

---

### The Implementation Slice

Describe the smallest complete vertical slice that satisfies this phase. List the files/modules you will create or change and, in one line each, what each is responsible for. Keep it to what this gate requires — no speculative abstractions (H6).

---

### Verification Plan

For every checkpoint item in the current phase, state the exact command to run and the observable output that proves it passes. This is what the human will review.

---

### Risks And Edge Cases

List the 3 most likely failure points for this phase and how the implementation will handle each.

---

### Before I Implement

State your assumptions explicitly. If any assumption would change the approved architecture, stop and ask for approval before writing code. Otherwise end with: the first slice you will build, the verification command, and the conventional commit message you will use.
