const fsPromises = require("fs").promises;

class FileManager {
  async writeModelFile(path, data) {
    const tempPath = path + ".tmp";
    try {
      await fsPromises.writeFile(tempPath, JSON.stringify(data, null, 2));
      await fsPromises.rename(tempPath, path);
    } catch (error) {
      throw new Error("File operation failed: " + error.message);
    }
  }
}

module.exports = { FileManager };
