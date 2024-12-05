const fs = require("fs");
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
  patternView
});

const analysisController = new AnalysisController({
  patternModel,
  metricsModel
});

const visualizationController = new VisualizationController({
  metricsView,
  patternView
});

// Preprocess binary string
function preprocessBinary(binary) {
  return binary.replace(/[^01]/g, '');
}

// Function to colorize JSON output using ANSI escape codes
function colorizeJson(json) {
  const green = '\x1b[32m';
  const yellow = '\x1b[33m';
  const reset = '\x1b[0m';

  return JSON.stringify(json, null, 2)
    .replace(/"([^"]+)":/g, (match, p1) => `${green}"${p1}":${reset}`)
    .replace(/: (\d+(\.\d+)?)/g, (match, p1) => `: ${yellow}${p1}${reset}`);
}

// Function to analyze binary strings
function analyzeBinary(binary) {
  const cleanBinary = preprocessBinary(binary);
  return patternModel.analyzeComplete(cleanBinary);
}

// Run test cases
const testBinaries = ["1010101010", "11110000", "10011001"];
testBinaries.forEach(binary => {
  console.log(`\nTesting binary: ${binary}`);
  const result = analyzeBinary(binary);
  console.log(colorizeJson(result));
  console.log(JSON.stringify(result.visualData.slidingWindowAnalysis, null, 2));
  try {
    const summary = patternModel.createResult('normal', result);
    console.log('Model updated:', summary);
  } catch (error) {
    console.error('Error updating model:', error);
  }
});
