const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

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

// Gate integrity: if Progress.md claims to be on gate G<N>, every checkbox in an
// earlier gate section must be [x]. Gate G<k> corresponds to phase P<k>, and G0 is
// the setup section \u2014 so a section headed "G0" or "P<k>" belongs to gate number k.
function sectionGate(header) {
  const g = header.match(/^G(\d+)/);
  if (g) return Number(g[1]);
  const p = header.match(/^P(\d+)/);
  if (p) return Number(p[1]);
  return null;
}

// Commit-lint (Habit H3): recent commit subjects must match the conventional-commit
// convention and stay under 72 chars. Merge/Revert commits are exempt.
const COMMIT_RE = /^(feat|fix|chore|test|refactor|docs|ci|perf)(\([^)]+\))?!?: .+/;

function commitLint(cwd) {
  let log;
  try {
    log = execFileSync('git', ['log', '--format=%s', '-n', '20'], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    });
  } catch {
    return { skip: true }; // not a git repo / no commits yet
  }
  const subjects = log.split('\n').map((s) => s.trim())
    .filter((s) => s && !/^(Merge|Revert)\b/.test(s));
  const bad = subjects.filter((s) => !COMMIT_RE.test(s) || s.length > 72);
  return {
    skip: subjects.length === 0,
    ok: bad.length === 0,
    detail: bad.length ? `${bad.length} of ${subjects.length} off-convention, e.g. "${bad[0].slice(0, 50)}"` : ''
  };
}

function gateIntegrity(cwd) {
  if (!exists(cwd, 'Progress.md')) return { skip: true };
  const content = fs.readFileSync(path.join(cwd, 'Progress.md'), 'utf8');
  const current = content.match(/\*\*Current Gate:\*\*\s*G(\d+)/i);
  if (!current) return { skip: true };
  const currentGate = Number(current[1]);

  const violations = [];
  let gate = null;
  let label = null;
  let unchecked = 0;
  const flush = () => {
    if (gate !== null && gate < currentGate && unchecked > 0) {
      violations.push(`${label} has ${unchecked} unchecked box${unchecked > 1 ? 'es' : ''}`);
    }
  };
  for (const line of content.split('\n')) {
    const heading = line.match(/^##\s+(.+)$/);
    if (heading) {
      flush();
      label = heading[1].split(/[\s\u2014-]/)[0];
      gate = sectionGate(heading[1]);
      unchecked = 0;
    } else if (/^\s*-\s*\[ \]/.test(line)) {
      unchecked += 1;
    }
  }
  flush();
  return { skip: false, ok: violations.length === 0, detail: violations.join('; ') };
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

  let total = 8;

  console.log('\n— Law checks —');

  const gate = gateIntegrity(cwd);
  if (!gate.skip) {
    total += 1;
    passed += check('gate integrity — earlier gates fully proven', gate.ok, gate.detail);
  }

  const commits = commitLint(cwd);
  if (!commits.skip) {
    total += 1;
    passed += check('commit convention — recent commits well-formed', commits.ok, commits.detail);
  }

  console.log(`\n${passed}/${total} checks passed`);
  if (passed < total) {
    console.log('Suggestion: resolve the failures above, then rerun `npx likit doctor`.');
  }
}

module.exports = {
  runDoctor
};
