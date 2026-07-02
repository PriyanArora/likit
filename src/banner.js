// Renders the Likit install banner: chunky pure-ASCII wordmark plus tagline.
// Uses plain ASCII so it renders in any terminal regardless of font support,
// and adds cyan ANSI colour only when stdout is an interactive terminal.

const ART = [
  '  ##      #####  ##  ##  #####  ######',
  '  ##        ##   ## ##     ##     ##  ',
  '  ##        ##   ####      ##     ##  ',
  '  ##        ##   ####      ##     ##  ',
  '  ##        ##   ## ##     ##     ##  ',
  '  ######  #####  ##  ##  #####    ##  '
];

const TAGLINE = 'Lightweight Kit for Agentic Workflows — likit.dev';
const START_HINT = "Run 'claude' in your project folder to begin.";

// Colourise only on a real TTY; fall back to plain text everywhere else.
function paint(line, useColor) {
  if (!useColor) return line;
  return `[36m${line}[0m`;
}

function bannerLines({ useColor = false } = {}) {
  return [
    '',
    ...ART.map((line) => paint(line, useColor)),
    '',
    TAGLINE,
    START_HINT
  ];
}

function printBanner({ stream = process.stdout } = {}) {
  const useColor = Boolean(stream.isTTY);
  for (const line of bannerLines({ useColor })) {
    stream.write(`${line}\n`);
  }
}

module.exports = {
  bannerLines,
  printBanner
};
