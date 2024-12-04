const {
  resolveModelPath,
  resolveBackupPath,
  validatePath,
  pathExists,
} = require("../utils/PathResolver");
const FileManager = require("../utils/FileManager");

const path = require("path");
const fsPromises = require("fs").promises;

class ModelManager {
  constructor() {
    this.fileManager = new FileManager(); // Fix: Create instance
    this.MODEL_PATH = resolveModelPath();
    this.BACKUP_PATH = resolveBackupPath();
    this.lastSave = Date.now();
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    try {
      validatePath(this.MODEL_PATH);
      validatePath(this.BACKUP_PATH);
      await this.loadOrCreateModel();
      this.initialized = true;
    } catch (error) {
      console.error("Model initialization failed:", error);
      throw error;
    }
  }

  async loadOrCreateModel() {
    try {
      if (pathExists(this.MODEL_PATH)) {
        this.model = await this.fileManager.readModelFile(this.MODEL_PATH);
      } else {
        this.model = this.createDefaultModel();
        await this.saveModel();
      }
    } catch (error) {
      throw new Error("Failed to load or create model: " + error.message);
    }
  }

  async saveModel() {
    try {
      await this.fileManager.writeModelFile(this.MODEL_PATH, this.model);
      this.lastSave = Date.now();
    } catch (error) {
      throw new Error("Failed to save model: " + error.message);
    }
  }

  createDefaultModel() {
    return {
      version: "1.0",
      lastUpdated: Date.now(),
      analyses: [],
      metadata: {
        categories: ["alternating", "periodic", "random", "mixed"],
        metrics: ["entropy", "complexity", "burstiness"],
        thresholds: {
          entropy: 0.9,
          complexity: 0.8,
          burstiness: 0.7,
        },
      },
    };
  }

  async backup() {
    if (!this.initialized) {
      throw new Error("Model not initialized");
    }
    try {
      validatePath(this.BACKUP_PATH);
      await this.fileManager.writeModelFile(this.BACKUP_PATH, this.model);
      console.log("Backup created successfully");
    } catch (error) {
      throw new Error("Failed to create backup: " + error.message);
    }
  }

  async addAnalysis(analysis) {
    if (!this.initialized) await this.initialize();
    this.model.analyses.push(analysis);
    this.model.lastUpdated = Date.now();
    await this.saveModel();
    if (this.model.analyses.length % 10 === 0) {
      await this.backup();
    }
  }
}

module.exports = ModelManager;
