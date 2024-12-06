const fs = require("fs");
const path = require("path");
class Logger {
  constructor(options = {}) {
    this.level = options.level || "info";
    this.logFile = options.logFile || "app.log";
    this.maxSize = options.maxSize || 5 * 1024 * 1024; // 5MB
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
    };
    this.colors = {
      error: "\x1b[31m",
      warn: "\x1b[33m",
      info: "\x1b[36m",
      debug: "\x1b[90m",
      reset: "\x1b[0m",
    };
  }
  log(level, ...args) {
    if (this.levels[level] <= this.levels[this.level]) {
      const timestamp = new Date().toISOString();
      const message =
        "[" + timestamp + "] " + level.toUpperCase() + ": " + args.join(" ");
      // Console output with colors
      console.log(`${this.colors[level]}${message}${this.colors.reset}`);
      // File output
      console.log(this.colors[level] + message + this.colors.reset);
    }
  }
  error(...args) {
    this.log("error", ...args);
  }
  warn(...args) {
    this.log("warn", ...args);
  }
  info(...args) {
    this.log("info", ...args);
  }
  debug(...args) {
    this.log("debug", ...args);
  }
  async writeToFile(message) {
    try {
      const logPath = path.join(process.cwd(), "logs", this.logFile);
      await this.ensureLogDirectory();
      await this.rotateLogFileIfNeeded(logPath);
      await fs.promises.appendFile(logPath, message + "\n");
    } catch (error) {
      console.error("Failed to write to log file:", error);
    }
  }
  async ensureLogDirectory() {
    const logDir = path.join(process.cwd(), "logs");
    try {
      await fs.promises.mkdir(logDir, { recursive: true });
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
    }
  }
  async rotateLogFileIfNeeded(logPath) {
    try {
      const stats = await fs.promises.stat(logPath);
      if (stats.size >= this.maxSize) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const newPath = logPath + "." + timestamp;
        await fs.promises.rename(logPath, newPath);
      }
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
}
module.exports = Logger;
