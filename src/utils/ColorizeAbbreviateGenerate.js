function colorizeJson(json) {
  const green = "\x1b[32m";
  const yellow = "\x1b[33m";
  const reset = "\x1b[0m";
  return JSON.stringify(json, null, 2)
    .replace(/"([^"]+)":/g, (match, p1) => `${green}"${p1}":${reset}`)
    .replace(/: (\d+(\.\d+)?)/g, (match, p1) => `: ${yellow}${p1}${reset}`);
}

function abbreviateInput(input, maxLength = 10) {
  return input.length > maxLength ? input.slice(0, maxLength) : input;
}

function generateFilename(input) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const abbreviatedInput = abbreviateInput(input).replace(/\s+/g, "_"); // Replace spaces with underscores
  return `${abbreviatedInput}_${timestamp}.json`;
}

module.exports = {
  colorizeJson,
  abbreviateInput,
  generateFilename,
};
