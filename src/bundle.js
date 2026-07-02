const fs = require('node:fs');
const path = require('node:path');

const { TOOL_ENTRY, TOOLS, readConfig, templateDir } = require('./generator');

function readIfExists(file, fallback) {
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : fallback;
}

function resolveGuide(cwd, config) {
  const localGuide = path.join(cwd, 'guide.md');
  if (fs.existsSync(localGuide)) return fs.readFileSync(localGuide, 'utf8');

  const templateGuide = path.join(templateDir(config), 'guide.md');
  if (fs.existsSync(templateGuide)) return fs.readFileSync(templateGuide, 'utf8');

  const source = templateDir(config);
  for (const file of ['LIKIT_CONTEXT.md', 'LIKIT_GPT.md', 'LIKIT_PROMPT.md', 'LIKIT_PROJECTS_PROMPT.md', 'likit.mdc', 'likit.windsurfrules']) {
    const candidate = path.join(source, file);
    if (fs.existsSync(candidate)) return fs.readFileSync(candidate, 'utf8');
  }

  const localEntry = path.join(cwd, TOOL_ENTRY[config.tool] || '');
  if (fs.existsSync(localEntry)) return fs.readFileSync(localEntry, 'utf8');

  return 'Likit guide not found. Run `npx likit sync` or `npx likit init`.';
}

function assembleBundle({ cwd, config }) {
  const guide = resolveGuide(cwd, config);
  const projectSummary = readIfExists(
    path.join(cwd, 'ProjectSummary.md'),
    '# ProjectSummary\n\nG0 has not generated ProjectSummary.md yet.'
  );
  const progress = readIfExists(
    path.join(cwd, 'Progress.md'),
    '# Progress\n\n**Current Gate:** G0'
  );

  return `# LIKIT CONTEXT

Tool: ${TOOLS[config.tool]}
Mode: ${config.mode}
Project type: ${config.projectType}

## Guide
${guide}

## Current Project Summary
${projectSummary}

## Current Progress
${progress}

## Commands
- /phase-check - current gate, completed items, next step
- /phase-status - live phase, remaining steps, overall progress
- /progress-log - full progress report
- /progress-save - save current progress
- /phase-explain - explain current phase
- /step-explain - explain current checkpoint
- /gate-rollback - roll back one gate
- /mode-status - print Likit config summary
- /session-bundle - regenerate this context
- /gate-review - Vibe architecture audit
- /likit-help - command reference
- /export-template - export G0 output
- /likit-start - populate planning files from prompt.md

You are now operating inside Likit. Read the above, identify the current gate from Progress, and begin.
`;
}

async function runSessionBundle({ cwd, print = false }) {
  const config = readConfig(cwd);
  const bundle = assembleBundle({ cwd, config });

  if (['claude-chat', 'chatgpt', 'generic'].includes(config.tool)) {
    const fileName = TOOL_ENTRY[config.tool];
    fs.writeFileSync(path.join(cwd, fileName), bundle);
    console.log(`[likit] Session bundle regenerated: ${fileName}`);
  } else {
    console.log('[likit] Session bundle generated for copy-paste.');
  }

  if (print) {
    console.log('');
    console.log(bundle);
  }

  return bundle;
}

module.exports = {
  assembleBundle,
  runSessionBundle
};
