const fs = require("fs");
const path = require("path");
const { LogFormatter } = require("../utils/LogFormatter");
const { LogRotator } = require("../utils/LogRotator");
const LoggerService = require("../services/LoggerService");
class Logger {
  constructor(options = {}) {
    this.level = options.level || "info";
    this.service = new LoggerService(options);
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
    };
  }
  async log(level, ...args) {
    if (this.levels[level] <= this.levels[this.level]) {
      const message = args.join(" ");
      await this.service.log(level, message);
    }
  }
  error(...args) {
    return this.log("error", ...args);
  }
  warn(...args) {
    return this.log("warn", ...args);
  }
  info(...args) {
    return this.log("info", ...args);
  }
  debug(...args) {
    return this.log("debug", ...args);
  }
}
class LoggerService {
  constructor(config) {
    this.formatter = new LogFormatter();
    this.rotator = new LogRotator(config);
    this.logPath = path.join(process.cwd(), "logs");
  }
  async log(level, message, metadata = {}) {
    const formattedMessage = this.formatter.format(level, message, metadata);
    await this.writeToConsole(level, formattedMessage);
    await this.writeToFile(formattedMessage);
  }
  async writeToConsole(level, message) {
    const coloredMessage = this.formatter.colorize(level, message);
    console.log(coloredMessage);
  }
  async writeToFile(message) {
    await this.rotator.ensureLogDirectory();
    const logFile = await this.rotator.getCurrentLogFile();
    await fs.promises.appendFile(logFile, message + "\n");
    await this.rotator.rotateIfNeeded(logFile);
  }
}
module.exports = Logger;
