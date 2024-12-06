const fs = require("fs").promises;
const path = require("path");
class ModelFileIO {
  async ensureDirectory(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
    }
  }
  async readJson(filePath) {
    try {
      const data = await fs.readFile(filePath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      if (error.code === "ENOENT") return null;
      throw error;
    }
  }
  async writeJson(filePath, data) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }
}
module.exports = { ModelFileIO };
