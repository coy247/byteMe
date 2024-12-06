const fs = require("fs");
const path = require("path");
const { ModelFileIO } = require("../utils/ModelFileIO");
const crypto = require("crypto");
const zlib = require("zlib");
class ModelStorage {
  constructor(basePath) {
    this.basePath = basePath;
    this.fileIO = new ModelFileIO();
    this.maxFileAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    this.indexPath = path.join(basePath, "index.json");
    this.compressionLevel = 9;
  }
  async saveModel(modelData) {
    const modelPath = path.join(this.basePath, "models");
    const modelFile = path.join(modelPath, "model.json");
    await this.fileIO.ensureDirectory(modelPath);
    const existingData = (await this.fileIO.readJson(modelFile)) || [];
    modelData.id = this.generateUniqueId(modelData);
    modelData.version = this.incrementVersion(existingData, modelData);
    const updatedData = this.updateModelData(existingData, modelData);
    await this.fileIO.writeJson(modelFile, updatedData);
    await this.cleanupOldFiles(modelPath);
    return modelData.summary;
  }
  generateUniqueId(modelData) {
    return crypto
      .createHash("md5")
      .update(JSON.stringify(modelData) + "-" + Date.now())
      .digest("hex");
  }
  incrementVersion(existingData, newData) {
    const existing = existingData.find(
      (item) =>
        (item.pattern_metrics && item.pattern_metrics.entropy) ===
        (newData.pattern_metrics && newData.pattern_metrics.entropy)
    );
    return existing ? (existing.version || 0) + 1 : 1;
  }
  updateModelData(existingData, newData) {
    const filtered = existingData.filter((item) => item.id !== newData.id);
    return [...filtered, newData]
      .slice(-1000)
      .sort((a, b) => b.timestamp - a.timestamp);
  }
  async mergeModels(targetPath, sourcePath) {
    const targetData = (await this.fileIO.readJson(targetPath)) || [];
    const sourceData = (await this.fileIO.readJson(sourcePath)) || [];
    const merged = this.removeDuplicates([...targetData, ...sourceData]);
    await this.fileIO.writeJson(targetPath, merged);
    return merged;
  }
  removeDuplicates(data) {
    return data.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id)
    );
  }
  async cleanupOldFiles(dirPath) {
    const now = Date.now();
    const files = await this.fileIO.readDirectory(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = await this.fileIO.getFileStats(filePath);
      if (now - stats.mtimeMs > this.maxFileAge) {
        await this.fileIO.deleteFile(filePath);
      }
    }
  }
  async validateModelData(modelData) {
    if (!modelData || typeof modelData !== "object") {
      throw new Error("Invalid model data structure");
    }
    const requiredFields = ["pattern_metrics", "timestamp", "version"];
    for (const field of requiredFields) {
      if (!(field in modelData)) {
        throw new Error("Missing required field: " + field);
      }
    }
    await this.validatePatternMetrics(modelData.pattern_metrics);
    return true;
  }
  async validatePatternMetrics(metrics) {
    const requiredMetrics = ["entropy", "complexity", "confidence"];
    for (const metric of requiredMetrics) {
      if (!(metric in metrics)) {
        throw new Error("Missing required metric: " + metric);
      }
    }
  }
  async backupModel(modelPath, compress = true) {
    const backupDir = path.join(this.basePath, "backups");
    await this.fileIO.ensureDirectory(backupDir);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(
      backupDir,
      "model-" + timestamp + ".json" + (compress ? ".gz" : "")
    );
    if (compress) {
      await this.compressAndSave(modelPath, backupPath);
    } else {
      await this.fileIO.copyFile(modelPath, backupPath);
    }
    await this.updateModelIndex(backupPath, timestamp);
    return backupPath;
  }
  async compressAndSave(sourcePath, destPath) {
    const readStream = fs.createReadStream(sourcePath);
    const writeStream = fs.createWriteStream(destPath);
    const gzip = zlib.createGzip({ level: this.compressionLevel });
    return new Promise((resolve, reject) => {
      readStream
        .pipe(gzip)
        .pipe(writeStream)
        .on("finish", resolve)
        .on("error", reject);
    });
  }
  async updateModelIndex(backupPath, timestamp) {
    const index = (await this.fileIO.readJson(this.indexPath)) || {};
    index[timestamp] = {
      path: backupPath,
      created: Date.now(),
      compressed: backupPath.endsWith(".gz"),
    };
    await this.fileIO.writeJson(this.indexPath, index);
  }
  async restoreFromBackup(timestamp) {
    const index = await this.fileIO.readJson(this.indexPath);
    if (!index || !index[timestamp]) {
      throw new Error("Backup not found");
    }
    const backup = index[timestamp];
    const modelPath = path.join(this.basePath, "models", "model.json");
    if (backup.compressed) {
      await this.decompressAndRestore(backup.path, modelPath);
    } else {
      await this.fileIO.copyFile(backup.path, modelPath);
    }
    return modelPath;
  }
  async decompressAndRestore(sourcePath, destPath) {
    const readStream = fs.createReadStream(sourcePath);
    const writeStream = fs.createWriteStream(destPath);
    const gunzip = zlib.createGunzip();
    return new Promise((resolve, reject) => {
      readStream
        .pipe(gunzip)
        .pipe(writeStream)
        .on("finish", resolve)
        .on("error", reject);
    });
  }
}
module.exports = ModelStorage;
