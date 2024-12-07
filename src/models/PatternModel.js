const fs = require("fs");
const path = require("path");
const {
  validateBlockStructure,
  slidingWindowAnalysis,
  calculateSimpleChecksum,
  calculateCRC32,
  calculateEntropy,
  calculateComplexity,
  calculatePatternDensity,
  calculateTransitions,
  calculateBurstiness,
  calculateCorrelation,
  findPatternOccurrences,
  preprocessBinary,
  convertToBinary,
  revertFromBinary,
} = require("../utils/PatternUtils");
class PatternModel {
  analyzePatterns(binary) {
    if (!binary || typeof binary !== "string") {
      throw new Error("Invalid binary input");
    }
    return {
      hierarchical: this.findHierarchicalPatterns(binary),
      occurrences: this.getPatternOccurrences(binary),
    };
  }
  findHierarchicalPatterns(binary) {
    const sizes = [2, 4, 8, 16];
    return sizes.map((size) => this.analyzePatternSize(binary, size));
  }
  analyzePatternSize(binary, size) {
    const patterns = {};
    for (let i = 0; i <= binary.length - size; i++) {
      const pattern = binary.substr(i, size);
      patterns[pattern] = (patterns[pattern] || 0) + 1;
    }
    const mostCommon = Object.entries(patterns)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
    return {
      size,
      patterns,
      uniquePatterns: Object.keys(patterns).length,
      mostCommon,
    };
  }
  analyzeComplete(binary) {
    const blockValidation = validateBlockStructure(binary);
    const patterns = slidingWindowAnalysis(binary);
    const stats = {
      entropy: calculateEntropy(binary),
      longestRun: (binary.match(/([01])\1*/g) || []).reduce(
        (max, run) => Math.max(max, run.length),
        0
      ),
      alternating:
        (binary.match(/(01|10)/g) || []).length / (binary.length / 2),
      runs: (binary.match(/([01])\1+/g) || []).length / binary.length,
      burstiness: calculateBurstiness(binary),
      correlation: calculateCorrelation(binary),
      patternOccurrences: findPatternOccurrences(binary),
      hierarchicalPatterns: patterns,
    };
    const data = {
      blockValidation,
      slidingWindowAnalysis: patterns,
      patternStats: stats,
      patternSimilarity: {
        selfSimilarity: calculateCorrelation(binary),
        symmetry: this.calculateSymmetry(binary),
        periodicityScore: this.findPeriodicity(binary),
      },
      X_ratio: this.calculateXRatio(binary),
      Y_ratio: this.calculateYRatio(binary),
    };
    console.log(
      "PatternModel analyzeComplete result:",
      JSON.stringify(data, null, 2)
    );
    this.savePatternsToFile(patterns); // Save patterns to file
    return this.createResult("normal", data);
  }
  createResult(type, data) {
    const base = {
      isInfinite: type === "infinite",
      isZero: type === "zero",
      pattern_metrics: data.patternStats,
      error_check: true,
    };
    switch (type) {
      case "infinite":
        return { ...base, X_ratio: 0, Y_ratio: 0 };
      case "zero":
        return { ...base, X_ratio: Infinity, Y_ratio: Infinity };
      default:
        return {
          ...base,
          ...data,
          pattern_complexity: data.complexity,
        };
    }
  }
  savePatternsToFile(patterns) {
    const outputDir = path.join(__dirname, "../models/patterns");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const filepath = path.join(outputDir, "model.json");
    fs.writeFileSync(filepath, JSON.stringify(patterns, null, 2));
    console.log("Model written to file: " + filepath);
  }
  getRunLengths(binary) {
    return (binary.match(/([01])\1*/g) || []).map((run) => run.length);
  }
  getPatternDensity(binary, windowSize = 100) {
    const density = [];
    for (let i = 0; i <= binary.length - windowSize; i++) {
      const window = binary.slice(i, i + windowSize);
      const uniquePatterns = new Set();
      for (let len = 2; len <= 8; len++) {
        for (let j = 0; j <= window.length - len; j++) {
          uniquePatterns.add(window.substr(j, len));
        }
      }
      density.push(uniquePatterns.size / windowSize);
    }
    return density;
  }
  getPatternOccurrences(binary) {
    const patterns = {};
    [2, 3, 4].forEach((size) => {
      for (let i = 0; i <= binary.length - size; i++) {
        const pattern = binary.substr(i, size);
        patterns[pattern] = (patterns[pattern] || 0) + 1;
      }
    });
    return patterns;
  }
  calculateMetrics(binary) {
    return {
      entropy: this.calculateEntropy(binary),
      longestRun: this.findLongestRun(binary),
      alternatingRate: this.isAlternating(binary),
      burstiness: this.calculateBurstiness(binary),
      correlation: this.calculateCorrelation(binary),
    };
  }
  calculateEntropy(binary) {
    const frequencies = {};
    binary.split("").forEach((bit) => {
      frequencies[bit] = (frequencies[bit] || 0) + 1;
    });
    return Object.values(frequencies).reduce((entropy, count) => {
      const probability = count / binary.length;
      return entropy - probability * Math.log2(probability);
    }, 0);
  }
  findLongestRun(binary) {
    return Math.max(
      ...(binary.match(/([01])\1*/g) || []).map((run) => run.length)
    );
  }
  isAlternating(binary) {
    return /^(10)+1?$|^(01)+0?$/.test(binary);
  }
  calculateBurstiness(binary) {
    const runs = binary.match(/([01])\1*/g) || [];
    return Math.std(runs.map((r) => r.length)) || 0;
  }
  calculateCorrelation(binary) {
    const arr = binary.split("").map(Number);
    return (
      arr.slice(1).reduce((acc, val, i) => acc + val * arr[i], 0) /
      (binary.length - 1)
    );
  }
  calculateSymmetry(binary) {
    const mid = Math.floor(binary.length / 2);
    const firstHalf = binary.slice(0, mid);
    const secondHalf = binary.slice(-mid).split("").reverse().join("");
    return (
      firstHalf
        .split("")
        .reduce((acc, char, i) => acc + (char === secondHalf[i] ? 1 : 0), 0) / mid
    );
  }
  findPeriodicity(binary) {
    const period = Math.floor(binary.length / 2);
    let score = 0;
    for (let i = 0; i < period; i++) {
      if (binary[i] === binary[i + period]) score++;
    }
    return { score: score / period, period };
  }
  calculateXRatio(binary) {
    const ones = binary.split("1").length - 1;
    return ones / binary.length;
  }
  calculateYRatio(binary) {
    const transitions = this.calculateTransitions(binary);
    return 1 - Math.abs(0.5 - transitions);
  }
  calculateTransitions(binary) {
    let transitions = 0;
    for (let i = 1; i < binary.length; i++) {
      if (binary[i] !== binary[i - 1]) transitions++;
    }
    return transitions / binary.length;
  }
  determineComplexity(metrics) {
    const level = metrics.entropy * (1 - metrics.correlation);
    let type = "random";
    if (metrics.correlation > 0.7) type = "repetitive";
    if (metrics.burstiness > 0.4) type = "alternating";
    return { level, type };
  }
  findPatterns(binary, minLength = 2, maxLength = 8) {
    const patterns = {};
    for (let len = minLength; len <= maxLength; len++) {
      for (let i = 0; i <= binary.length - len; i++) {
        const pattern = binary.substr(i, len);
        patterns[pattern] = (patterns[pattern] || 0) + 1;
      }
    }
    return patterns;
  }
  findRepeating(binary) {
    return binary.match(/([01]+)\1+/g) || [];
  }
  findAlternating(binary) {
    return binary.match(/(01)+|(10)+/g) || [];
  }
  analyzeSlidingWindow(binary, windowSizes) {
    return windowSizes.map((size) => {
      const patterns = {};
      for (let i = 0; i <= binary.length - size; i++) {
        const pattern = binary.substr(i, size);
        patterns[pattern] = (patterns[pattern] || 0) + 1;
      }
      return {
        size,
        patterns,
        uniquePatterns: Object.keys(patterns).length,
        mostCommon: Object.entries(patterns)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3),
      };
    });
  }
  analyzeSimilarity(binary) {
    return {
      selfSimilarity: this.calculateCorrelation(binary),
      symmetry: this.calculateSymmetry(binary),
      periodicityScore: this.detectPeriodicity(binary),
    };
  }
  calculateStats(binary) {
    return {
      entropy: this.calculateEntropy(binary),
      longestRun: (binary.match(/([01])\1*/g) || []).reduce(
        (max, run) => Math.max(max, run.length),
        0
      ),
      alternating: (binary.match(/(01|10)/g) || []).length / (binary.length / 2),
      runs: (binary.match(/([01])\1+/g) || []).length / binary.length,
      burstiness: this.calculateBurstiness(binary),
      correlation: this.calculateCorrelation(binary),
      patternOccurrences: this.findPatternOccurrences(binary),
      hierarchicalPatterns: this.analyzeSlidingWindow(binary, [2, 3, 4]),
    };
  }
  preprocessBinary(binary) {
    return binary.replace(/[^01]/g, "");
  }
  convertToBinary(input) {
    if (/^[01]+$/.test(input)) {
      return input;
    }
    return input
      .split("")
      .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
      .join("");
  }
  revertFromBinary(binary, originalInput) {
    if (/^[01]+$/.test(originalInput)) {
      return binary;
    }
    return binary
      .match(/.{1,8}/g)
      .map((byte) => String.fromCharCode(parseInt(byte, 2)))
      .join("");
  }
  detectPeriodicity(binary) {
    const maxPeriod = Math.floor(binary.length / 2);
    let bestScore = 0;
    let bestPeriod = 0;
    for (let period = 1; period <= maxPeriod; period++) {
      let matches = 0;
      for (let i = 0; i < binary.length - period; i++) {
        if (binary[i] === binary[i + period]) matches++;
      }
      const score = matches / (binary.length - period);
      if (score > bestScore) {
        bestScore = score;
        bestPeriod = period;
      }
    }
    return {
      score: bestScore,
      period: bestPeriod,
    };
  }
  calculatePatternDensity(binary) {
    const windowSize = Math.min(100, binary.length);
    const density = [];
    for (let i = 0; i <= binary.length - windowSize; i += windowSize) {
      const window = binary.substr(i, windowSize);
      const matches = window.match(/1/g);
      density.push((matches ? matches.length : 0) / windowSize);
    }
    return density;
  }
  calculateTransitions(binary) {
    return (binary.match(/(01|10)/g) || []).length / binary.length;
  }
  calculateEntropy(str) {
    const freq = [...str].reduce(
      (f, c) => ({ ...f, [c]: (f[c] || 0) + 1 }),
      {}
    );
    return Object.values(freq).reduce(
      (e, c) => e - (c / str.length) * Math.log2(c / str.length),
      0
    );
  }
  calculateComplexity(str, stats) {
    return {
      level: stats.entropy * (1 + stats.longestRun / str.length),
      type:
        stats.alternating > 0.4
          ? "alternating"
          : stats.runs > 0.3
          ? "run-based"
          : "mixed",
    };
  }
  calculateAdjustment(complexity, stats) {
    return 1 + complexity.level * 0.1 * (stats.entropy > 0.9 ? 1.2 : 1);
  }
}
module.exports = PatternModel;
