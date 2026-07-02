# LIKIT — How It Works, and How to Ship It to npm

> **Audience:** you, the owner of this repo.
>
> This file has two parts:
> - **Part 1** — What Likit is and how a user uses it.
> - **Part 2** — A gated, step-by-step plan to publish it as an npm package.

**Gate rule (applies to Part 2):** Do every checkbox in a phase, run its PROOF, and see the expected output **before** you start the next phase. If a proof fails, stay in that phase and fix it. Do not skip ahead. Mark a box done by changing `[ ]` to `[x]`.

---

## Pre-flight status — audit on 2026-06-06

A full go-through was run against the "Main risks before publishing" list. Status:

| Risk | Status |
|------|--------|
| No automated test script | **Fixed** — `npm test` runs `test/smoke.js` (48 checks: CLI behaviour + full acceptance sweep). |
| Acceptance matrix not run | **Done** — smoke test dry-runs all 2 modes × 7 tools × 3 types (42 combos) + real generation per mode. All pass. |
| Vibe manifest says G0.6 | **Already resolved** — vibe manifest header is "Generated during G0.3" (vibe G0 has 3 sub-gates; mentored has 6 ending at G0.6). Placeholder tokens are consistent per mode (`[G0 fills]` for vibe, `[G0.6 fills]` for mentored). |
| Generic bundle writes `LIKIT_CONTEXT.md` | **Already resolved** — `src/bundle.js` writes `TOOL_ENTRY[tool]`, i.e. `LIKIT_PROMPT.md` for generic. The `# LIKIT CONTEXT` line is the bundle's internal title, not the filename. |
| Import-template behavior may not match spec | **Reviewed, sane** — cannot be checked against `likit-v2-spec.md` (that spec file no longer exists in the repo). Behaviour: regenerate files for the template's mode/tool/type, then preload `_fill_manifest.md` + `BuildFlow.md`, then prompt the user to confirm/adapt. Coherent. |
| In-session commands mismatch | **Fixed** — 6 documented slash commands had no command file (`gate-rollback`, `mode-status`, `likit-help`, `session-bundle`, `gate-review`, `export-template`). Created in both `templates/mentored/claude-code/.claude/commands/` and the vibe equivalent. All 13 documented commands now exist as files. |
| Old packages not deprecated | **Pending** — post-publish step (Phase 6.3). |
| Old branch cleanup pending | **Pending** — do after confirming all content lives in the new templates (final step). |

**One thing to watch (Phase 2/3):** `npm pack --dry-run` currently **includes** maintainer docs (this file ships in the tarball) because `package.json` has no `files` whitelist yet. Phase 2.4 adds the whitelist; Phase 3's proof confirms the leak is gone. `.npmignore` today only excludes `.agents/ .codex/ .claude/ .git/`.

---

## Part 1 — How Likit works (the user's point of view)

### What it is

Likit is a tiny command-line tool plus a library of Markdown workflow files. It is **not** a framework and **not** a hosted service. It installs a "gate-driven" build workflow into a user's own project so their AI assistant (Claude Code, Codex, Cursor, ChatGPT, etc.) follows a disciplined, phase-by-phase process.

### The two modes

- **Mentored:** the human writes the code; the AI mentors, questions, reviews, and blocks gates until the human proves understanding.
- **Vibe:** the AI writes the code; the human owns architecture and review, and each gate needs implementation + passing tests + explicit approval.

### The user's journey (start to finish)

1. **Install:** `npm i likit`
   On install a LIKIT banner prints. In an interactive terminal the setup wizard runs automatically; in CI it just prints how to run it later.

2. **Set up (if needed):** `npx likit init`
   The wizard asks 4 questions — mode, AI tool, project type, solo/team — then writes the right files for that tool plus:
   - `.likit/config.json` (the project's Likit settings)
   - `.likit/HOW_TO_USE.md` (a quick reference for the chosen tool)

3. **Capture the spec:**
   Right after the wizard, Likit asks the user to paste/describe their full project specification. It saves that into `prompt.md` at the project root.

4. **Build the plan:** `npx likit start` (or `/likit-start` in the AI tool)
   This reads `prompt.md` and fills the planning files from the spec: `ProjectSummary.md`, `BuildFlow.md`, `Progress.md`.
   (On Codex/chat tools the user instead tells the agent: "read prompt.md and populate the planning files".)

5. **Work the gates:**
   The AI reads its entry file (`CLAUDE.md` / `AGENTS.md` / rules file / pasted prompt), starts at the current gate in `Progress.md`, and works **one gate at a time**. Each gate is a list of small, individually verifiable steps with a proof. When a gate's boxes are all proven, the AI auto-commits the phase (`chore(likit): complete phase N — ...`) and advances.

### Everyday commands (typed in the AI chat on tools that support them)

| Command | Does |
|---------|------|
| `/phase-status` | live phase, remaining steps, overall progress |
| `/phase-check` | quick "where am I, what's next" |
| `/phase-explain` | deep explanation of the current phase |
| `/step-explain` | deep explanation of the current step |
| `/progress-save` | save progress to `Progress.md` |
| `/progress-log` | full progress report |
| `/gate-rollback` | undo the last gate advance |
| `/gate-review` | architecture cross-check / Vibe audit |
| `/mode-status` | show the Likit config |
| `/session-bundle` | regenerate paste-ready context |
| `/export-template` | save this plan as a reusable template |
| `/likit-start` | populate planning files from `prompt.md` |
| `/likit-help` | list commands |

(Codex has no slash commands — the user asks in plain language, e.g. "show phase status".)

### Terminal commands (any time)

| Command | Does |
|---------|------|
| `npx likit start` | populate planning files from `prompt.md` |
| `npx likit sync` | update Likit's own files, not your content |
| `npx likit doctor` | health-check the setup |
| `npx likit session-bundle` | regenerate paste-ready context for chat tools |
| `npx likit export-template` | save this project's plan as a reusable template |
| `npx likit import-template` | reuse a saved plan on a new project |
| `npx likit team-status` | per-developer progress (team mode) |
| `npx likit version` | version + current config |
| `npx likit help` | list all commands |

### Where things live

| Path | What |
|------|------|
| `bin/likit.js` | the CLI entry point (routes commands) |
| `src/*.js` | the CLI implementation (wizard, generator, doctor, etc.) |
| `templates/` | the Markdown workflow files, organised as `templates/<mentored\|vibe>/<tool>/` |
| `.likit/` | created **inside** a user's project at init (config + guide) |
| `test/smoke.js` | `npm test` — CLI smoke checks + acceptance sweep |

---

## Part 2 — Deploy: package and publish to npm

**Goal:** get `npm i likit` working for the public.

Context that is already true in this repo:

- `name = "likit"`, `version = "2.0.0"`, `bin` + `postinstall` set in `package.json`
- `bin/likit.js` is executable and has a `#!/usr/bin/env node` shebang
- git remote = `https://github.com/PriyanArora/likit.git`
- node 24 / npm 11 installed

You will need: an npm account (https://www.npmjs.com/signup).

> **Current status: Phase 1 is the active phase. Start there.**

### Phase 1 — Prove the tool actually works locally

**Why:** never publish something you haven't run. Confirm the CLI behaves before anyone can download it.

- [ ] 1.1 Print help: `node bin/likit.js help` → you see the command list, no error.
- [ ] 1.2 Print version: `node bin/likit.js version` → prints `likit 2.0.0`.
- [ ] 1.3 Banner renders: `node bin/likit.js postinstall < /dev/null` → the LIKIT ASCII banner prints, then the "Run: npx likit init" hint (non-interactive path).
- [ ] 1.4 Dry-run a setup:
  `node bin/likit.js init --dry-run --mode mentored --tool claude-code --type web --solo`
  → prints a file list and `[DRY RUN] No files written.`
- [ ] 1.5 Run the automated checks: `npm test` → ends with `48 checks passed`, exit code 0.

**Proof** (run this exact command, expect the final line shown):

```bash
node bin/likit.js init --dry-run --mode vibe --tool codex-cli --type systems --solo < /dev/null | tail -1
# EXPECT:  [DRY RUN] No files written.
```

⛔ **Do not start Phase 2** until every box above is `[x]` and the PROOF prints the expected line.

### Phase 2 — Fill in the package.json metadata npm expects

**Why:** the current `package.json` is missing fields that npm and users rely on (author, repository, homepage, and a whitelist of what ships).

- [ ] 2.1 Add an `author` field (your name / email).
- [ ] 2.2 Add a `repository` field:
  ```json
  "repository": { "type": "git", "url": "git+https://github.com/PriyanArora/likit.git" }
  ```
- [ ] 2.3 Add `homepage` and `bugs` (the GitHub repo + `/issues` URLs).
- [ ] 2.4 Add an explicit `files` whitelist so **only** what you mean ships:
  ```json
  "files": ["bin/", "src/", "templates/", "README.md", "LICENSE"]
  ```
  (This is safer than relying only on `.npmignore`. Note: `test/` is intentionally excluded — it does not ship.)
- [ ] 2.5 Decide the version. First public release of THIS package can stay `2.0.0` — that is fine. Leave it as is unless you have a reason.
- [ ] 2.6 Validate the JSON still parses: `node -e "require('./package.json')"` → no error printed.

**Proof:**

```bash
node -e "const p=require('./package.json'); if(!p.author||!p.repository||!p.files) throw new Error('missing field'); console.log('package.json OK')"
# EXPECT:  package.json OK
```

⛔ **Do not start Phase 3** until every box above is `[x]` and the PROOF prints `package.json OK`.

### Phase 3 — See exactly what will be published (and nothing secret)

**Why:** publishing is permanent-ish. Confirm the tarball contains the product files and excludes the spec, the maintainer notes, and any junk.

- [ ] 3.1 List the tarball contents WITHOUT publishing: `npm pack --dry-run`
- [ ] 3.2 Confirm these ARE included: `bin/`, `src/`, `templates/`, `README.md`, `LICENSE`.
- [ ] 3.3 Confirm these are NOT included: `HOW_LIKIT_WORKS_AND_DEPLOY.md`, this file, `.git`, `.claude`/`.codex`/`.agents` (root), `node_modules`, `test/`.
- [ ] 3.4 Confirm no secrets anywhere in the tarball list (no `.env`, no keys).

**Proof** (should print nothing but `CLEAN` — meaning none of the forbidden files ship):

```bash
npm pack --dry-run 2>&1 | grep -E "likit-v2-spec|explanation.md|HOW_LIKIT_WORKS|\.env" || echo "CLEAN"
# EXPECT:  CLEAN
```

(After checking, delete any `*.tgz` that `npm pack` may have created.)

⛔ **Do not start Phase 4** until every box above is `[x]` and the PROOF prints `CLEAN`.

### Phase 4 — Get an npm account and claim the name

**Why:** you can only publish once you are logged in **and** the name is available to you. "likit" may already be taken by someone else.

- [ ] 4.1 Have an npm account (sign up at npmjs.com if not).
- [ ] 4.2 Log in from this machine. In the Claude prompt you can run it inline so the output appears here: `! npm login` (follow the browser/CLI prompts).
- [ ] 4.3 Confirm who you are: `npm whoami` → prints your username.
- [ ] 4.4 Check name availability: `npm view likit version`
  - If it errors with `404 Not Found` → the name is FREE. Good.
  - If it prints a version owned by SOMEONE ELSE → you cannot use "likit". Pick a scoped name instead, e.g. `@yourname/likit`, update `package.json` `name`, and publish with `--access public` in Phase 5.

**Proof:**

```bash
npm whoami
# EXPECT:  your npm username (not an error).
```

⛔ **Do not start Phase 5** until you are logged in (PROOF prints your username) AND you have confirmed the name in 4.4 is yours to publish.

### Phase 5 — Publish

**Why:** this is the actual release.

- [ ] 5.1 Final clean check: `git status` → commit anything you want in the release (the published tarball comes from your working files, but committing keeps history honest).
- [ ] 5.2 Publish publicly: `npm publish --access public`
  (`--access public` is required for a scoped `@name/likit`; harmless for an unscoped name.)
- [ ] 5.3 Read the output — it should end with `+ likit@2.0.0` (or your scoped `name@version`), no error.

**Proof** (replace `likit` with your scoped name if you used one):

```bash
npm view likit version
# EXPECT:  2.0.0   (the version you just published)
```

⛔ **Do not start Phase 6** until the PROOF shows your published version on the registry.

### Phase 6 — Verify the real install, and retire the old packages

**Why:** prove a stranger's `npm i likit` works, then point old packages here.

- [ ] 6.1 Install it fresh in a throwaway folder:
  ```bash
  mkdir /tmp/likit-test && cd /tmp/likit-test && npm i likit
  ```
  → the LIKIT banner prints during install; no errors.
- [ ] 6.2 Run it: `npx likit version` → prints the version + config line.
- [ ] 6.3 (If you owned them) deprecate the old packages so users migrate:
  ```bash
  npm deprecate likit-claude "Moved to the likit package. Run: npm i likit"
  npm deprecate likit-codex  "Merged into the likit package. Run: npm i likit"
  ```
- [ ] 6.4 (Optional) push the repo and tag the release:
  ```bash
  git push origin main
  git tag v2.0.0 && git push origin v2.0.0
  ```
- [ ] 6.5 Delete the old `likit-codex` branch only after confirming all its content exists in the new templates.

**Proof:**

```bash
cd /tmp/likit-test && npx likit version
# EXPECT:  likit 2.0.0  (plus a config or "No .likit/config.json" line).
```

✅ **Done.** Likit is live on npm. Anyone can run `npm i likit`.
