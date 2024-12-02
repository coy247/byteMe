const { ModelValidator } = require("../utils/ModelValidator");

class PatternAnalyzer {
  constructor() {
    this.patterns = {
      alternating: { regex: /^(10)+1?$/, baseScore: 1.0 },
      periodic: { regex: /^(.{2,8})\1+/, baseScore: 0.9 },
      random: { entropyThreshold: 0.9, baseScore: 0.8 },
      mixed: { baseScore: 0.7 },
    };

    this.stats = {
      processedPatterns: 0,
      validPatterns: 0,
      startTime: Date.now(),
    };
  }

  analyze(binary) {
    if (!this.validateInput(binary)) {
      throw new Error("Invalid binary input");
    }

    const metrics = this.calculateMetrics(binary);
    const pattern = this.detectPattern(binary, metrics);

    this.updateStats(pattern);

    return {
      pattern,
      metrics,
      timestamp: Date.now(),
      id: this.generateId(),
    };
  }

  validateInput(binary) {
    return typeof binary === "string" && /^[01]+$/.test(binary);
  }

  detectPattern(binary, metrics) {
    for (const [type, config] of Object.entries(this.patterns)) {
      if (type === "random" && metrics.entropy > config.entropyThreshold) {
        return { type, confidence: config.baseScore };
      }
      if (config.regex && config.regex.test(binary)) {
        return { type, confidence: config.baseScore };
      }
    }
    return { type: "mixed", confidence: this.patterns.mixed.baseScore };
  }

  calculateMetrics(binary) {
    return {
      entropy: this.calculateEntropy(binary),
      complexity: this.calculateComplexity(binary),
      burstiness: this.calculateBurstiness(binary),
    };
  }

  generateId() {
    return require("crypto").randomBytes(16).toString("hex");
  }

  updateStats(pattern) {
    this.stats.processedPatterns++;
    if (pattern.confidence > 0.8) {
      this.stats.validPatterns++;
    }
  }
}

module.exports = PatternAnalyzer;
