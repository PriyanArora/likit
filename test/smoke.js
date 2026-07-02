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

console.log(`\n${passed} checks passed${process.exitCode ? ' (with failures above)' : ''}`);
