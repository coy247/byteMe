const fs = require("fs");
const path = require("path");
const { ModelFileIO } = require("../utils/ModelFileIO");
class ModelStorage {
  constructor(basePath) {
    this.basePath = basePath;
    this.fileIO = new ModelFileIO();
  }
  async saveModel(modelData) {
    const modelPath = path.join(this.basePath, "models");
    const modelFile = path.join(modelPath, "model.json");
    await this.fileIO.ensureDirectory(modelPath);
    const existingData = (await this.fileIO.readJson(modelFile)) || [];
    const updatedData = this.updateModelData(existingData, modelData);
    await this.fileIO.writeJson(modelFile, updatedData);
    return modelData.summary;
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
    return this.removeDuplicates([...targetData, ...sourceData]);
  }
  removeDuplicates(data) {
    return data.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id)
    );
  }
}
module.exports = ModelStorage;
