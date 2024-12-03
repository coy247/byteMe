const path = require("path");
const fs = require("fs");

function resolveModelPath() {
  return path.join(__dirname, "..", "..", "models", "patterns", "model.json");
}

function resolveBackupPath() {
  const modelPath = resolveModelPath();
  return path.join(path.dirname(modelPath), "model.backup.json");
}

function resolveConfigPath() {
  return path.join(__dirname, "..", "..", "config", "settings.json");
}

function validatePath(filePath) {
  if (typeof filePath !== "string") {
    throw new TypeError("Path must be a string");
  }
  const dir = path.dirname(filePath);
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return true;
  } catch (error) {
    throw new Error(`Path validation failed: ${error.message}`);
  }
}

function pathExists(filePath) {
  if (typeof filePath !== "string") {
    throw new TypeError("Path must be a string");
  }
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    throw new Error(`Path check failed: ${error.message}`);
  }
}

/**
 * Gets the directory path for the model files
 * @returns {string} The absolute path to the models directory
 */
function resolveModelDir() {
  return path.dirname(resolveModelPath());
}

module.exports = {
  resolveModelPath,
  resolveBackupPath,
  resolveConfigPath,
  validatePath,
  pathExists,
  resolveModelDir,
};
