const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline/promises');

const {
  MODES,
  TOOLS,
  PROJECT_TYPES,
  generateFiles,
  gitUsername,
  readConfig,
  slugify,
  templateDir,
  tryReadConfig
} = require('./generator');

const MODE_OPTIONS = [
  {
    value: 'mentored',
    label: 'Teach me - I write code, AI mentors and reviews',
    suffix: '[Mentored]'
  },
  {
    value: 'vibe',
    label: 'Accelerate me - AI writes code, I direct and review',
    suffix: '[Vibe]'
  }
];

const TOOL_OPTIONS = [
  { value: 'claude-code', label: 'Claude Code', suffix: '(CLI - reads CLAUDE.md automatically)' },
  { value: 'codex-cli', label: 'OpenAI Codex CLI', suffix: '(CLI - reads AGENTS.md automatically)' },
  { value: 'claude-chat', label: 'Claude.ai / Pro', suffix: '(chat - generates paste-ready context bundle)' },
  { value: 'chatgpt', label: 'ChatGPT / GPT-4o', suffix: '(chat - generates single-file prompt)' },
  { value: 'cursor', label: 'Cursor', suffix: '(generates .cursor/rules/likit.mdc)' },
  { value: 'windsurf', label: 'Windsurf', suffix: '(generates .windsurfrules)' },
  { value: 'generic', label: 'Other', suffix: '(generates LIKIT_PROMPT.md, works with anything)' }
];

const TYPE_OPTIONS = [
  { value: 'web', label: 'Web app', suffix: '(frontend + backend + database)' },
  { value: 'systems', label: 'Systems', suffix: '(CLI, library, pipeline, batch service)' },
  { value: 'creative', label: 'Creative', suffix: '(game, desktop, mobile framework)' }
];

const TEAM_OPTIONS = [
  { value: false, label: 'Just me', suffix: '' },
  { value: true, label: 'A team', suffix: '(multiple developers)' }
];

function parseFlags(argv) {
  const flags = {
    dryRun: false,
    quick: false,
    force: false,
    preserveUserContent: false,
    mode: null,
    tool: null,
    projectType: null,
    teamMode: null,
    username: null
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--dry-run') flags.dryRun = true;
    else if (arg === '--quick') flags.quick = true;
    else if (arg === '--force') flags.force = true;
    else if (arg === '--team') flags.teamMode = true;
    else if (arg === '--solo') flags.teamMode = false;
    else if (arg === '--mode') flags.mode = argv[++index];
    else if (arg.startsWith('--mode=')) flags.mode = arg.slice('--mode='.length);
    else if (arg === '--tool') flags.tool = argv[++index];
    else if (arg.startsWith('--tool=')) flags.tool = arg.slice('--tool='.length);
    else if (arg === '--type' || arg === '--project-type') flags.projectType = argv[++index];
    else if (arg.startsWith('--type=')) flags.projectType = arg.slice('--type='.length);
    else if (arg.startsWith('--project-type=')) flags.projectType = arg.slice('--project-type='.length);
    else if (arg === '--username') flags.username = argv[++index];
    else if (arg.startsWith('--username=')) flags.username = arg.slice('--username='.length);
  }

  return flags;
}

function isChoice(value, choices) {
  return choices.some((choice) => String(choice.value) === String(value));
}

function setupDetected(cwd) {
  return ['CLAUDE.md', 'AGENTS.md', path.join('.likit', 'config.json')]
    .some((file) => fs.existsSync(path.join(cwd, file)));
}

function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

async function askSelection(rl, question, options, defaultIndex = 0) {
  console.log(`\n${question}\n`);
  options.forEach((option, index) => {
    const marker = index === defaultIndex ? ' [default]' : '';
    const suffix = option.suffix ? `  ${option.suffix}` : '';
    console.log(`  ${index + 1}. ${option.label}${suffix}${marker}`);
  });

  const answer = await rl.question('\nChoose a number and press Enter: ');
  if (!answer.trim()) return options[defaultIndex].value;

  const numeric = Number(answer.trim());
  if (Number.isInteger(numeric) && numeric >= 1 && numeric <= options.length) {
    return options[numeric - 1].value;
  }

  const normalized = answer.trim().toLowerCase();
  const match = options.find((option) => String(option.value) === normalized);
  if (match) return match.value;

  console.log('[likit] Invalid selection. Try again.');
  return askSelection(rl, question, options, defaultIndex);
}

async function askUsername(rl, cwd, fallback) {
  const detected = fallback || gitUsername(cwd) || 'developer';
  const answer = await rl.question(`\nUsername for your progress file [${detected}]: `);
  return slugify(answer.trim() || detected);
}

async function existingSetupChoice(rl) {
  return askSelection(
    rl,
    '[likit] Existing setup detected. Options:',
    [
      { value: 'rerun', label: 'Re-run setup', suffix: '(overwrite Likit files, keep Progress.md and ProjectSummary.md)' },
      { value: 'migrate', label: 'Migrate from likit-claude or likit-codex to likit v2', suffix: '' },
      { value: 'cancel', label: 'Cancel', suffix: '' }
    ],
    2
  );
}

function progressFooter(config) {
  const mode = config.mode === 'vibe' ? 'Vibe' : 'Mentored';
  const tool = TOOLS[config.tool] || config.tool;
  return `\n---\nGenerated by Likit v${config.version || '2.0.0'} \u00b7 Mode: ${mode} \u00b7 Tool: ${tool} \u00b7 Type: ${config.projectType}\n`;
}

async function handleTeamJoin({ cwd, flags }) {
  const config = tryReadConfig(cwd);
  if (!config || !config.teamMode || flags.force || flags.dryRun) return false;

  const progressName = `Progress_${slugify(flags.username || gitUsername(cwd) || config.username || 'developer')}.md`;
  const progressPath = path.join(cwd, '.likit', progressName);
  if (fs.existsSync(progressPath)) return false;

  const createProgress = (username) => {
    const sourceProgress = path.join(templateDir(config), 'Progress.md');
    const content = fs.existsSync(sourceProgress)
      ? fs.readFileSync(sourceProgress, 'utf8')
      : '# Progress\n\n**Current Gate:** G0\n';
    fs.writeFileSync(
      path.join(cwd, '.likit', `Progress_${username}.md`),
      `${content.trimEnd()}${progressFooter(config)}`
    );
    console.log(`[likit] Created .likit/Progress_${username}.md`);
  };

  if (flags.username) {
    createProgress(slugify(flags.username));
    return true;
  }

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    console.log(`[likit] Team setup detected. Run again with --username <name> to create ${progressName}.`);
    return true;
  }

  const rl = createInterface();
  try {
    const username = await askUsername(rl, cwd, config.username);
    createProgress(username);
  } finally {
    rl.close();
  }

  return true;
}

// Reads a free-form, multi-line project specification. Two consecutive blank
// lines (enter pressed twice) end the entry, so multi-paragraph specs are fine.
async function captureProjectSpec(rl) {
  console.log('\nPaste or describe your full project specification. This can be a brief');
  console.log('description, a detailed spec document, a list of features, or any notes');
  console.log('you have. Press enter twice when done.\n');

  const lines = [];
  let blankRun = 0;
  for (;;) {
    let line;
    try {
      line = await rl.question('');
    } catch (_error) {
      break;
    }
    if (line.trim() === '') {
      blankRun += 1;
      if (blankRun >= 2) break;
      lines.push('');
      continue;
    }
    blankRun = 0;
    lines.push(line);
  }
  return lines.join('\n').trim();
}

function promptFileContent(spec) {
  return `# Likit Project Prompt

## Instruction

When \`likit start\` is run, read this file. Take the project specification below and use it to populate all planning files in the spec kit: ProjectSummary.md, BuildFlow.md, and Progress.md. Fill each section of those files with the appropriate content derived from the specification. Then confirm to the user that the planning files have been populated and state which gate is now active.

## Project Specification

${spec}
`;
}

// Captures the project spec and writes prompt.md at the spec kit root. Skips
// silently when not interactive, on dry runs, or when prompt.md already exists
// (so an existing specification is never overwritten).
async function captureProjectPrompt({ cwd, dryRun }) {
  if (dryRun || !process.stdin.isTTY || !process.stdout.isTTY) return;
  if (fs.existsSync(path.join(cwd, 'prompt.md'))) return;

  const rl = createInterface();
  let spec;
  try {
    spec = await captureProjectSpec(rl);
  } finally {
    rl.close();
  }

  if (!spec) {
    console.log('[likit] No specification entered. Add one to prompt.md later, then run likit start.');
    return;
  }

  fs.writeFileSync(path.join(cwd, 'prompt.md'), promptFileContent(spec));
  console.log('✓ prompt.md');
  console.log('[likit] Specification saved. Run likit start (or tell your AI to read prompt.md) to populate the planning files.');
}

function flagsComplete(flags) {
  return flags.mode && flags.tool && flags.projectType && flags.teamMode !== null;
}

function defaultsFromFlags(flags) {
  return {
    mode: flags.mode || 'mentored',
    tool: flags.tool || 'claude-code',
    projectType: flags.projectType || 'web',
    teamMode: flags.teamMode === null ? false : flags.teamMode,
    username: flags.username ? slugify(flags.username) : null,
    dryRun: flags.dryRun,
    quick: flags.quick
  };
}

function validateFlagAnswers(answers) {
  if (!isChoice(answers.mode, MODE_OPTIONS)) throw new Error(`Invalid --mode: ${answers.mode}`);
  if (!isChoice(answers.tool, TOOL_OPTIONS)) throw new Error(`Invalid --tool: ${answers.tool}`);
  if (!isChoice(answers.projectType, TYPE_OPTIONS)) throw new Error(`Invalid --type: ${answers.projectType}`);
}

async function collectAnswers({ cwd, flags }) {
  if (flagsComplete(flags) || (!process.stdin.isTTY && flags.dryRun)) {
    const answers = defaultsFromFlags(flags);
    validateFlagAnswers(answers);
    return answers;
  }

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error('Interactive setup requires a TTY. Run `npx likit init --dry-run` or pass --mode, --tool, --type, and --solo/--team.');
  }

  const rl = createInterface();
  try {
    const mode = flags.mode && isChoice(flags.mode, MODE_OPTIONS)
      ? flags.mode
      : await askSelection(rl, 'How do you want to work with AI?', MODE_OPTIONS);

    const tool = flags.tool && isChoice(flags.tool, TOOL_OPTIONS)
      ? flags.tool
      : await askSelection(rl, 'Which AI tool are you using?', TOOL_OPTIONS);

    const projectType = flags.projectType && isChoice(flags.projectType, TYPE_OPTIONS)
      ? flags.projectType
      : await askSelection(rl, 'What are you building?', TYPE_OPTIONS);

    const teamMode = flags.teamMode !== null
      ? flags.teamMode
      : await askSelection(rl, 'Who is working on this?', TEAM_OPTIONS);

    const username = teamMode ? await askUsername(rl, cwd, flags.username) : null;

    return {
      mode,
      tool,
      projectType,
      teamMode,
      username,
      dryRun: flags.dryRun,
      quick: flags.quick
    };
  } finally {
    rl.close();
  }
}

async function runWizard({ cwd, argv = [] }) {
  const flags = parseFlags(argv);

  if (await handleTeamJoin({ cwd, flags })) {
    return;
  }

  if (setupDetected(cwd) && !flags.force && !flags.dryRun) {
    if (!process.stdin.isTTY || !process.stdout.isTTY) {
      throw new Error('Existing setup detected. Re-run with --force to overwrite Likit files or run `npx likit migrate`.');
    }

    const rl = createInterface();
    try {
      const choice = await existingSetupChoice(rl);
      if (choice === 'cancel') {
        console.log('[likit] Cancelled.');
        return;
      }
      if (choice === 'migrate') {
        const { runMigrate } = require('./migrate');
        await runMigrate({ cwd });
        return;
      }
      flags.force = true;
      flags.preserveUserContent = true;
    } finally {
      rl.close();
    }
  }

  const answers = await collectAnswers({ cwd, flags });
  if (answers.mode === 'vibe' && answers.quick) {
    console.log('[likit] Quick mode: critique skipped. You can run /gate-review later to audit your architecture.');
  }

  console.log(
    `\u2713 Generating Likit files - ${MODES[answers.mode]} \u00b7 ${TOOLS[answers.tool]} \u00b7 ${PROJECT_TYPES[answers.projectType]} \u00b7 ${answers.teamMode ? 'Team' : 'Solo'}`
  );

  generateFiles({
    cwd,
    mode: answers.mode,
    tool: answers.tool,
    projectType: answers.projectType,
    teamMode: answers.teamMode,
    username: answers.username,
    dryRun: answers.dryRun,
    quick: answers.quick,
    preserveUserContent: flags.preserveUserContent
  });

  await captureProjectPrompt({ cwd, dryRun: answers.dryRun });
}

module.exports = {
  captureProjectSpec,
  collectAnswers,
  parseFlags,
  promptFileContent,
  runWizard
};
