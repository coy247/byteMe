const fs = require("fs");
const path = require("path");
const readline = require("readline");
const MainController = require("./controllers/MainController");
const AnalysisController = require("./controllers/AnalysisController");
const VisualizationController = require("./controllers/VisualizationController");
// Models
const BinaryModel = require("./models/BinaryModel");
const MetricsModel = require("./models/MetricsModel");
const PatternModel = require("./models/PatternModel");
// Views
const MetricsView = require("./views/MetricsView");
const PatternView = require("./views/PatternView");
const patternModel = new PatternModel();
const patternView = new PatternView();
const binaryModel = new BinaryModel();
const metricsModel = new MetricsModel();
const metricsView = new MetricsView();
const mainController = new MainController({
  binaryModel,
  metricsModel,
  patternModel,
  metricsView,
  patternView,
});
const analysisController = new AnalysisController({
  patternModel,
  metricsModel,
});
const visualizationController = new VisualizationController({
  metricsView,
  patternView,
});
// Preprocess binary string
function preprocessBinary(binary) {
  return binary.replace(/[^01]/g, "");
}
// Convert any input to binary
function convertToBinary(input) {
  if (/^[01]+$/.test(input)) {
    return input;
  }
  return input
    .split("")
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
    .join("");
}
// Revert binary to original input
function revertFromBinary(binary, originalInput) {
  if (/^[01]+$/.test(originalInput)) {
    return binary;
  }
  return binary
    .match(/.{1,8}/g)
    .map((byte) => String.fromCharCode(parseInt(byte, 2)))
    .join("");
}
// Function to colorize JSON output using ANSI escape codes
function colorizeJson(json) {
  const green = "\x1b[32m";
  const yellow = "\x1b[33m";
  const reset = "\x1b[0m";
  return JSON.stringify(json, null, 2)
    .replace(/"([^"]+)":/g, (match, p1) => green + '"' + p1 + '":' + reset)
    .replace(/: (\d+(\.\d+)?)/g, (match, p1) => ": " + yellow + p1 + reset);
}
// Function to abbreviate input if necessary
function abbreviateInput(input, maxLength = 10) {
  return input.length > maxLength ? input.slice(0, maxLength) : input;
}
// Function to generate filename based on input and timestamp
function generateFilename(input) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const abbreviatedInput = abbreviateInput(input).replace(/\s+/g, "_"); // Replace spaces with underscores
  return abbreviatedInput + "_" + timestamp + ".json";
}
// Function to write analysis result to a file
function writeResultToFile(result, input) {
  try {
    const outputDir = path.resolve(__dirname, "../output");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const filename = generateFilename(input);
    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(result, null, 2));
    return filepath;
  } catch (error) {
    console.error("Error writing file:", error);
    process.exit(1);
  }
}
// Function to prompt the user to save the result to a file
async function promptToSave(result, input) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const answer = await new Promise((resolve) => {
      rl.question("Would you like to save the results? (y/n) ", resolve);
    });

    if (answer.toLowerCase() === "y") {
      const filepath = writeResultToFile(result, input);
      console.log(`Result written to file: ${filepath}`);
      process.exit(0);
    } else {
      console.log("Results not saved");
      process.exit(0);
    }
  } catch (error) {
    console.error("Error during save prompt:", error);
    process.exit(1);
  } finally {
    rl.close();
  }
}
// Function to analyze binary strings using mainController
async function analyzeBinary(binary, originalInput) {
  const cleanBinary = preprocessBinary(binary);
  const result = await mainController.analyze(cleanBinary);
  result.originalInput = revertFromBinary(cleanBinary, originalInput);
  console.log("analyzeBinary result:", JSON.stringify(result, null, 2));
  return result;
}
// Function to handle test data
async function handleTestData() {
  const testBinaries = ["1010101010", "11110000", "10011001"];
  for (const binary of testBinaries) {
    console.log("\nTesting binary: " + binary);
    const result = await analyzeBinary(binary, binary);
    console.log(colorizeJson(result));
    if (result.visualData && result.visualData.slidingWindowAnalysis) {
      console.log(
        JSON.stringify(result.visualData.slidingWindowAnalysis, null, 2)
      );
    }
    try {
      console.log("Model updated:", result);
    } catch (error) {
      console.error("Error updating model:", error);
    }
  }
}
// Function to handle user input
async function handleUserInput(input) {
  const binary = convertToBinary(input);
  const analysisResult = await analysisController.analyze(binary);
  analysisResult.originalInput = revertFromBinary(binary, input);
  visualizationController.visualize(analysisResult);
  promptToSave(analysisResult, input);
}
// Main function to determine the source of input
async function main() {
  const isTestMode = process.argv.includes("--test");
  if (isTestMode) {
    await handleTestData();
  } else {
    const userInput = process.argv[2];
    if (userInput) {
      await handleUserInput(userInput);
    } else {
      console.error("No binary input provided.");
    }
  }
}
// Run the main function
main();
