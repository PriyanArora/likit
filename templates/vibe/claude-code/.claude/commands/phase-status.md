Show a live snapshot of the current Likit phase.

Read `Progress.md` and `BuildFlow.md` fresh every time this runs so the output always reflects the current state. Determine the current phase (the first phase that is not fully checked), its one-line goal from `BuildFlow.md`, the unchecked steps in that phase, the next phase, and how many phases are complete out of the total.

Output exactly this format:

```
=== Likit Phase Status ===

Current phase: P<N> — <phase name>
Phase goal: <one-line goal from BuildFlow.md>

Steps remaining in this phase:
  [ ] <step description>
  [ ] <step description>
  ...

Next phase: P<N+1> — <phase name>
Overall progress: <X of Y phases complete>

Run /phase-explain for a deep explanation of the current phase.
Run /step-explain for a deep explanation of the current step.
```

Report state only. Do not write the user's implementation.
