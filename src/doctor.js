const fs = require('node:fs');
const path = require('node:path');

const { TOOL_ENTRY, readConfig } = require('./generator');

const PLACEHOLDERS = [
  '[PLACEHOLDER]',
  '[TO_BE_FILLED]',
  '[G0.6 fills]',
  '[G0 fills',
  '[FILLED BY G0.6]',
  '[FILLED BY G0',
  '[NAME]',
  '[DATE]',
  '[PROJECT_SCOPES]',
  '[TDD_TARGETS]',
  '[DOCKER_PHASE]',
  '[CI_PHASE]',
  '[PROJECT_RED_LINES]',
  '[APP_NAME]'
];

function exists(cwd, relative) {
  return fs.existsSync(path.join(cwd, relative));
}

function fileHasPlaceholder(cwd, relative) {
  if (!exists(cwd, relative)) return true;
  const content = fs.readFileSync(path.join(cwd, relative), 'utf8');
  return PLACEHOLDERS.some((placeholder) => content.includes(placeholder));
}

function check(label, passed, explanation) {
  console.log(`${passed ? '\u2713' : '\u2717'} ${label}${passed ? '' : ` - ${explanation}`}`);
  return passed ? 1 : 0;
}

async function runDoctor({ cwd }) {
  let passed = 0;
  let config = null;

  try {
    config = readConfig(cwd);
    const required = ['version', 'created', 'mode', 'tool', 'projectType', 'teamMode', 'username'];
    const complete = required.every((field) => Object.prototype.hasOwnProperty.call(config, field));
    passed += check('config exists and has required fields', complete, 'missing required config field');
  } catch (error) {
    check('config exists and has required fields', false, error.message);
  }

  if (!config) {
    console.log('0/8 checks passed');
    console.log('Suggestion: run `npx likit init`.');
    return;
  }

  const entry = TOOL_ENTRY[config.tool];
  passed += check('entry point exists', entry && exists(cwd, entry), `${entry || 'entry'} missing`);

  const chatTool = ['claude-chat', 'chatgpt', 'generic'].includes(config.tool);
  const guideOk = chatTool
    ? exists(cwd, entry)
    : exists(cwd, 'guide.md');
  passed += check('guide exists or is bundled', guideOk, chatTool ? `${entry} missing` : 'guide.md missing');

  const buildFlowOk = exists(cwd, 'BuildFlow.md') && !fileHasPlaceholder(cwd, 'BuildFlow.md');
  passed += check('BuildFlow.md exists and is filled', buildFlowOk, 'missing or still contains G0 placeholders');

  passed += check('Progress.md exists', exists(cwd, 'Progress.md'), 'Progress.md missing');
  passed += check('ProjectSummary.md exists', exists(cwd, 'ProjectSummary.md'), 'ProjectSummary.md missing');

  const leftovers = ['ProjectSummary_web.md', 'ProjectSummary_systems.md', 'ProjectSummary_creative.md']
    .filter((file) => exists(cwd, file));
  passed += check('no leftover ProjectSummary templates', leftovers.length === 0, `${leftovers.join(', ')} still present`);

  const teamProgress = fs.existsSync(path.join(cwd, '.likit'))
    ? fs.readdirSync(path.join(cwd, '.likit')).filter((file) => /^Progress_.+\.md$/.test(file))
    : [];
  const teamOk = config.teamMode ? teamProgress.length > 0 : true;
  passed += check('team progress files valid', teamOk, 'team mode needs at least one .likit/Progress_*.md file');

  console.log(`${passed}/8 checks passed`);
  if (passed < 8) {
    console.log('Suggestion: complete G0, then rerun `npx likit doctor`.');
  }
}

module.exports = {
  runDoctor
};
