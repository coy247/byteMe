const fs = require("fs");
const path = require("path");
const Logger = require("./Logger");
class Config {
  constructor(options = {}) {
    this.configPath =
      options.configPath || process.env.CONFIG_PATH || "config.json";
    this.environment = process.env.NODE_ENV || "development";
    this.config = this.getDefaultConfig();
  }
  getDefaultConfig() {
    return {
      app: {
        name: "ByteMe",
        version: "1.0.0",
        maxFileSize: 1024 * 1024 * 10, // 10MB
      },
      storage: {
        modelPath: "./models",
        backupPath: "./backups",
        maxBackups: 5,
        compressionLevel: 9,
      },
      performance: {
        monitoring: true,
        sampleRate: 0.1,
        maxMemory: 512, // MB
      },
      logging: {
        level: "info",
        file: "app.log",
        maxSize: 1024 * 1024 * 100, // 100MB
      },
    };
  }
  async load() {
    try {
      if (fs.existsSync(this.configPath)) {
        const fileConfig = JSON.parse(fs.readFileSync(this.configPath, "utf8"));
        this.config = this.mergeConfigs(this.config, fileConfig);
      }
      this.applyEnvironmentOverrides();
      this.validate();
    } catch (error) {
      throw new Error(`Config loading error: ${error.message}`);
    }
  }
  mergeConfigs(defaultConfig, fileConfig) {
    return {
      ...defaultConfig,
      ...fileConfig,
      app: { ...defaultConfig.app, ...fileConfig.app },
      storage: { ...defaultConfig.storage, ...fileConfig.storage },
      performance: { ...defaultConfig.performance, ...fileConfig.performance },
      logging: { ...defaultConfig.logging, ...fileConfig.logging },
    };
  }
  applyEnvironmentOverrides() {
    Object.entries(process.env).forEach(([key, value]) => {
      if (key.startsWith("BYTE_ME_")) {
        const configPath = key.slice(8).toLowerCase().split("_");
        let current = this.config;
        for (let i = 0; i < configPath.length - 1; i++) {
          current = current[configPath[i]];
        }
        current[configPath[configPath.length - 1]] = this.parseValue(value);
      }
    });
  }
  parseValue(value) {
    if (value === "true") return true;
    if (value === "false") return false;
    if (!isNaN(value)) return Number(value);
    return value;
  }
  validate() {
    const required = ["app.name", "storage.modelPath", "logging.level"];
    for (const path of required) {
      if (!this.get(path)) {
        throw new Error(`Missing required config: ${path}`);
      }
    }
  }
  get(path) {
    return path
      .split(".")
      .reduce(
        (obj, key) => (obj && obj[key] ? obj[key] : undefined),
        this.config
      );
  }
  set(path, value) {
    const keys = path.split(".");
    const last = keys.pop();
    const target = keys.reduce(
      (obj, key) => (obj[key] = obj[key] || {}),
      this.config
    );
    target[last] = value;
  }
}
module.exports = Config;
const InitializationService = require("./services/InitializationService");
const { performanceWizard } = require("./utils/PerformanceUtils");
async function bootstrap() {
  const config = new Config();
  await config.load();
  const initService = new InitializationService(config);
  const { models, views, controllers } = await initService.initialize();
  performanceWizard.start();
  const { main: mainController } = controllers;
  await mainController.start();
}
bootstrap().catch((error) => {
  console.error("Failed to start application:", error);
  process.exit(1);
});
process.on("SIGTERM", () => performanceWizard.shutdown());
process.on("SIGINT", () => performanceWizard.shutdown());
