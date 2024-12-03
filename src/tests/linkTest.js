const path = require("path");
const { DataProcessor } = require("../models/DataProcessor");
const {
  resolveModelPath,
  resolveBackupPath,
} = require("../utils/PathResolver");
const FileManager = require("../utils/FileManager");
const ModelManager = require("../models/ModelManager");

async function testLinks() {
  try {
    // Test PathResolver
    console.log("Testing PathResolver...");
    const modelPath = resolveModelPath();
    const backupPath = resolveBackupPath();
    console.log("Model path:", modelPath);
    console.log("Backup path:", backupPath);

    // Test FileManager
    console.log("\nTesting FileManager...");
    const fileManager = new FileManager();
    console.log("FileManager initialized");

    // Test ModelManager
    console.log("\nTesting ModelManager...");
    const modelManager = new ModelManager();
    console.log("ModelManager initialized");

    // Test DataProcessor
    console.log("\nTesting DataProcessor...");
    const processor = new DataProcessor();
    console.log("DataProcessor initialized");

    // Test sample processing
    const testBinary = "1010101010";
    const result = processor.processData(testBinary);
    console.log("\nTest processing result:", result);

    console.log("\nAll links tested successfully");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testLinks();
