const fs = require("fs");
const path = require("path");
class LogRotator {
  constructor(config) {
    this.maxSize = config.maxSize || 5 * 1024 * 1024;
    this.logDir = path.join(process.cwd(), "logs");
    this.currentLogFile = path.join(this.logDir, "app.log");
  }
  async ensureLogDirectory() {
    await fs.promises.mkdir(this.logDir, { recursive: true });
  }
  async getCurrentLogFile() {
    return this.currentLogFile;
  }
  async rotateIfNeeded(logFile) {
    const stats = await fs.promises.stat(logFile);
    if (stats.size >= this.maxSize) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const rotatedFile = logFile + "." + timestamp;
      await fs.promises.rename(logFile, rotatedFile);
    }
  }
}
module.exports = { LogRotator };
