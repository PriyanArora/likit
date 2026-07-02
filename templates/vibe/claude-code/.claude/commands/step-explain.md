Read Progress.md, BuildFlow.md, guide.md, and ProjectSummary.md.

Determine the current step as follows:
- Find the current phase in Progress.md
- Find the first unchecked checkbox [ ] in that phase — that is the current step
- If the user passed a number argument (e.g. "/step-explain 3"), explain step 3 of the current phase instead
- If the user passed a name (e.g. "/step-explain env guard"), find the closest matching step

Produce a deep explanation of that single step so the human and the AI agree on the approach before it is built. Structure it exactly as follows:

---

## Step: [checkpoint item text] — Phase [N]

**What this step is in one sentence:** [plain language — what gets built and what it proves]

---

### Why This Step Is Here

Explain why this step sits in this exact position in the phase. Why must it come after the previous step and before the next? What breaks if it is done out of order?

---

### The Approach

Describe how you will implement this step: the file(s) touched, the core construct used, and the one design choice that matters most. Map it back to a decision in ProjectSummary.md. Keep it to what this step needs (H6).

---

### The Proof

State exactly what "done" looks like:
- The command to run
- The expected output
- The behaviour demonstrated
- What a broken implementation would produce instead

"It works" is not a proof. Describe the observable evidence the human will check.

---

### Risks On This Step

Name the single most likely failure point for this step, what it looks like, and how the implementation will avoid it.

---

### Habit Check

Identify which of the 13 output standards from guide.md this step most directly exercises. For each, state what compliance looks like at this exact step.

---

### Before I Implement

State your assumptions. If any would change approved architecture, stop and ask. Otherwise end with the verification command you will run and the conventional commit message you will use.
