# [APP_NAME] — Build Flow

> Phase done = checkpoint passes, not code written.
> Every phase is a GATE (see CLAUDE.md). ALL checkboxes + proof required to advance. No skipping.

## Prerequisites
- Node >= 18, npm >= 9, Git with SSH
- [DB_TOOL]
- Docker: NOT until P13 gate unlocks. Playwright: NOT until E2E gate unlocks.

## Global Rules
- Branch: `feat/<scope>/<name>` — never commit to main
- Commit: `<type>(<scope>): <desc>` — imperative, <72 chars
- Secrets: `.env` never in git. Guard every required var.
- Errors: every `catch` uses `{ cause: error }`
- Tests: every phase checkpoint requires seam tests verified
- **GATE RULE:** No checkbox marked without proof shown. No phase advanced without all boxes checked.

---

## P1 — Repo Setup `[GATE G1]`
**Goal:** Clean repo, .gitignore, folder structure, package.json
- [ ] Conventional initial commit
- [ ] .gitignore: node_modules, .env, dist, coverage
- [ ] Folder structure matches ProjectSummary
- [ ] .env.example with all keys
- [ ] `npm install` clean in all packages

## P2 — Database `[GATE G2 — requires G1 passed]`
**Goal:** Connected DB with validated schemas
- [ ] Connection config with env guard
- [ ] All models defined and exporting
- [ ] Connection test passes

## P3 — Seed Data `[GATE G3 — requires G2 passed]`
**Goal:** Realistic seed data, idempotent
- [ ] `npm run seed` populates correctly
- [ ] Re-run doesn't duplicate
- [ ] Relationships intact

## P4 — Server Skeleton `[GATE G4 — requires G3 passed]`
**Goal:** Running server, health route, error middleware
- [ ] Server starts on configured port
- [ ] GET /api/health returns ok
- [ ] 404 returns JSON

## P5 — Core API (CRUD) `[GATE G5 — requires G4 passed]`
**Goal:** All CRUD routes + integration tests
- [ ] Correct status codes on all endpoints
- [ ] Integration tests pass
- [ ] 400 on invalid input

## P6 — Service Logic + Unit Tests `[GATE G6 — requires G5 passed]`
**Goal:** Business logic extracted, test-first
- [ ] Services are pure where possible
- [ ] Unit tests pass
- [ ] Routes are thin (service calls only)

## P7 — Frontend Skeleton `[GATE G7 — requires G6 passed]`
**Goal:** App with routing, layout, API layer
- [ ] Dev server runs
- [ ] Route navigation works
- [ ] API health call succeeds from frontend

## P8 — Main Feature `[GATE G8 — requires G7 passed]`
**Goal:** Primary user-facing feature with real data
- [ ] Renders with seed data
- [ ] Loading + error states
- [ ] Styled to MVP level

## P9 — Secondary Features `[GATE G9 — requires G8 passed]`
**Goal:** Filters, search, supporting features
- [ ] Filters work correctly
- [ ] Empty states handled
- [ ] No console errors

## P10 — Auth `[GATE G10 — requires G9 passed]`
**Goal:** Register, login, guards, optional auth
- [ ] Register returns token
- [ ] Login returns token
- [ ] Protected routes 401 without token
- [ ] Optional auth works both ways
- [ ] Frontend guards redirect correctly
- [ ] Auth integration tests pass

## P11 — Integrations `[GATE G11 — requires G10 passed]`
**Goal:** External services, webhooks, real-time
- [ ] Integration works end-to-end
- [ ] Webhook verification (if applicable)
- [ ] External failure doesn't crash app

## P12 — Dashboard `[GATE G12 — requires G11 passed]`
**Goal:** User-scoped personalized view
- [ ] Data scoped to user
- [ ] No cross-user data leaks
- [ ] Acceptable load time

## P13 — Docker `[GATE G13 — requires G12 passed]`
**Goal:** Containerized app
- [ ] `docker compose up` works
- [ ] Matches local dev behavior
- [ ] Clean teardown

## P14 — Caching `[GATE G14 — requires G13 passed]`
**Goal:** Cache hot paths, invalidate on write
- [ ] Faster on cache hit
- [ ] Invalidates on mutation
- [ ] Graceful without cache

## P15 — Deploy Backend `[GATE G15 — requires G14 passed]`
**Goal:** Production backend running
- [ ] Health endpoint live
- [ ] All routes work in prod
- [ ] Secrets in host env only

## P16 — Deploy Frontend `[GATE G16 — requires G15 passed]`
**Goal:** Production frontend connected
- [ ] Loads at prod URL
- [ ] API calls reach backend
- [ ] Auth works in prod

## P17 — CI/CD `[GATE G17 — requires G16 passed]`
**Goal:** Automated test + deploy
- [ ] PR triggers tests
- [ ] Merge triggers deploy
- [ ] Failed tests block merge

---

## Common Problems
| Problem | Fix |
|---------|-----|
| CORS error | Add frontend origin to backend CORS config |
| DB connection fail | Check IP whitelist + .env URI |
| JWT malformed | Check `Authorization: Bearer <token>` format |
| Port in use | `lsof -i :PORT` then kill |
| Module not found | `npm install` + check import paths |
| Test timeout | Ensure async calls use await |
