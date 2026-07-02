const fs = require('node:fs');
const path = require('node:path');

const { TOOL_ENTRY, tryReadConfig } = require('./generator');

// Tools whose agents load slash commands and can run /likit-start directly.
const COMMAND_TOOLS = new Set(['claude-code', 'cursor']);

// `likit start` surfaces the prompt.md instruction so the configured AI tool can
// populate the planning files. The intelligent fill is the agent's job: a CLI
// cannot derive ProjectSummary/BuildFlow/Progress content from a free-form spec.
async function runStart({ cwd }) {
  const promptPath = path.join(cwd, 'prompt.md');
  if (!fs.existsSync(promptPath)) {
    throw new Error('No prompt.md found. Run `npx likit init` and provide your specification, or create prompt.md first.');
  }

  const config = tryReadConfig(cwd);
  const tool = config ? config.tool : 'claude-code';
  console.log('[likit] prompt.md found. Hand it to your AI tool to populate the planning files.');

  if (COMMAND_TOOLS.has(tool)) {
    console.log('[likit] Run /likit-start in your AI tool to read prompt.md and fill ProjectSummary.md, BuildFlow.md, and Progress.md.');
  } else {
    const entry = TOOL_ENTRY[tool] || 'the entry point file';
    console.log(`[likit] Your tool does not load slash commands. Tell the agent: "read prompt.md and populate the planning files." (See ${entry}.)`);
  }
}

module.exports = {
  runStart
};
