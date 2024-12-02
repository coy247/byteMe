const { resolveModelPath } = require("../utils/PathResolver");
const { validateModel } = require("./ModelValidator");
const { FileManager } = require("../utils/FileManager");

const path = require("path");
const fsPromises = require("fs").promises;

const MODEL_PATH = path.join(
  __dirname,
  "..",
  "..",
  "models",
  "patterns",
  "model.json"
);
const BACKUP_PATH = path.join(
  __dirname,
  "..",
  "..",
  "models",
  "patterns",
  "model.backup.json"
);

class ModelManager {
  constructor() {
    this.fileManager = new FileManager();
    this.MODEL_PATH = resolveModelPath();
    this.BACKUP_PATH = BACKUP_PATH;
    this.lastSave = Date.now();
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    try {
      await this.loadOrCreateModel();
      this.initialized = true;
    } catch (error) {
      console.error("Model initialization failed:", error);
      throw error;
    }
  }

  async loadOrCreateModel() {
    try {
      const exists = await fsPromises
        .access(this.MODEL_PATH)
        .then(() => true)
        .catch(() => false);

      if (exists) {
        const data = await fsPromises.readFile(this.MODEL_PATH, "utf8");
        this.model = JSON.parse(data);
      } else {
        this.model = {
          version: "1.1",
          lastUpdated: Date.now(),
          analyses: [],
          metadata: {
            categories: ["alternating", "mixed", "periodic", "random"],
            metrics: ["entropy", "complexity", "burstiness"],
            thresholds: {
              entropy: { low: 0.3, medium: 0.7, high: 0.9 },
            },
          },
        };
        await this.saveModel();
      }
    } catch (error) {
      console.error("Error loading model:", error);
      throw error;
    }
  }

  async saveModel() {
    try {
      if (!validateModel(this.model)) {
        throw new Error("Invalid model structure");
      }
      await this.fileManager.writeModelFile(this.MODEL_PATH, this.model);
    } catch (error) {
      console.error("Error saving model:", error);
      throw error;
    }
  }
}

module.exports = ModelManager;
