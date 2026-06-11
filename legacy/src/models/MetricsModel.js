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
    };
  }
  calculateEntropy(binary) {
    const freq = { 0: 0, 1: 0 };
    for (let bit of binary) {
      freq[bit]++;
    }
    return Object.values(freq).reduce((entropy, count) => {
      const p = count / binary.length;
      return entropy - (p ? p * Math.log2(p) : 0);
    }, 0);
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
}
module.exports = MetricsModel;
