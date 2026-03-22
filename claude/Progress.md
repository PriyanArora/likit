# [APP_NAME] — Progress

**Current Gate:** G0 (Project Setup)
**Current Phase:** —
**Last Updated:** [DATE]
**Session Notes:** [status]

> Gate state: ALL checkboxes must be `[x]` with proof shown to pass a gate.
> See CLAUDE.md Gate System for rules.

---

## G0 — Project Setup `[not started]`
- [ ] G0.1 Identity — all questions answered + confirmed
- [ ] G0.2 Developer Profile — all questions answered + confirmed
- [ ] G0.3 Architecture — all questions answered + confirmed
- [ ] G0.4 Features & Routes — all questions answered + confirmed
- [ ] G0.5 Constraints & Red Lines — all questions answered + confirmed
- [ ] G0.6 Critique + cross-check + files generated + user approved

---

## G1/P1 — Repo Setup `[locked — requires G0]`
- [ ] Conventional initial commit
- [ ] .gitignore complete
- [ ] Folder structure matches spec
- [ ] .env.example exists
- [ ] npm install clean

## G2/P2 — Database `[locked — requires G1]`
- [ ] Connection with env guard
- [ ] Models defined
- [ ] Connection test passes

## G3/P3 — Seed `[locked — requires G2]`
- [ ] Seed populates correctly
- [ ] Idempotent
- [ ] Relationships intact

## G4/P4 — Server `[locked — requires G3]`
- [ ] Starts on port
- [ ] Health route ok
- [ ] 404 JSON

## G5/P5 — CRUD `[locked — requires G4]`
- [ ] Status codes correct
- [ ] Integration tests pass
- [ ] Validation works

## G6/P6 — Services `[locked — requires G5]`
- [ ] Pure services
- [ ] Unit tests pass
- [ ] Thin routes

## G7/P7 — Frontend `[locked — requires G6]`
- [ ] Dev server runs
- [ ] Routing works
- [ ] API call succeeds

## G8/P8 — Main Feature `[locked — requires G7]`
- [ ] Real data renders
- [ ] Loading/error states
- [ ] MVP styled

## G9/P9 — Secondary `[locked — requires G8]`
- [ ] Filters work
- [ ] Empty states
- [ ] No errors

## G10/P10 — Auth `[locked — requires G9]`
- [ ] Register + token
- [ ] Login + token
- [ ] 401 on protected
- [ ] Optional auth both ways
- [ ] Frontend guards
- [ ] Auth tests

## G11/P11 — Integrations `[locked — requires G10]`
- [ ] End-to-end works
- [ ] Webhook verified
- [ ] Failure handled

## G12/P12 — Dashboard `[locked — requires G11]`
- [ ] User-scoped data
- [ ] No leaks
- [ ] Load time ok

## G13/P13 — Docker `[locked — requires G12]`
- [ ] Compose up works
- [ ] Matches local
- [ ] Clean teardown

## G14/P14 — Cache `[locked — requires G13]`
- [ ] Cache hit faster
- [ ] Invalidation works
- [ ] Graceful without cache

## G15/P15 — Deploy Backend `[locked — requires G14]`
- [ ] Health live
- [ ] Routes work
- [ ] Secrets in env

## G16/P16 — Deploy Frontend `[locked — requires G15]`
- [ ] Loads at URL
- [ ] API connected
- [ ] Auth works

## G17/P17 — CI/CD `[locked — requires G16]`
- [ ] PR triggers tests
- [ ] Merge deploys
- [ ] Failed blocks merge
