const path = require("path");

function resolveModelPath() {
  return path.join(__dirname, "..", "..", "models", "patterns", "model.json");
}

module.exports = { resolveModelPath };
