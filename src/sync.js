const fs = require('node:fs');
const path = require('node:path');

const { readConfig, templateDir } = require('./generator');

const SYNC_FILES = new Set([
  'guide.md',
  'G0_questionnaire.md',
  'BuildFlow.md',
  'CLAUDE.md',
  'AGENTS.md',
  'likit.mdc',
  'likit.windsurfrules',
  'LIKIT_PROMPT.md',
  'LIKIT_GPT.md',
  'LIKIT_PROJECTS_PROMPT.md'
]);

function destinationForSync(config, file) {
  if (config.tool === 'cursor' && file === 'likit.mdc') {
    return path.join('.cursor', 'rules', 'likit.mdc');
  }
  if (config.tool === 'windsurf' && file === 'likit.windsurfrules') {
    return '.windsurfrules';
  }
  return file;
}

async function runSync({ cwd }) {
  const config = readConfig(cwd);
  const source = templateDir(config);
  if (!fs.existsSync(source)) {
    throw new Error(`Template directory missing: ${source}`);
  }

  let updated = 0;
  for (const file of fs.readdirSync(source)) {
    if (!SYNC_FILES.has(file)) continue;
    const sourceFile = path.join(source, file);
    if (!fs.statSync(sourceFile).isFile()) continue;

    const destination = path.join(cwd, destinationForSync(config, file));
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(sourceFile, destination);
    console.log(`[likit] updated ${path.relative(cwd, destination)}`);
    updated += 1;
  }

  console.log(`[likit] Sync complete. ${updated} files updated. User content preserved.`);
}

module.exports = {
  runSync
};
