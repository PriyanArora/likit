# Likit

Lightweight AI dev workflow kit. One install. Gate-driven. Works with major AI tools.

## What It Is

Likit is a small set of workflow files plus a setup CLI. It gives an AI assistant a project gate system, progress tracker, and setup questionnaire.

It is not a framework, not a hosted product, not BMAD, and not a full project-management methodology. It stays local to your repo.

## Quick Install

```bash
npm i likit
```

If the install runs in a non-interactive environment, run setup yourself:

```bash
npx likit init
```

## The Wizard

The wizard asks for mode, AI tool, project type, and solo/team setup. It writes the right files for that tool plus `.likit/config.json` and `.likit/HOW_TO_USE.md`. It then captures your project specification into `prompt.md`. Run `likit start` (or, on tools that load slash commands, `/likit-start`) to populate `ProjectSummary.md`, `BuildFlow.md`, and `Progress.md` from that spec.

## Modes

| Mode | Who writes code | Best for |
|---|---|---|
| Mentored | Human | Learning, practice, proof-driven growth |
| Vibe | AI | Faster shipping with human architecture and review |

## Tools

| Tool | Output |
|---|---|
| Claude Code | `CLAUDE.md`, `.claude/commands/*` slash commands, plus workflow files |
| OpenAI Codex CLI | `AGENTS.md` plus workflow files |
| Claude.ai / Pro | `LIKIT_CONTEXT.md` and `LIKIT_PROJECTS_PROMPT.md` |
| ChatGPT / GPT-4o | `LIKIT_GPT.md` |
| Cursor | `.cursor/rules/likit.mdc`, `BuildFlow.md`, `Progress.md` |
| Windsurf | `.windsurfrules`, `BuildFlow.md`, `Progress.md` |
| Other | `LIKIT_PROMPT.md`, `BuildFlow.md`, `Progress.md` |

Every tool also gets `.likit/config.json` and `.likit/HOW_TO_USE.md`.

## Commands

| Command | What it does |
|---|---|
| `npx likit init` | Run setup wizard |
| `npx likit init --dry-run` | Show files without writing |
| `npx likit start` | Populate planning files from `prompt.md` |
| `npx likit sync` | Update Likit template files |
| `npx likit doctor` | Validate setup and enforce the laws — gate integrity, commit convention, no hardcoded secrets (exits non-zero on any failure) |
| `npx likit migrate` | Migrate old likit-claude or likit-codex setup |
| `npx likit session-bundle` | Regenerate paste-ready context |
| `npx likit export-template` | Export G0 output to `project.likit.json` |
| `npx likit import-template <file>` | Import a reusable project template |
| `npx likit team-status` | Show per-developer progress in team mode |
| `npx likit version` | Print version and config |
| `npx likit help` | Show command help |

`init` accepts flags for non-interactive or scripted setup: `--mode <mentored\|vibe>`, `--tool <claude-code\|codex-cli\|claude-chat\|chatgpt\|cursor\|windsurf\|generic>`, `--type <web\|systems\|creative>`, `--solo`/`--team` (with `--username <name>`), `--force` to overwrite existing Likit files, and `--quick` to skip the Vibe-mode architecture critique.

## Slash Commands

In Claude Code, Likit installs slash commands under `.claude/commands/` for both modes:

| Command | What it does |
|---|---|
| `/likit-start` | Populate planning files from `prompt.md` |
| `/likit-help` | List Likit commands and current gate |
| `/phase-status` | Show the current gate and phase |
| `/phase-check` | Verify the current phase against its exit criteria |
| `/phase-explain` | Explain the current phase and what comes next |
| `/step-explain` | Break the current step into smaller actions |
| `/mode-status` | Show whether you are in Mentored or Vibe mode |
| `/gate-review` | Audit the current gate before advancing |
| `/gate-rollback` | Roll back to a previous gate |
| `/progress-log` | Append a progress note |
| `/progress-save` | Persist progress to `Progress.md` |
| `/session-bundle` | Regenerate paste-ready chat context |
| `/export-template` | Export G0 output to a reusable template |

## Enforcement

The workflow files instruct the assistant to block gates until proof is shown, but
`npx likit doctor` makes the core laws checkable rather than trusted: it verifies gate
integrity (no gate is marked passed while an earlier gate has unchecked boxes), lints
recent commits against the conventional-commit format, and scans tracked files for
hardcoded secrets. It exits non-zero on any failure, so you can wire it into a git
hook or CI. Each gate's advance ritual runs it before committing the phase.

## Team Mode

Team mode commits shared setup files while keeping per-developer progress in `.likit/Progress_<username>.md`. Each developer runs `npx likit init` once after cloning.

## Template Sharing

After G0 completes, export architecture and BuildFlow with `npx likit export-template`. Import it in a similar project with `npx likit import-template project.likit.json`.

## Token Budgets

Likit is designed to stay lean: CLI workflow files target under 3,000 tokens in Mentored mode and under 2,500 tokens in Vibe mode. Chat bundles target under 4,500 tokens, with single-file generic prompts under 5,000 tokens.

## License

MIT
