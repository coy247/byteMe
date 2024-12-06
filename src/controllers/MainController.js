const EventEmitter = require("events");
class MainController extends EventEmitter {
  constructor({ binaryModel, metricsModel, patternModel, metricsView, patternView }) {
    super();
    this.binaryModel = binaryModel;
    this.metricsModel = metricsModel;
    this.patternModel = patternModel;
    this.metricsView = metricsView;
    this.patternView = patternView;
  }
  async analyze(binary) {
    try {
      // Validate binary
      if (!this.validateInput(binary)) {
        throw new Error("Invalid binary input");
      }
      // Run analysis pipeline
      const analysisResult = await this.runAnalysis(binary);
      // Emit results for visualization
      this.emit("analysisComplete", analysisResult);
      return analysisResult;
    } catch (error) {
      this.emit("analysisError", error);
      throw error;
    }
  }
  validateInput(binary) {
    if (!binary || typeof binary !== "string") return false;
    this.binaryModel.binary = binary;
    return this.binaryModel.validate();
  }
  async runAnalysis(binary) {
    const metrics = await this.metricsModel.calculateMetrics(binary);
    const patterns = await this.patternModel.analyzePatterns(binary);
    return {
      isInfinite: false,
      isZero: binary.indexOf("1") === -1,
      pattern_metrics: {
        entropy: metrics.entropy,
        longestRun: this.findLongestRun(binary),
        alternating: metrics.correlation < 0.3,
        runs: metrics.runs,
        burstCount: metrics.burstiness,
        correlation: metrics.correlation,
        hierarchicalPatterns: patterns.hierarchical,
      },
      pattern_complexity: {
        level: metrics.complexity,
        type: this.determineComplexityType(metrics),
      },
    };
  }
  findLongestRun(binary) {
    return Math.max(
      ...(binary.match(/([01])\1*/g) || []).map((run) => run.length)
    );
  }
  determineComplexityType(metrics) {
    const { correlation, entropy } = metrics;
    if (correlation > 0.8) return "repetitive";
    if (correlation < 0.2 && entropy > 0.9) return "random";
    return "alternating";
  }
}
module.exports = MainController;
