class DataProcessor {
  constructor() {
    this.cache = new Map();
  }

  processData(inputData) {
    const cacheKey = this.generateCacheKey(inputData);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const result = {
      id: this.generateId(),
      timestamp: Date.now(),
      metrics: this.calculateMetrics(inputData),
      pattern: this.detectPattern(inputData),
    };

    this.cache.set(cacheKey, result);
    return result;
  }

  generateCacheKey(data) {
    return require("crypto")
      .createHash("md5")
      .update(JSON.stringify(data))
      .digest("hex");
  }

  generateId() {
    return require("crypto").randomBytes(16).toString("hex");
  }

  calculateMetrics(data) {
    if (!this.validateInput(data)) {
      throw new Error("Invalid input data");
    }
    return {
      entropy: this.calculateEntropy(data),
      complexity: this.calculateComplexity(data),
      burstiness: this.calculateBurstiness(data),
    };
  }

  validateInput(data) {
    return typeof data === "string" && /^[01]+$/.test(data);
  }

  calculateEntropy(binary) {
    const freq = new Map();
    for (const bit of binary) {
      freq.set(bit, (freq.get(bit) || 0) + 1);
    }
    return -Array.from(freq.values())
      .map((count) => {
        const p = count / binary.length;
        return p * Math.log2(p);
      })
      .reduce((sum, val) => sum + val, 0);
  }

  calculateComplexity(binary) {
    let transitions = 0;
    for (let i = 1; i < binary.length; i++) {
      if (binary[i] !== binary[i - 1]) transitions++;
    }
    return transitions / (binary.length - 1);
  }

  calculateBurstiness(binary) {
    const runs = binary.match(/([01])\1*/g) || [];
    return Math.sqrt(
      runs.reduce(
        (acc, run) => acc + Math.pow(run.length - runs.length / 2, 2),
        0
      ) / runs.length
    );
  }

  detectPattern(binary) {
    if (/^(10)+1?$/.test(binary))
      return { type: "alternating", confidence: 1.0 };
    if (/^(.{2,8})\1+/.test(binary))
      return { type: "periodic", confidence: 0.9 };
    if (this.calculateEntropy(binary) > 0.9)
      return { type: "random", confidence: 0.8 };
    return { type: "mixed", confidence: 0.7 };
  }
}

class ModelValidator {
  static validateModel(model) {
    return (
      this.validateStructure(model) &&
      this.validateMetrics(model) &&
      this.validatePatterns(model)
    );
  }

  static validateStructure(model) {
    const required = ["version", "lastUpdated", "analyses", "metadata"];
    return (
      model &&
      typeof model === "object" &&
      required.every((field) => field in model) &&
      Array.isArray(model.analyses)
    );
  }

  static validateMetrics(model) {
    const required = ["entropy", "complexity", "burstiness"];
    return model.analyses.every(
      (analysis) =>
        analysis.metrics &&
        required.every(
          (metric) =>
            typeof analysis.metrics[metric] === "number" &&
            !isNaN(analysis.metrics[metric])
        )
    );
  }

  static validatePatterns(model) {
    const validTypes = ["alternating", "periodic", "random", "mixed"];
    return model.analyses.every(
      (analysis) =>
        analysis.pattern &&
        validTypes.includes(analysis.pattern.type) &&
        typeof analysis.pattern.confidence === "number"
    );
  }
}

module.exports = { DataProcessor, ModelValidator };
