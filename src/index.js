const fs = require("fs");
// Controllers
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

// Function to analyze binary strings
function analyzeBinary(binary) {
  const cleanBinary = preprocessBinary(binary);
  const result = patternModel.analyzeComplete(cleanBinary);
  return result;
}

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

class Application {
  constructor() {
    this.mainController = new MainController({
      binaryModel: new BinaryModel(),
      metricsModel: new MetricsModel(),
      patternModel: new PatternModel(),
    });
    this.analysisController = new AnalysisController();
    this.visualizationController = new VisualizationController({
      metricsView: new MetricsView(),
      patternView: new PatternView(),
    });
  }

  async analyze(binary) {
    try {
      const result = await this.mainController.analyze(binary);
      console.log("\nTesting binary:", binary);
      console.log("Analyzing binary:", binary + "...");

      // Ensure visualization data is calculated
      const visualData = {
        runLengths: result.pattern_metrics.runs || [],
        patternDensity: await this.mainController.patternModel.getPatternDensity(binary) || [],
        transitions: result.pattern_metrics.alternating || 0,
        slidingWindowAnalysis: result.pattern_metrics.hierarchicalPatterns || []
      };

      const formattedOutput = {
        isInfinite: false,
        isZero: false,
        pattern_metrics: result.pattern_metrics,
        error_check: true,
        patternStats: {
          entropy: result.pattern_metrics.entropy,
          longestRun: result.pattern_metrics.longestRun,
          alternating: result.pattern_metrics.alternating,
          runs: result.pattern_metrics.runs,
          burstiness: result.pattern_metrics.burstCount,
          correlation: result.pattern_metrics.correlation,
          hierarchicalPatterns: result.pattern_metrics.hierarchicalPatterns
        },
        complexity: {
          level: result.pattern_complexity.level,
          type: result.pattern_complexity.type
        },
        visualData: visualData,
        patternSimilarity: {
          selfSimilarity: result.pattern_metrics.correlation,
          symmetry: await this.mainController.patternModel.calculateSymmetry(binary),
          periodicityScore: await this.mainController.patternModel.findPeriodicity(binary)
        },
        X_ratio: result.pattern_metrics.ones / binary.length,
        Y_ratio: 1 - Math.abs(0.5 - visualData.transitions),
        pattern_complexity: result.pattern_complexity
      };

      console.log(colorizeJson(formattedOutput));
      console.log(`Model updated: Pattern analyzed: ${result.pattern_complexity.type} with entropy ${result.pattern_metrics.entropy.toFixed(4)}\n`);
      
      return formattedOutput;
    } catch (error) {
      console.error("Analysis failed:", error);
      return { error: error.message };
    }
  }
}
// Test runner
const app = new Application();
const testBinaries = ["1010101010", "11110000", "10011001"];
async function runTests() {
  for (const binary of testBinaries) {
    console.log("\nTesting binary:", binary);
    await app.analyze(binary);
  }
}
// Run tests
runTests().catch(console.error);
module.exports = app;

// Run test cases
testBinaries.forEach(binary => {
  console.log(`\nTesting binary: ${binary}`);
  const result = analyzeBinary(binary);
  console.log(colorizeJson(result));
});
