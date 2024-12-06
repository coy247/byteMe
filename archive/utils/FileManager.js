const fs = require("fs").promises;
const path = require("path");
const crypto = require("crypto");

class FileManager {
  constructor() {
    this.modelPath = path.join(
      __dirname,
      "..",
      "..",
      "models",
      "patterns",
      "model.json"
    );
    this.backupPath = path.join(
      __dirname,
      "..",
      "..",
      "models",
      "patterns",
      "model.backup.json"
    );
  }

  async saveAnalysis(binary, result) {
    const modelData = {
      id: crypto
        .createHash("md5")
        .update(
          `${result.pattern_metrics.entropy}-${result.pattern_complexity?.type}-${binary}`
        )
        .digest("hex"),
      timestamp: Date.now(),
      pattern: result.pattern_complexity || {
        type: "unknown",
        data: "",
        length: 0,
      },
      metrics: {
        entropy: result.pattern_metrics.entropy || 0,
        complexity: result.pattern_complexity?.level || 0,
        burstiness: result.pattern_metrics.burstiness || 0,
      },
    };

    try {
      await this.ensureDirectoryExists(path.dirname(this.modelPath));
      let existingData = [];

      try {
        const fileContent = await fs.readFile(this.modelPath, "utf8");
        existingData = JSON.parse(fileContent);
      } catch (e) {
        // Handle first run
      }

      existingData = existingData.filter((item) => item.id !== modelData.id);
      existingData.push(modelData);
      existingData = existingData
        .slice(-1000)
        .sort((a, b) => b.timestamp - a.timestamp);

      await fs.writeFile(this.modelPath, JSON.stringify(existingData, null, 2));
      return modelData;
    } catch (error) {
      throw new Error(`Failed to save analysis: ${error.message}`);
    }
  }

  async ensureDirectoryExists(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      if (error.code !== "EEXIST") {
        throw error;
      }
    }
  }
}

module.exports = FileManager;
