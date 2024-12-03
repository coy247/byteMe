const fsPromises = require("fs").promises;
const path = require("path");
const {
  resolveModelPath,
  resolveBackupPath,
  validatePath,
  pathExists,
} = require("../utils/PathResolver");

class FileManager {
  constructor() {
    this.tempExtension = ".tmp";
  }

  async writeModelFile(path, data) {
    const tempPath = `${path}${this.tempExtension}`;
    try {
      await fsPromises.writeFile(tempPath, JSON.stringify(data, null, 2));
      await fsPromises.rename(tempPath, path);
    } catch (error) {
      throw new Error(`File operation failed: ${error.message}`);
    }
  }

  async readModelFile(path) {
    try {
      validatePath(path);
      const data = await fsPromises.readFile(path, "utf8");
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }
}

class ModelManager {
  constructor() {
    this.fileManager = new FileManager();
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
      throw new Error(`Failed to load or create model: ${error.message}`);
    }
  }
}

module.exports = ModelManager;
