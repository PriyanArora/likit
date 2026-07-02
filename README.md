# Likit

Lightweight, gate-driven AI dev workflow kit. One install. Works with major AI tools.

Likit gives your AI assistant a disciplined way to build software: one small, provable
step at a time, with checkpoints it is not allowed to skip. It installs a few Markdown
files into your project and a tiny command-line tool that keeps everyone honest.

---

## What it is (in plain terms)

Imagine building a house with an inspector who won't let you start the walls until the
foundation passes inspection. Likit is that inspector for software.

- Your project is split into **phases** (foundation, plumbing, wiring, …).
- Each phase ends at a **gate**. A gate has a checklist and a **proof** — something you
  actually run or show to prove the phase works.
- The AI assistant may only work on the **current** gate. It cannot jump ahead, and it
  cannot mark a gate "done" on your word alone — the proof has to be real.

That's the whole idea: **small steps, real proof, no skipping.**

Likit is **not** a framework, a hosted product, or a heavyweight methodology. It is a set
of workflow files plus a setup CLI, and it stays entirely local to your repository.

---

## Install

```bash
npm i likit
```

On install, Likit prints a banner and — in an interactive terminal — starts the setup
wizard. In a non-interactive environment (like CI), run setup yourself:

```bash
npx likit init
```

Requires Node.js. Current version: **2.0.0**.

---

## How you use it, start to finish

1. **Install** — `npm i likit`. The banner prints; the wizard runs if your terminal is
   interactive.

2. **Set up** — `npx likit init`. The wizard asks four questions — **mode**, **AI tool**,
   **project type**, and **solo or team** — then writes the right files for your tool (see
   [The files Likit creates](#the-files-likit-creates)). It also adds `.env` to your
   `.gitignore` so secrets don't get committed by accident.

3. **Describe your project** — right after the wizard, Likit asks you to paste or describe
   your full project spec and saves it to `prompt.md` at the repo root.

4. **Build the plan** — `npx likit start` (or `/likit-start` inside tools that support
   slash commands). Likit reads `prompt.md` and fills your planning files —
   `ProjectSummary.md`, `BuildFlow.md`, and `Progress.md` — from that spec.

5. **Work the gates** — the AI reads its entry file (e.g. `CLAUDE.md`), finds the current
   gate in `Progress.md`, and works **one gate at a time**. Each gate is a short list of
   small, verifiable steps ending in a proof. When every box is proven, the AI
   auto-commits the phase and advances to the next gate.

---

## Modes

Likit has two modes. You pick one during setup.

| Mode | Who writes the code | Best for |
|---|---|---|
| **Mentored** | You (the human) | Learning and practice. The AI acts as a senior mentor: it questions, reviews, and refuses to write your implementation code — it makes you prove you understand each step. |
| **Vibe** | The AI | Faster shipping. The AI implements; you own the architecture and review. Each gate needs implementation, passing tests, and your explicit approval. |

---

## Tools

Likit adapts its files to whichever AI tool you use.

| Tool | Main file it writes |
|---|---|
| **Claude Code** | `CLAUDE.md` + `.claude/commands/*` slash commands + workflow files |
| **OpenAI Codex CLI** | `AGENTS.md` + workflow files |
| **Claude.ai / Pro** | `LIKIT_CONTEXT.md` and `LIKIT_PROJECTS_PROMPT.md` |
| **ChatGPT** | `LIKIT_GPT.md` |
| **Cursor** | `.cursor/rules/likit.mdc` + workflow files |
| **Windsurf** | `.windsurfrules` + workflow files |
| **Other** | `LIKIT_PROMPT.md` + workflow files (a single paste-ready prompt) |

Every tool also gets `.likit/config.json` (your Likit settings) and `.likit/HOW_TO_USE.md`
(a quick reference for the chosen tool). **Project types** are `web`, `systems`, and
`creative` — they change which `ProjectSummary` template you start from.

---

## The files Likit creates

These live in your repo and are the "spec" the AI follows. (Exact set varies by tool; this
is the Claude Code / Codex layout.)

| File | What it's for |
|---|---|
| **Entry file** (`CLAUDE.md`, `AGENTS.md`, rules file, or pasted prompt) | The AI's instructions: session startup, the gate-pass rules, and the command list. |
| **`guide.md`** | The enforcement rules — the 13 Habits and the Red Lines (the "laws", below). |
| **`ProjectSummary.md`** | Your project's architecture and constraints, filled during setup. |
| **`BuildFlow.md`** | The phases (P1–P17), each with its checklist and **Proof** line. |
| **`Progress.md`** | The live tracker: the current gate and which boxes are checked. |
| **`G0_questionnaire.md`** | The setup interview used to fill everything above. |
| **`_fill_manifest.md`** | The worksheet the AI fills to turn your answers into the files. |
| **`prompt.md`** | Your raw project description, captured by the wizard. |
| **`.likit/config.json`** | Mode, tool, project type, solo/team, username. |
| **`.likit/HOW_TO_USE.md`** | A tool-specific cheat sheet. |

---

## The gate system

Gates run from **G0** to **G17**. Each build gate `G<n>` corresponds to phase `P<n>` in
`BuildFlow.md` (G1 = P1, G2 = P2, …). Every checkbox must be `[x]` **with proof shown**
before a gate passes.

**G0 — Project Setup.** Before any code, Likit interviews you to lock down identity,
your developer profile, architecture, features, constraints, and red lines. Mentored mode
has 6 sub-gates (G0.1–G0.6); Vibe mode has 3 (G0.1–G0.3). G0 ends by generating your
filled `ProjectSummary.md`, `BuildFlow.md`, and `Progress.md` — with zero leftover
placeholders.

**G1–G17 — Build gates.** A typical path: repo setup → data layer → core entry point →
core logic + tests → feature work → auth → integrations → performance → deploy → CI/CD.
Each phase's goal and proof are tailored to your project during G0.

**Advancing a gate (the ritual):**
1. Every checkbox for the gate is `[x]`, and tests pass on test-bearing phases.
2. **Gate ledger** — the AI re-reads `Progress.md` and `BuildFlow.md`, confirms the
   phase's **Proof** line is filled, and runs `npx likit doctor` (see below) — it must pass.
3. The AI auto-commits the phase: `chore(likit): complete phase <N> — <summary>`.
4. Only after the commit succeeds does it announce the pass and move to the next gate.

If any step fails, the AI stays in the gate and fixes it — it does not advance.

---

## The laws

The workflow files hold Likit to a fixed set of engineering standards, enforced on every
code-related response.

**The 13 Habits** (in `guide.md`) — e.g. walking skeleton first, vertical slices,
conventional commits, test-first on core logic, clean names, YAGNI/KISS/DRY, refactor in a
separate commit, secrets never in the repo, structured logging, test every seam.

**Red Lines** — hard blockers that stop a gate immediately: no implementation code written
*for* the student (Mentored mode), no `catch`/`except` without cause chaining, no vague
names, no vague commits, no committing features to `main`, and **no hardcoded secrets**.
A secret here means a real credential value written as a literal in tracked code — API
keys, tokens, passwords, private keys. Environment variables and placeholders are fine.

---

## Enforcement — `npx likit doctor`

The workflow files *instruct* the AI to obey the gate system and the laws — but
instructions can drift over a long session. `likit doctor` makes the core laws **checkable
instead of trusted.** It runs two groups of checks:

**Setup checks** — your `.likit/config.json` is complete, the entry file and `guide.md`
exist, `BuildFlow.md` is filled (no leftover placeholders), `Progress.md` and
`ProjectSummary.md` exist, no unused `ProjectSummary_*` templates remain, and (in team
mode) each developer has a progress file.

**Law checks** — these verify the laws the templates can only ask for:
- **Gate integrity** — no gate is marked passed while an *earlier* gate still has unchecked
  boxes. Catches "we jumped ahead."
- **Commit convention** — the last 20 commit subjects match the conventional-commit format
  (`type(scope): description`, under 72 chars).
- **No hardcoded secrets** — a scan of tracked files for obvious credential leaks (AWS
  keys, private-key headers, quoted `password`/`api_key`/`token` values), skipping
  environment references and placeholders.

`doctor` **exits non-zero** if any check fails, so you can wire it into a git hook or CI to
block a bad commit or merge. The gate-advance ritual already runs it before committing each
phase.

> The secret scan is intentionally simple — it catches careless leaks, not a determined
> one. For thorough coverage, add a dedicated tool like gitleaks.

---

## Commands

| Command | What it does |
|---|---|
| `npx likit init` | Run the setup wizard |
| `npx likit init --dry-run` | Show the files that would be written, without writing them |
| `npx likit start` | Populate planning files from `prompt.md` |
| `npx likit sync` | Update Likit's own template files (not your content) |
| `npx likit doctor` | Validate setup **and** enforce the laws — gate integrity, commit convention, no hardcoded secrets (exits non-zero on failure) |
| `npx likit migrate` | Migrate an old `likit-claude` or `likit-codex` setup |
| `npx likit session-bundle` | Regenerate paste-ready context for chat tools |
| `npx likit export-template` | Export your G0 output to `project.likit.json` |
| `npx likit import-template <file>` | Reuse a saved project template |
| `npx likit team-status` | Show per-developer progress in team mode |
| `npx likit version` | Print version and current config |
| `npx likit help` | Show command help |

`init` also takes flags for scripted, non-interactive setup:
`--mode <mentored\|vibe>`, `--tool <claude-code\|codex-cli\|claude-chat\|chatgpt\|cursor\|windsurf\|generic>`,
`--type <web\|systems\|creative>`, `--solo`/`--team` (with `--username <name>`),
`--force` to overwrite existing Likit files, and `--quick` to skip the Vibe-mode
architecture critique.

---

## Slash commands (Claude Code)

In Claude Code, Likit installs these under `.claude/commands/` for both modes:

| Command | What it does |
|---|---|
| `/likit-start` | Populate planning files from `prompt.md` |
| `/likit-help` | List Likit commands and the current gate |
| `/phase-status` | Show the current gate and phase |
| `/phase-check` | Quick "where am I, what's next" |
| `/phase-explain` | Explain the current phase and what comes next |
| `/step-explain` | Break the current step into smaller actions |
| `/mode-status` | Show whether you are in Mentored or Vibe mode |
| `/gate-review` | Audit the current gate — architecture cross-check **and** the gate ledger — before advancing |
| `/gate-rollback` | Roll back to a previous gate |
| `/progress-log` | Full progress report |
| `/progress-save` | Persist progress to `Progress.md` |
| `/session-bundle` | Regenerate paste-ready chat context |
| `/export-template` | Export G0 output to a reusable template |

(Codex and other terminal tools have no slash commands — you ask in plain language, e.g.
"show phase status".)

---

## Team mode

Team mode commits the shared setup files while keeping **per-developer** progress in
`.likit/Progress_<username>.md`. Each developer runs `npx likit init` once after cloning,
and `npx likit team-status` shows everyone's progress.

---

## Template sharing

After G0 completes, export your architecture and BuildFlow with
`npx likit export-template` (writes `project.likit.json`). Reuse it on a similar project
with `npx likit import-template project.likit.json`.

---

## Token budgets

Likit is designed to stay lean so it doesn't crowd out your project in the AI's context:
CLI workflow files target under 3,000 tokens in Mentored mode and under 2,500 in Vibe mode.
Chat bundles target under 4,500 tokens; single-file generic prompts under 5,000.

---

## Repo layout (for contributors)

| Path | What |
|---|---|
| `bin/likit.js` | CLI entry point — routes commands |
| `src/*.js` | CLI implementation (`wizard`, `generator`, `doctor`, `start`, `sync`, `bundle`, `migrate`, `template`, `banner`) |
| `templates/<mentored\|vibe>/<tool>/` | The Markdown workflow files, per mode and tool |
| `.likit/` | Created **inside a user's project** at init (config + guide) |
| `test/smoke.js` | `npm test` — CLI checks, a full mode × tool × type generation sweep, and the `doctor` law checks |

---

## License

MIT
