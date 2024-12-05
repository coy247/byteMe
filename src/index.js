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
        console.log("Analyzing binary:", binary.slice(0, 50) + "...");

        // Create comprehensive analysis output
        const fullAnalysis = {
            isInfinite: false,
            isZero: false,
            pattern_metrics: {
                entropy: result.pattern_metrics.entropy,
                longestRun: result.pattern_metrics.longestRun,
                alternating: result.pattern_metrics.alternating,
                runs: result.pattern_metrics.runs,
                burstCount: result.pattern_metrics.burstCount,
                correlation: result.pattern_metrics.correlation,
                hierarchicalPatterns: result.pattern_metrics.hierarchicalPatterns
            },
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
            visualData: {
                runLengths: result.pattern_metrics.runs,
                transitions: result.pattern_metrics.alternating,
                slidingWindowAnalysis: result.pattern_metrics.hierarchicalPatterns
            },
            patternSimilarity: {
                selfSimilarity: result.pattern_metrics.correlation,
                symmetry: 0.5,
                periodicityScore: {
                    score: 0,
                    period: 0
                }
            },
            X_ratio: 0,
            Y_ratio: 0,
            pattern_complexity: result.pattern_complexity
        };

        console.log(JSON.stringify(fullAnalysis, null, 2));
        console.log(
            `Model updated: Pattern analyzed: ${result.pattern_complexity.type} with entropy ${result.pattern_metrics.entropy.toFixed(4)}\n`
        );
        return fullAnalysis;
    } catch (error) {
        console.error("Analysis failed:", error);
        return { error: error.message, error_check: false };
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
