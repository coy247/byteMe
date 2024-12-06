class MetricsModel {
  calculateMetrics(binary) {
    if (!binary || typeof binary !== "string") {
      throw new Error("Invalid binary input");
    }
    return {
      entropy: this.calculateEntropy(binary),
      correlation: this.calculateCorrelation(binary),
      burstiness: this.calculateBurstFrequency(binary),
      runs: this.calculateRuns(binary),
      complexity: this.calculateComplexity(binary),
      density: this.calculateDensity(binary),
      runLength: this.calculateRunLength(binary),
    };
  }
  calculateEntropy(binary) {
    const freq = {};
    for (let bit of binary) {
      freq[bit] = (freq[bit] || 0) + 1;
    }
    return Object.values(freq).reduce(
      (e, c) => e - (c / binary.length) * Math.log2(c / binary.length),
      0
    );
  }
  calculateCorrelation(binary) {
    let correlation = 0;
    for (let i = 0; i < binary.length - 1; i++) {
      correlation += binary[i] === binary[i + 1] ? 1 : 0;
    }
    return correlation / (binary.length - 1);
  }
  calculateBurstFrequency(binary) {
    const bursts = binary.match(/1+/g) || [];
    return bursts.length / binary.length;
  }
  calculateRuns(binary) {
    const runs = binary.match(/([01])\1*/g) || [];
    return runs.map((run) => run.length);
  }
  calculateComplexity(binary) {
    const uniquePatterns = new Set();
    for (let i = 0; i < binary.length - 1; i++) {
      uniquePatterns.add(binary.substr(i, 2));
    }
    return uniquePatterns.size / 4; // Normalize by max possible patterns
  }
  calculateDensity(binary) {
    return (binary.match(/1/g) || []).length / binary.length;
  }
  calculateRunLength(binary) {
    return Math.max(
      ...(binary.match(/([01])\1*/g) || []).map((run) => run.length)
    );
  }
  calculateComplexity(binary, stats) {
    return {
      level: stats.entropy * (1 + stats.longestRun / binary.length),
      type:
        stats.alternating > 0.4
          ? "alternating"
          : stats.runs > 0.3
          ? "run-based"
          : "mixed",
    };
  }
  calculateAdjustment(complexity, stats) {
    return {
      factor: complexity.level * stats.entropy,
      confidence: Math.min(1, stats.entropy / Math.log2(binary.length)),
    };
  }
}
module.exports = MetricsModel;
