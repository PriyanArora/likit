const fs = require('node:fs');
const path = require('node:path');

const { VERSION, generateFiles, readConfig } = require('./generator');

function readRequired(cwd, file) {
  const full = path.join(cwd, file);
  if (!fs.existsSync(full)) {
    throw new Error(`${file} missing. Complete G0 before exporting a template.`);
  }
  return fs.readFileSync(full, 'utf8');
}

async function exportTemplate({ cwd }) {
  const config = readConfig(cwd);
  const output = {
    likitVersion: VERSION,
    exportDate: new Date().toISOString(),
    mode: config.mode,
    tool: config.tool,
    projectType: config.projectType,
    fillManifest: readRequired(cwd, '_fill_manifest.md'),
    buildFlow: readRequired(cwd, 'BuildFlow.md'),
    notes: ''
  };

  fs.writeFileSync(path.join(cwd, 'project.likit.json'), `${JSON.stringify(output, null, 2)}\n`);
  console.log('[likit] Template exported to project.likit.json - commit this to share with your team or use it on future projects.');
}

function findTemplateFile(cwd) {
  const matches = fs.readdirSync(cwd).filter((file) => file.endsWith('.likit.json'));
  if (matches.length === 0) {
    throw new Error('No .likit.json file found. Pass a file path.');
  }
  return path.join(cwd, matches[0]);
}

async function importTemplate({ cwd, file }) {
  const inputFile = file || findTemplateFile(cwd);
  const template = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

  generateFiles({
    cwd,
    mode: template.mode || 'mentored',
    tool: template.tool || 'claude-code',
    projectType: template.projectType || 'web',
    teamMode: false,
    preserveUserContent: false
  });

  if (template.fillManifest) {
    fs.writeFileSync(path.join(cwd, '_fill_manifest.md'), template.fillManifest);
  }
  if (template.buildFlow) {
    fs.writeFileSync(path.join(cwd, 'BuildFlow.md'), template.buildFlow);
  }

  console.log('[likit] Architecture pre-loaded from template. Confirm, modify, or reject.');
  console.log('[likit] Template imported. G0 pre-filled. Start with your selected AI tool to confirm and adapt the architecture.');
}

module.exports = {
  exportTemplate,
  importTemplate
};
