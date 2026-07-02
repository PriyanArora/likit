# Build Flow - Vibe Mode

Each gate ships one working slice. Gate pass requires:
1. Implementation complete - Codex summarizes what was built.
2. Tests passing - command output shown.
3. Human review passed - human explicitly approves.

## Prerequisites
- [FILLED BY G0 - tools, versions, install order, red lines]

## P1 - Repo Setup `[GATE G1]`
**Goal:** Clean repo, dependencies, config, first runnable skeleton.
- [ ] `git init` run and repo on default branch
- [ ] `.gitignore` lists secrets, deps, build artifacts
- [ ] `.env` ignored — `git check-ignore .env` prints `.env`
- [ ] Top-level folders match ProjectSummary
- [ ] Config/env example file lists every key, no values
- [ ] Install or setup command succeeds with zero errors
**Proof:** setup command output, `git check-ignore .env`, file list, human approval.

## P2 - Data Layer `[GATE G2]`
**Goal:** [G0 fills data storage or persistence goal]
- [ ] Data model implemented
- [ ] Config comes from env
- [ ] Connection or access test passes
**Proof:** test or smoke command output, human approval.

## P3 - Seed or Fixtures `[GATE G3]`
**Goal:** [G0 fills repeatable sample data goal]
- [ ] Repeatable setup
- [ ] Relationships or references intact
- [ ] Reset path documented
**Proof:** seed/reset command output, human approval.

## P4 - Core Entry Point `[GATE G4]`
**Goal:** [G0 fills first runnable entry point]
- [ ] Entry point runs
- [ ] Happy path works
- [ ] Error path is meaningful
**Proof:** smoke command output, human approval.

## P5 - Core Logic and Tests `[GATE G5]`
**Goal:** [G0 fills main logic]
- [ ] Core logic implemented
- [ ] Unit or integration tests pass
- [ ] Invalid input handled
**Proof:** test command output, human approval.

## P6 - Service Boundaries `[GATE G6]`
**Goal:** Thin entry points, testable services or modules.
- [ ] Business logic isolated
- [ ] Tests cover service seams
- [ ] No broad speculative abstraction
**Proof:** test output and file review, human approval.

## P7 - Interface Skeleton `[GATE G7]`
**Goal:** [G0 fills UI, CLI, API, or scene skeleton]
- [ ] Primary navigation or command path works
- [ ] Connects to core layer
- [ ] Empty and error states handled
**Proof:** demo output or screenshot plus tests, human approval.

## P8 - Main Feature `[GATE G8]`
**Goal:** Primary feature works end-to-end with real data.
- [ ] Real data path works
- [ ] Failure handled
- [ ] Meets core constraint
**Proof:** end-to-end demo and tests, human approval.

## P9 - Secondary Features `[GATE G9]`
**Goal:** [G0 fills secondary feature set]
- [ ] Feature slice complete
- [ ] Edge cases handled
- [ ] No main-feature regression
**Proof:** regression test output, human approval.

## P10 - Auth or Access Control `[GATE G10]`
**Goal:** [G0 fills access rules, or marks not applicable]
- [ ] Allowed access works
- [ ] Unauthorized access rejected
- [ ] Access tests pass
**Proof:** auth/access test output, human approval.

## P11 - Integrations `[GATE G11]`
**Goal:** [G0 fills integrations, or marks not applicable]
- [ ] Integration works
- [ ] External failure handled
- [ ] Secrets remain in env only
**Proof:** integration test or mocked failure output, human approval.

## P12 - Scoped State `[GATE G12]`
**Goal:** Data or state is scoped to user, tenant, run, scene, or context.
- [ ] Correct scope enforced
- [ ] No cross-context leak
- [ ] Load time acceptable
**Proof:** two-context demo and tests, human approval.

## P13 - Environment Parity `[GATE G13]`
**Goal:** [G0 fills local/staging/prod parity goal]
- [ ] Setup and teardown clean
- [ ] Behavior matches earlier gates
- [ ] Env validation present
**Proof:** environment command output, human approval.

## P14 - Performance `[GATE G14]`
**Goal:** [G0 fills measurable performance target]
- [ ] Baseline measured
- [ ] Improvement or guard implemented
- [ ] Graceful without optimization layer
**Proof:** before/after numbers, human approval.

## P15 - Deploy Core `[GATE G15]`
**Goal:** Backend, CLI, service, or core runtime deployed/released.
- [ ] Live or packaged target reachable
- [ ] Core function works there
- [ ] Secrets/config hosted safely
**Proof:** production/release command output, human approval.

## P16 - Deploy Client `[GATE G16]`
**Goal:** Frontend, app, desktop, mobile, or user-facing target deployed/released.
- [ ] Target loads or runs
- [ ] Connects to production/core service
- [ ] Critical flow works
**Proof:** live demo or release artifact, human approval.

## P17 - CI/CD `[GATE G17]`
**Goal:** Automated verification and release path.
- [ ] Push or PR triggers tests
- [ ] Release/deploy trigger defined
- [ ] Failed tests block release
**Proof:** CI output, human approval.
