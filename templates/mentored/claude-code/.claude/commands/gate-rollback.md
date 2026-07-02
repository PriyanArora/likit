Undo the last gate advance.

1. Read `Progress.md` and find the most recently completed phase (the last one marked complete / fully `[x]`).
2. Move the Current Gate back to that phase and set its status to `[in progress]`.
3. Re-open the checkboxes that belonged to that phase (`- [x]` → `- [ ]`) only if the user wants to redo them; otherwise leave them and just reactivate the gate.
4. Do NOT delete or revert any committed code — rollback only moves the Likit gate pointer. If the user wants to undo the phase commit too, tell them the exact `git revert <hash>` command and let them run it.
5. Show the updated Current Gate line and confirm what was rolled back.
