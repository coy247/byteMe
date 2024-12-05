class PatternModel {
  analyzePatterns(binary) {
    if (!binary || typeof binary !== "string") {
      throw new Error("Invalid binary input");
    }
    return {
      hierarchical: this.findHierarchicalPatterns(binary),
      occurrences: this.findPatternOccurrences(binary),
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
  findPatternOccurrences(binary) {
    const occurrences = {};
    const maxSize = Math.min(16, binary.length);
    for (let size = 2; size <= maxSize; size++) {
      for (let i = 0; i <= binary.length - size; i++) {
        const pattern = binary.substr(i, size);
        occurrences[pattern] = (occurrences[pattern] || 0) + 1;
      }
    }
    return occurrences;
  }
  findPeriodicity(binary) {
    let bestScore = 0;
    let bestPeriod = 1;
    const maxPeriod = Math.floor(binary.length / 2);
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
    return { score: bestScore, period: bestPeriod };
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
  comparePatterns(binary1, binary2) {
    const analysis1 = this.analyzePattern(binary1);
    const analysis2 = this.analyzePattern(binary2);
    return {
      similarityScore: this.calculateSimilarity(analysis1, analysis2),
      hierarchicalComparison: this.compareHierarchicalPatterns(
        analysis1.hierarchicalPatterns,
        analysis2.hierarchicalPatterns
      ),
      metrics: {
        entropyDiff: Math.abs(analysis1.entropy - analysis2.entropy),
        burstinessDiff: Math.abs(analysis1.burstiness - analysis2.burstiness),
        correlationDiff: Math.abs(
          analysis1.correlation - analysis2.correlation
        ),
      },
      patterns: {
        shared: this.findSharedPatterns(analysis1.patterns, analysis2.patterns),
        unique1: this.findUniquePatterns(
          analysis1.patterns,
          analysis2.patterns
        ),
        unique2: this.findUniquePatterns(
          analysis2.patterns,
          analysis1.patterns
        ),
      },
    };
  }
  calculateSimilarity(analysis1, analysis2) {
    const metrics = [
      Math.abs(analysis1.entropy - analysis2.entropy),
      Math.abs(analysis1.burstiness - analysis2.burstiness),
      Math.abs(analysis1.correlation - analysis2.correlation),
    ];
    return 1 - metrics.reduce((a, b) => a + b) / metrics.length;
  }
  compareHierarchicalPatterns(patterns1, patterns2) {
    return patterns1.map((p1, i) => ({
      size: p1.size,
      commonPatterns: this.findCommonPatterns(
        p1.patterns,
        patterns2[i].patterns
      ),
      uniquePatterns: {
        first: this.findUniquePatterns(p1.patterns, patterns2[i].patterns),
        second: this.findUniquePatterns(patterns2[i].patterns, p1.patterns),
      },
    }));
  }
  findCommonPatterns(patterns1, patterns2) {
    return Object.keys(patterns1)
      .filter((key) => patterns2[key])
      .reduce(
        (acc, key) => ({
          ...acc,
          [key]: Math.min(patterns1[key], patterns2[key]),
        }),
        {}
      );
  }
  findUniquePatterns(patterns1, patterns2) {
    return Object.keys(patterns1)
      .filter((key) => !patterns2[key])
      .reduce(
        (acc, key) => ({
          ...acc,
          [key]: patterns1[key],
        }),
        {}
      );
  }
  formatOutput(binary) {
    const patterns = this.analyzePatterns(binary);
    const metrics = this.calculateMetrics(binary);
    return {
      pattern_metrics: {
        entropy: metrics.entropy,
        longestRun: metrics.longestRun,
        alternating: metrics.alternating,
        runs: metrics.runs,
        burstCount: metrics.burstiness,
        correlation: metrics.correlation,
        hierarchicalPatterns: patterns.hierarchical,
      },
      error_check: true,
      patternStats: {
        entropy: Number(metrics.entropy.toFixed(12)),
        longestRun: metrics.longestRun,
        alternating: Number(metrics.alternating.toFixed(12)),
        runs: Number(metrics.runs.toFixed(12)),
        burstiness: Number(metrics.burstiness.toFixed(12)),
        correlation: Number(metrics.correlation.toFixed(12)),
        patternOccurrences: patterns.occurrences,
        hierarchicalPatterns: patterns.hierarchical,
      },
      complexity: this.determineComplexity(metrics),
    };
  }
  calculateMetrics(binary) {
    return {
      entropy: this.calculateEntropy(binary),
      longestRun: this.findLongestRun(binary),
      alternating: this.calculateAlternating(binary),
      runs: this.calculateRunsMetric(binary),
      burstiness: this.calculateBurstiness(binary),
      correlation: this.calculateCorrelation(binary),
    };
  }
  calculateEntropy(binary) {
    const freq = this.calculateFrequencies(binary);
    return -Object.values(freq).reduce((sum, f) => sum + f * Math.log2(f), 0);
  }
  calculateRunsMetric(binary) {
    const runs = this.findRuns(binary);
    return runs.length / binary.length;
  }
  calculateAlternating(binary) {
    let alternations = 0;
    for (let i = 1; i < binary.length; i++) {
      if (binary[i] !== binary[i - 1]) alternations++;
    }
    return alternations / (binary.length - 1);
  }
  formatAnalysisOutput(binary) {
    const analysis = this.analyzePatterns(binary);
    const metrics = {
      entropy: this.calculateEntropy(binary),
      burstiness: this.calculateBurstiness(binary),
      correlation: this.calculateCorrelation(binary),
    };
    return {
      isInfinite: false,
      isZero: false,
      pattern_metrics: {
        entropy: metrics.entropy,
        longestRun: this.findLongestRun(binary),
        alternating: this.isAlternating(binary),
        runs: this.findRuns(binary),
        burstCount: metrics.burstiness,
        correlation: metrics.correlation,
        hierarchicalPatterns: analysis.hierarchical,
      },
      error_check: true,
      patternStats: {
        entropy: metrics.entropy,
        longestRun: this.findLongestRun(binary),
        alternating: this.isAlternating(binary),
        runs: this.findRuns(binary),
        burstiness: metrics.burstiness,
        correlation: metrics.correlation,
        hierarchicalPatterns: analysis.hierarchical,
      },
      complexity: this.determineComplexity(metrics),
    };
  }
  findLongestRun(binary) {
    return Math.max(
      ...(binary.match(/([01])\1*/g) || []).map((run) => run.length)
    );
  }
  findRuns(binary) {
    return (binary.match(/([01])\1*/g) || []).map((run) => run.length);
  }
  isAlternating(binary) {
    return /^(10)+1?$|^(01)+0?$/.test(binary);
  }
  determineComplexity(metrics) {
    const level = metrics.entropy * (1 - metrics.correlation);
    let type = "random";
    if (metrics.correlation > 0.7) type = "repetitive";
    if (metrics.burstiness > 0.4) type = "alternating";
    return { level, type };
  }
  formatDetailedOutput(binary) {
    const analysis = this.analyzePatterns(binary);
    const metrics = this.calculateMetrics(binary);
    return {
      pattern_metrics: {
        // ...existing metrics...
      },
      error_check: true,
      patternStats: {
        // ...existing stats...
      },
      complexity: this.determineComplexity(metrics),
      visualData: {
        runLengths: this.findDetailedRuns(binary),
        patternDensity: this.calculatePatternDensity(binary),
        transitions: this.calculateTransitions(binary),
        slidingWindowAnalysis: analysis.hierarchical,
      },
      patternSimilarity: {
        selfSimilarity: this.calculateSelfSimilarity(binary),
        symmetry: this.calculateSymmetry(binary),
        periodicityScore: this.calculatePeriodicity(binary),
      },
      X_ratio: this.calculateXRatio(binary),
      Y_ratio: this.calculateYRatio(binary),
      pattern_complexity: this.determineComplexity(metrics),
    };
  }
  findDetailedRuns(binary) {
    return binary.match(/([01])\1*/g).map((run) => run.length);
  }
  calculatePatternDensity(binary) {
    const windowSize = 100;
    const density = [];
    for (let i = 0; i <= binary.length - windowSize; i++) {
      const window = binary.substr(i, windowSize);
      density.push(this.calculateLocalDensity(window));
    }
    return density;
  }
  calculateTransitions(binary) {
    let transitions = 0;
    for (let i = 1; i < binary.length; i++) {
      if (binary[i] !== binary[i - 1]) transitions++;
    }
    return transitions / binary.length;
  }
  analyzeComplete(binary) {
    const metrics = this.calculateMetrics(binary);
    const patterns = this.analyzePatterns(binary);
    const runLengths = this.getRunLengths(binary);
    const density = this.getPatternDensity(binary);
    
    return {
      isInfinite: false,
      isZero: false,
      pattern_metrics: {
        entropy: metrics.entropy,
        longestRun: Math.max(...runLengths),
        alternating: metrics.alternatingRate,
        runs: runLengths.length / binary.length,
        burstiness: this.calculateBurstiness(runLengths),
        correlation: this.calculateCorrelation(binary),
        patternOccurrences: this.getPatternOccurrences(binary),
        hierarchicalPatterns: patterns.hierarchical
      },
      error_check: true,
      patternStats: {
        entropy: metrics.entropy,
        longestRun: Math.max(...runLengths),
        alternating: metrics.alternatingRate,
        runs: runLengths.length / binary.length,
        burstiness: this.calculateBurstiness(runLengths),
        correlation: this.calculateCorrelation(binary),
        patternOccurrences: this.getPatternOccurrences(binary),
        hierarchicalPatterns: patterns.hierarchical
      },
      complexity: {
        level: metrics.entropy * (1 - metrics.correlation),
        type: this.determinePatternType(metrics)
      },
      visualData: {
        runLengths: runLengths,
        patternDensity: density,
        transitions: metrics.alternatingRate,
        slidingWindowAnalysis: patterns.hierarchical
      },
      patternSimilarity: {
        selfSimilarity: metrics.correlation,
        symmetry: this.calculateSymmetry(binary),
        periodicityScore: this.calculatePeriodicity(binary)
      },
      X_ratio: this.calculateXRatio(binary),
      Y_ratio: this.calculateYRatio(binary),
      pattern_complexity: {
        level: metrics.entropy * (1 - metrics.correlation),
        type: this.determinePatternType(metrics)
      }
    };
  }

  getRunLengths(binary) {
    return (binary.match(/([01])\1*/g) || []).map(run => run.length);
  }

  getPatternDensity(binary, windowSize = 100) {
    const density = [];
    for (let i = 0; i <= binary.length - windowSize; i++) {
      const window = binary.slice(i, i + windowSize);
      const patterns = this.findPatternOccurrences(window);
      density.push(Object.keys(patterns).length / windowSize);
    }
    return density;
  }

  getPatternOccurrences(binary) {
    const patterns = {};
    [2,3,4].forEach(size => {
      for (let i = 0; i <= binary.length - size; i++) {
        const pattern = binary.substr(i, size);
        patterns[pattern] = (patterns[pattern] || 0) + 1;
      }
    });
    return patterns;
  }

  calculatePatternDensity(binary, windowSize) {
    const density = [];
    for (let i = 0; i <= binary.length - windowSize; i++) {
      const window = binary.slice(i, i + windowSize);
      const patterns = this.findPatternOccurrences(window);
      density.push(Object.keys(patterns).length / windowSize);
    }
    return density;
  }
  calculateTransitionRate(binary) {
    let transitions = 0;
    for (let i = 1; i < binary.length; i++) {
      if (binary[i] !== binary[i - 1]) transitions++;
    }
    return transitions / (binary.length - 1);
  }
  calculateSelfSimilarity(binary) {
    const patterns = this.findPatternOccurrences(binary);
    const uniquePatterns = Object.keys(patterns).length;
    return 1 - uniquePatterns / binary.length;
  }
  calculateSymmetry(binary) {
    const mid = Math.floor(binary.length / 2);
    const first = binary.slice(0, mid);
    const second = binary.slice(-mid).split("").reverse().join("");
    let matches = 0;
    for (let i = 0; i < mid; i++) {
      if (first[i] === second[i]) matches++;
    }
    return matches / mid;
  }
  calculateXRatio(binary) {
    const ones = binary.split("1").length - 1;
    return ones / binary.length;
  }
  calculateYRatio(binary) {
    const transitions = this.calculateTransitionRate(binary);
    return 1 - Math.abs(0.5 - transitions);
  }
  findRunLengths(binary) {
    // Matches consecutive same bits (1+ or 0+)
    const runs = binary.match(/([01])\1*/g) || [];
    // Maps each run to its length
    return runs.map((run) => run.length);
  }
  calculatePatternDensity(binary) {
    const windowSize = 100;
    const density = [];
    for (let i = 0; i <= binary.length - windowSize; i++) {
      const window = binary.slice(i, i + windowSize);
      const uniquePatterns = new Set();
      // Look for patterns of length 2-8 in window
      for (let len = 2; len <= 8; len++) {
        for (let j = 0; j <= window.length - len; j++) {
          uniquePatterns.add(window.substr(j, len));
        }
      }
      density.push(uniquePatterns.size / windowSize);
    }
    return density;
  }
}
module.exports = PatternModel;
