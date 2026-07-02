const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline/promises');

const { generateFiles } = require('./generator');

function readIfExists(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

function detectOldSetup(cwd) {
  const detections = [];
  const claude = readIfExists(path.join(cwd, 'CLAUDE.md'));
  const agents = readIfExists(path.join(cwd, 'AGENTS.md'));
  const packageJson = readIfExists(path.join(cwd, 'package.json'));
  const packageLock = readIfExists(path.join(cwd, 'package-lock.json'));

  if (/likit-claude|Likit/i.test(claude)) {
    detections.push('old Claude setup in CLAUDE.md');
  }
  if (/likit|gate system|G0/i.test(agents)) {
    detections.push('old Codex setup in AGENTS.md');
  }
  if (/likit-claude|likit-codex/.test(packageJson) || /likit-claude|likit-codex/.test(packageLock)) {
    detections.push('old npm dependency on likit-claude or likit-codex');
  }

  return detections;
}

async function ask(rl, question, fallback) {
  const answer = await rl.question(`${question} [${fallback}]: `);
  return answer.trim() || fallback;
}

async function runMigrate({ cwd }) {
  const detections = detectOldSetup(cwd);
  if (detections.length === 0) {
    console.log('[likit] No old likit-claude or likit-codex setup detected.');
    return;
  }

  console.log('[likit] Detected:');
  for (const item of detections) {
    console.log(`- ${item}`);
  }

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    console.log('[likit] Run `npx likit migrate` in an interactive terminal to migrate.');
    return;
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    const confirm = await ask(rl, 'Migrate to Likit v2? Your Progress.md and ProjectSummary.md will be preserved. Type yes', 'no');
    if (confirm.toLowerCase() !== 'yes') {
      console.log('[likit] Migration cancelled.');
      return;
    }

    const mode = await ask(rl, 'Mode? mentored or vibe', 'mentored');
    const tool = await ask(rl, 'Tool? claude-code, codex-cli, claude-chat, chatgpt, cursor, windsurf, generic', 'claude-code');
    const progress = readIfExists(path.join(cwd, 'Progress.md'));
    const summary = readIfExists(path.join(cwd, 'ProjectSummary.md'));

    generateFiles({
      cwd,
      mode,
      tool,
      projectType: 'web',
      teamMode: false,
      preserveUserContent: false
    });

    if (progress) fs.writeFileSync(path.join(cwd, 'Progress.md'), progress);
    if (summary) fs.writeFileSync(path.join(cwd, 'ProjectSummary.md'), summary);

    console.log('[likit] Migration complete. Your progress and project summary were preserved.');
  } finally {
    rl.close();
  }
}

module.exports = {
  detectOldSetup,
  runMigrate
};
