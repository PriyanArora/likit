#!/usr/bin/env node
// Likit smoke test — no external deps. Run with: npm test
//
// Covers the two top publish risks:
//   1. CLI behaviour (help/version/banner/dry-run) does not crash.
//   2. Acceptance sweep: every mode x tool x type template generates cleanly.
//
// Exits non-zero on the first failure so it can gate `npm publish`.

const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const BIN = path.join(ROOT, 'bin', 'likit.js');

const generator = require('../src/generator');
const { MODES, TOOLS, PROJECT_TYPES, TOOL_ENTRY, generateFiles, dryRunFileList } = generator;

let passed = 0;
function check(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  ok   ${name}`);
  } catch (error) {
    console.error(`  FAIL ${name}\n       ${error.message}`);
    process.exitCode = 1;
  }
}

function cli(args, opts = {}) {
  return execFileSync('node', [BIN, ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    input: '',
    stdio: ['pipe', 'pipe', 'pipe'],
    ...opts
  });
}

console.log('CLI behaviour');
check('help lists commands', () => assert.match(cli(['help']), /Commands:/));
check('version prints likit 2.0.0', () => assert.match(cli(['version']), /likit 2\.0\.0/));
check('postinstall (non-interactive) prints init hint', () =>
  assert.match(cli(['postinstall']), /npx likit init/));
check('unknown command exits non-zero', () => {
  assert.throws(() => cli(['definitely-not-a-command']));
});

console.log('\nAcceptance sweep (mode x tool x type, dry-run)');
for (const mode of Object.keys(MODES)) {
  for (const tool of Object.keys(TOOLS)) {
    for (const type of Object.keys(PROJECT_TYPES)) {
      check(`${mode}/${tool}/${type} dry-run`, () => {
        const out = cli(['init', '--dry-run', '--mode', mode, '--tool', tool, '--type', type, '--solo']);
        assert.match(out, /\[DRY RUN\] No files written\./);
        // The entry file for the tool must appear in the planned output.
        const list = dryRunFileList({ mode, tool, projectType: type }, ROOT);
        assert.ok(
          list.includes(TOOL_ENTRY[tool]),
          `expected ${TOOL_ENTRY[tool]} in planned files, got: ${list.join(', ')}`
        );
      });
    }
  }
}

console.log('\nReal generation in a temp dir (one combo per mode)');
for (const [mode, tool, type] of [['mentored', 'claude-code', 'web'], ['vibe', 'codex-cli', 'systems']]) {
  check(`${mode}/${tool}/${type} writes entry + config`, () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'likit-smoke-'));
    try {
      generateFiles({ cwd: dir, mode, tool, projectType: type, teamMode: false });
      assert.ok(fs.existsSync(path.join(dir, TOOL_ENTRY[tool])), `${TOOL_ENTRY[tool]} not written`);
      const cfg = JSON.parse(fs.readFileSync(path.join(dir, '.likit', 'config.json'), 'utf8'));
      assert.strictEqual(cfg.mode, mode);
      assert.strictEqual(cfg.tool, tool);
      assert.ok(fs.existsSync(path.join(dir, '.likit', 'HOW_TO_USE.md')));
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
}

console.log('\nDoctor law checks (gate integrity, commit-lint, secret scan)');

function runDoctor(dir) {
  try {
    return { out: cli(['doctor'], { cwd: dir }), code: 0 };
  } catch (error) {
    return { out: `${error.stdout || ''}${error.stderr || ''}`, code: error.status || 1 };
  }
}

function doctorFixture({ progress, files = {}, commitMsg = 'chore: seed fixture' }) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'likit-doctor-'));
  fs.mkdirSync(path.join(dir, '.likit'), { recursive: true });
  fs.writeFileSync(path.join(dir, '.likit', 'config.json'), JSON.stringify({
    version: '2.0.0', created: '2026-07-02', mode: 'mentored', tool: 'claude-code',
    projectType: 'web', teamMode: false, username: 'p'
  }));
  fs.writeFileSync(path.join(dir, 'Progress.md'), progress);
  for (const [name, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, name), content);
  }
  const git = (args) => execFileSync('git', args, { cwd: dir, stdio: 'ignore' });
  git(['init']);
  git(['config', 'user.email', 'x@x.com']);
  git(['config', 'user.name', 'x']);
  git(['add', '-A']);
  git(['commit', '-m', commitMsg]);
  return dir;
}

function withFixture(opts, fn) {
  const dir = doctorFixture(opts);
  try {
    fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

const GATE5_DIRTY = '# Progress\n**Current Gate:** G5\n\n## G0 — Setup\n- [x] a\n## P3 — Data\n- [x] schema\n- [ ] seed\n## P5 — Core\n- [ ] current\n';
const GATE5_CLEAN = '# Progress\n**Current Gate:** G5\n\n## G0 — Setup\n- [x] a\n## P3 — Data\n- [x] schema\n- [x] seed\n## P5 — Core\n- [ ] current\n';

check('gate integrity flags an unproven earlier gate', () => {
  withFixture({ progress: GATE5_DIRTY }, (dir) => {
    const { out, code } = runDoctor(dir);
    assert.match(out, /✗ gate integrity/);
    assert.match(out, /P3/);
    assert.strictEqual(code, 1);
  });
});

check('gate integrity passes when earlier gates are proven', () => {
  withFixture({ progress: GATE5_CLEAN }, (dir) => {
    assert.match(runDoctor(dir).out, /✓ gate integrity/);
  });
});

check('commit-lint flags an off-convention commit', () => {
  withFixture({ progress: GATE5_CLEAN, commitMsg: 'WIP messy' }, (dir) => {
    assert.match(runDoctor(dir).out, /✗ commit convention/);
  });
});

check('commit-lint passes a conventional commit', () => {
  withFixture({ progress: GATE5_CLEAN, commitMsg: 'feat(seed): add fixture' }, (dir) => {
    assert.match(runDoctor(dir).out, /✓ commit convention/);
  });
});

check('secret scan flags a hardcoded key', () => {
  withFixture({ progress: GATE5_CLEAN, files: { 'app.js': 'const api_key = "sk_live_9x82hfALZ0qwerty";\n' } }, (dir) => {
    const { out, code } = runDoctor(dir);
    assert.match(out, /✗ no hardcoded secrets/);
    assert.strictEqual(code, 1);
  });
});

check('secret scan ignores env refs and placeholders', () => {
  withFixture({ progress: GATE5_CLEAN, files: { 'app.js': 'const k = process.env.API_KEY;\nconst x = "your_api_key_here";\n' } }, (dir) => {
    assert.match(runDoctor(dir).out, /✓ no hardcoded secrets/);
  });
});

console.log(`\n${passed} checks passed${process.exitCode ? ' (with failures above)' : ''}`);
