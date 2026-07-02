#!/usr/bin/env node

const path = require('node:path');

const { runWizard } = require('../src/wizard');
const { printHelp, printVersion, teamStatus } = require('../src/generator');
const { runSync } = require('../src/sync');
const { runDoctor } = require('../src/doctor');
const { runMigrate } = require('../src/migrate');
const { exportTemplate, importTemplate } = require('../src/template');
const { runSessionBundle } = require('../src/bundle');
const { printBanner } = require('../src/banner');
const { runStart } = require('../src/start');

async function main() {
  const argv = process.argv.slice(2);
  const command = argv[0] || 'init';
  const cwd = process.cwd();

  switch (command) {
    case 'postinstall':
      printBanner();
      if (process.stdin.isTTY && process.stdout.isTTY) {
        await runWizard({ cwd, argv: argv.slice(1), fromPostinstall: true });
      } else {
        console.log('[likit] Run: npx likit init');
        console.log('  to set up your AI workflow kit.');
      }
      break;
    case 'init':
      await runWizard({ cwd, argv: argv.slice(1) });
      break;
    case 'start':
      await runStart({ cwd });
      break;
    case 'sync':
      await runSync({ cwd });
      break;
    case 'doctor':
      await runDoctor({ cwd });
      break;
    case 'migrate':
      await runMigrate({ cwd });
      break;
    case 'export-template':
      await exportTemplate({ cwd });
      break;
    case 'import-template':
      await importTemplate({ cwd, file: argv[1] ? path.resolve(cwd, argv[1]) : null });
      break;
    case 'version':
      printVersion({ cwd });
      break;
    case 'help':
    case '--help':
    case '-h':
      printHelp();
      break;
    case 'session-bundle':
      await runSessionBundle({ cwd, print: true });
      break;
    case 'team-status':
      teamStatus({ cwd });
      break;
    default:
      console.error(`[likit] Unknown command: ${command}`);
      printHelp();
      process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`[likit] ${error.message}`);
  process.exitCode = 1;
});
