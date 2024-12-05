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
    const metrics = this.calculateMetrics(binary);
    const patterns = this.analyzePatterns(binary);
    const runLengths = this.getRunLengths(binary);
    const density = this.getPatternDensity(binary);
    
    const data = {
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
        type: this.determineComplexity(metrics).type
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
        periodicityScore: this.findPeriodicity(binary)
      },
      X_ratio: this.calculateXRatio(binary),
      Y_ratio: this.calculateYRatio(binary)
    };

    return this.createResult('default', data);
  }

  createResult(type, data) {
    const base = {
      isInfinite: type === 'infinite',
      isZero: type === 'zero',
      pattern_metrics: data.patternStats,
      error_check: true
    };

    switch(type) {
      case 'infinite':
        return { ...base, X_ratio: 0, Y_ratio: 0 };
      case 'zero':
        return { ...base, X_ratio: Infinity, Y_ratio: Infinity };
      default:
        return {
          ...base,
          ...data,
          pattern_complexity: data.complexity
        };
    }
  }

  getRunLengths(binary) {
    return (binary.match(/([01])\1*/g) || []).map(run => run.length);
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
    [2, 3, 4].forEach(size => {
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
      correlation: this.calculateCorrelation(binary)
    };
  }

  calculateEntropy(binary) {
    const frequencies = {};
    binary.split('').forEach(bit => {
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
    if (typeof binary !== 'string') {
      binary = String(binary);
    }
    const runs = binary.match(/([01])\1*/g) || [];
    const avgRunLength = runs.reduce((sum, run) => sum + run.length, 0) / runs.length;
    const variance = runs.reduce((sum, run) => sum + Math.pow(run.length - avgRunLength, 2), 0) / runs.length;
    return variance / avgRunLength;
  }

  calculateCorrelation(binary) {
    const ones = binary.split('1').length - 1;
    const zeros = binary.length - ones;
    return Math.abs(ones - zeros) / binary.length;
  }

  calculateSymmetry(binary) {
    const mid = Math.floor(binary.length / 2);
    const first = binary.slice(0, mid);
    const second = binary.slice(-mid).split('').reverse().join('');
    let matches = 0;
    for (let i = 0; i < mid; i++) {
      if (first[i] === second[i]) matches++;
    }
    return matches / mid;
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
    const ones = binary.split('1').length - 1;
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
}

module.exports = PatternModel;
