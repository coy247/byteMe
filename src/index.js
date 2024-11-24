function extractNumber(str, radix) {
  if (typeof str === "string") {
    return parseInt(str, radix);
  } else {
    return NaN;
  }
}

function extractFloat(str) {
  try {
    return parseFloat(str);
  } catch (error) {
    return NaN;
  }
}

const fs = require("fs");

// Function to analyze binary strings
function analyzeBinary(binary) {
  // Advanced pattern detection using sliding window analysis
  const windowSizes = [2, 4, 8, 16];
  const patternAnalysis = windowSizes.map((size) => {
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

  // Enhanced pattern metrics with visualization data
  const stats = {
    entropy: calculateEntropy(binary),
    longestRun:
      binary
        .match(/([01])\1*/g)
        ?.reduce((max, run) => Math.max(max, run.length), 0) || 0,
    alternating: (binary.match(/(01|10)/g)?.length || 0) / (binary.length / 2),
    runs: (binary.match(/([01])\1+/g)?.length || 0) / binary.length,
    burstiness: calculateBurstiness(binary),
    correlation: calculateCorrelation(binary),
    patternOccurrences: findPatternOccurrences(binary),
    hierarchicalPatterns: patternAnalysis,
  };

  // Data preprocessing and optimization
  const cleanBinary = preprocessBinary(binary);
  const complexity = calculateComplexity(cleanBinary, stats);
  const adjustment = calculateAdjustment(complexity, stats);

  // Enhanced visualization data with multi-dimensional analysis
  const visualData = {
    runLengths: binary.match(/([01])\1*/g)?.map((run) => run.length) || [],
    patternDensity: calculatePatternDensity(binary),
    transitions: calculateTransitions(binary),
    slidingWindowAnalysis: windowSizes.map((size) => ({
      windowSize: size,
      density: Array.from(
        { length: Math.floor(binary.length / size) },
        (_, i) => binary.substr(i * size, size).split("1").length - 1 / size
      ),
    })),
  };

  // Pattern similarity analysis
  const patternSimilarity = {
    selfSimilarity: calculateCorrelation(binary),
    symmetry: calculateSymmetry(binary),
    periodicityScore: detectPeriodicity(binary),
  };

  if (cleanBinary.match(/^1+$/))
    return createResult("infinite", {
      patternStats: stats,
      visualData,
      patternSimilarity,
    });
  if (cleanBinary.match(/^0+$/))
    return createResult("zero", {
      patternStats: stats,
      visualData,
      patternSimilarity,
    });

  return createResult("normal", {
    patternStats: stats,
    complexity,
    visualData,
    patternSimilarity,
    X_ratio:
      ((cleanBinary.match(/1/g)?.length || 0) / cleanBinary.length) *
      adjustment,
    Y_ratio:
      ((cleanBinary.match(/0/g)?.length || 0) / cleanBinary.length) *
      adjustment,
  });
}

// New helper functions for enhanced analysis
function calculateSymmetry(binary) {
  const mid = Math.floor(binary.length / 2);
  const firstHalf = binary.slice(0, mid);
  const secondHalf = binary.slice(-mid).split("").reverse().join("");
  return (
    firstHalf
      .split("")
      .reduce((acc, char, i) => acc + (char === secondHalf[i] ? 1 : 0), 0) / mid
  );
}

function detectPeriodicity(binary) {
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

  return { score: bestScore, period: bestPeriod };
}

// New helper functions
function calculateBurstiness(binary) {
  const runs = binary.match(/([01])\1*/g) || [];
  return Math.std(runs.map((r) => r.length)) || 0;
}

function calculateCorrelation(binary) {
  const arr = binary.split("").map(Number);
  return (
    arr.slice(1).reduce((acc, val, i) => acc + val * arr[i], 0) /
    (binary.length - 1)
  );
}

function findPatternOccurrences(binary) {
  const patterns = {};
  for (let len = 2; len <= 4; len++) {
    for (let i = 0; i <= binary.length - len; i++) {
      const pattern = binary.substr(i, len);
      patterns[pattern] = (patterns[pattern] || 0) + 1;
    }
  }
  return patterns;
}

function preprocessBinary(binary) {
  // Remove any noise or invalid characters
  return binary.replace(/[^01]/g, "");
}

function calculatePatternDensity(binary) {
  const windowSize = Math.min(100, binary.length);
  const density = [];
  for (let i = 0; i <= binary.length - windowSize; i += windowSize) {
    const window = binary.substr(i, windowSize);
    density.push((window.match(/1/g)?.length || 0) / windowSize);
  }
  return density;
}

function calculateTransitions(binary) {
  return (binary.match(/(01|10)/g)?.length || 0) / binary.length;
}

// Add Math.std if not exists
Math.std = function (arr) {
  const mean = arr.reduce((a, b) => a + b) / arr.length;
  return Math.sqrt(
    arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length
  );
};

// Run test cases
[
  // Ultra-complex quantum-inspired pattern with multiple transcendental functions
  Array(16384)
    .fill(0)
    .map((_, i) => {
      const quantum =
        Math.sin(i * Math.PI * Math.E) *
          Math.cos(i * Math.sqrt(7)) *
          Math.tan(i / Math.LOG2E) *
          Math.sinh(i / 1000) *
          Math.pow(Math.abs(Math.cos(i * Math.sqrt(11))), 3) *
          Math.tanh(i * Math.SQRT1_2) +
        Math.cosh(i / 500);
      return quantum * Math.log(i + 1) + Math.sin((i * Math.PI) / 180) > 0
        ? "1"
        : "0";
    })
    .join("") +
    "10".repeat(512) +
    "01".repeat(256) +
    "1",

  // Hyper-dimensional fractal-chaos pattern with golden ratio interactions
  Array(12288)
    .fill(0)
    .map((_, i) => {
      const phi = (1 + Math.sqrt(5)) / 2;
      const chaos =
        Math.sin(i * phi) *
        Math.cos(i * Math.sqrt(13)) *
        Math.tan(i / 7) *
        Math.sinh(i / 273) *
        Math.pow(Math.abs(Math.sin(i * Math.sqrt(17))), 2) *
        Math.log10(i + phi) *
        Math.exp(-i / 2048);
      return (chaos + Math.cos((i * Math.PI) / 90)) % 1 > 0.4 ? "1" : "0";
    })
    .join("") + "110",
].forEach((binary) => {
  console.log(`\nTesting binary: ${binary.substring(0, 50)}...`);
  console.log(analyzeBinary(binary));
});

// Helper functions for enhanced analysis
function calculateEntropy(str) {
  const freq = {};
  str.split("").forEach((char) => (freq[char] = (freq[char] || 0) + 1));
  return Object.values(freq).reduce((entropy, count) => {
    const p = count / str.length;
    return entropy - p * Math.log2(p);
  }, 0);
}

function calculateComplexity(str, stats) {
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

function calculateAdjustment(complexity, stats) {
  return 1 + complexity.level * 0.1 * (stats.entropy > 0.9 ? 1.2 : 1);
}

function createResult(type, data) {
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

// Test cases
const testCases = [
  // Hyper-dimensional quantum chaos with nested non-linear dynamics
  Array(8192)
    .fill(0)
    .map((_, i) => {
      const quantum =
        Math.sin(i * Math.PI * Math.sqrt(13)) *
        Math.cos(i * Math.E * Math.sqrt(17)) *
        Math.tan(i * Math.SQRT2 * Math.log10(i + 1)) *
        Math.sinh(i / 273) *
        Math.cosh(i / 377) *
        Math.pow(Math.abs(Math.atan(i * Math.sqrt(19))), 3) *
        Math.sin(Math.sqrt(i)) *
        Math.cos(Math.cbrt(i)) *
        Math.tan(Math.log(i + 1)) *
        Math.exp(-i / 10000);
      return quantum * Math.log2(i + 2) * Math.tanh(i / 1000) + 0.5 > 0.5
        ? "1"
        : "0";
    })
    .join("") + "10110".repeat(100),

  // Multi-dimensional fractal-chaos with advanced harmonic interactions
  Array(16384)
    .fill(0)
    .map((_, i) => {
      const phi = (1 + Math.sqrt(5)) / 2;
      const chaos =
        Math.sin(i * phi * Math.sqrt(23)) *
        Math.cos(i * Math.sqrt(29) * Math.E) *
        Math.tan(i / (7 * phi)) *
        Math.sinh(i / (273 * Math.SQRT2)) *
        Math.pow(Math.abs(Math.sin(i * Math.sqrt(31))), 4) *
        Math.log10(i + phi) *
        Math.exp(-i / 4096) *
        Math.tanh(Math.sqrt(i)) *
        Math.atan2(i, phi) *
        Math.pow(Math.sin(i / 1000), 2);
      return (chaos + 1.5) % 2 > 0.8 ? "1" : "0";
    })
    .join("") + "01101".repeat(100),

  // Quantum-prime pattern with advanced transcendental modulation
  Array(12288)
    .fill(0)
    .map((_, i) => {
      const fibMod = fibonacci(i % 150) % 23;
      const primeInfluence = isPrime(i * fibMod + 5)
        ? Math.sin(i * Math.sqrt(37))
        : Math.cos(i * Math.sqrt(41));
      const quantum =
        Math.sinh(i / 500) *
        Math.cosh(i / 700) *
        Math.tanh(i / 900) *
        Math.atan(i * Math.sqrt(37)) *
        Math.pow(Math.abs(Math.sin(i * Math.sqrt(41))), 2) *
        Math.log1p(Math.abs(Math.tan(i / 1000))) *
        Math.exp(-Math.abs(Math.sin(i / 500)));
      return (quantum * primeInfluence * fibMod + 2) % 3 > 1.2 ? "1" : "0";
    })
    .join("") + "11010".repeat(100),

  // Complex modular cascade with non-linear feedback
  Array(10240)
    .fill(0)
    .map((_, i) => {
      const modular = (i * 15731 + 789221) % 2311;
      const cascade =
        Math.sin(i * Math.PI * Math.sqrt(43)) *
        Math.cos(i * Math.E * Math.sqrt(47)) *
        Math.tan(i / (11 * Math.SQRT2)) *
        Math.pow(Math.abs(Math.sinh(i / 800)), 3) *
        Math.log2(i + 3) *
        Math.exp(-i / 8192) *
        Math.asinh(Math.cos(i / 300)) *
        Math.tanh(Math.sin(i / 700));
      return (modular * cascade + 3) % 4 > 1.8 ? "1" : "0";
    })
    .join("") + "10101".repeat(100),
];

// Helper functions
function fibonacci(n) {
  let a = 1,
    b = 0,
    temp;
  while (n >= 0) {
    temp = a;
    a = a + b;
    b = temp;
    n--;
  }
  return b;
}

function isPrime(num) {
  for (let i = 2; i <= Math.sqrt(num); i++) if (num % i === 0) return false;
  return num > 1;
}

testCases.forEach((binary) => {
  console.log(`\nTesting binary: ${binary}`);
  const result = analyzeBinary(binary);
  console.log(JSON.stringify(result, null, 2));
  try {
    const summary = updateModelData(binary, result);
    console.log("Model updated:", summary);
  } catch (error) {
    console.error("Error updating model:", error);
  }
});

// Function to manage model output and storage
function updateModelData(binary, analysisResult) {
  const baseModelPath = "./models";
  const normalizedPath = "patterns"; // Standard folder name
  const modelPath = `${baseModelPath}/${normalizedPath}`;

  const modelData = {
    id: generateUniqueId(binary, analysisResult),
    timestamp: Date.now(),
    pattern_type: analysisResult.pattern_complexity?.type || "unknown",
    metrics: {
      entropy: analysisResult.pattern_metrics.entropy,
      complexity: analysisResult.pattern_complexity?.level || 0,
      burstiness: analysisResult.pattern_metrics.burstiness,
    },
    summary: `Pattern analyzed: ${
      analysisResult.pattern_complexity?.type
    } with entropy ${analysisResult.pattern_metrics.entropy.toFixed(4)}`,
  };

  // Clean up duplicate folders
  cleanupModelFolders(baseModelPath, normalizedPath);

  // Ensure model directory exists
  if (!fs.existsSync(modelPath)) {
    fs.mkdirSync(modelPath, { recursive: true });
  }

  // Update model file
  const modelFile = `${modelPath}/model.json`;
  let existingData = [];

  try {
    existingData = JSON.parse(fs.readFileSync(modelFile, "utf8"));
    // Remove duplicates based on id
    existingData = existingData.filter((item) => item.id !== modelData.id);
  } catch (e) {
    /* Handle first run */
  }

  existingData.push(modelData);

  // Keep only latest 1000 entries and sort by timestamp
  existingData = existingData
    .slice(-1000)
    .sort((a, b) => b.timestamp - a.timestamp);

  fs.writeFileSync(modelFile, JSON.stringify(existingData, null, 2));
  return modelData.summary;
}

function generateUniqueId(binary, result) {
  return require("crypto")
    .createHash("md5")
    .update(
      `${result.pattern_metrics.entropy}-${
        result.pattern_complexity?.type
      }-${binary.slice(0, 100)}`
    )
    .digest("hex");
}

function cleanupModelFolders(basePath, normalizedName) {
  if (!fs.existsSync(basePath)) return;

  const items = fs.readdirSync(basePath);
  items.forEach((item) => {
    const fullPath = `${basePath}/${item}`;
    if (
      fs.statSync(fullPath).isDirectory() &&
      item.toLowerCase().includes("pattern") &&
      item !== normalizedName
    ) {
      // Move contents to normalized folder if exists
      if (fs.existsSync(`${fullPath}/model.json`)) {
        const normalizedFolder = `${basePath}/${normalizedName}`;
        if (!fs.existsSync(normalizedFolder)) {
          fs.mkdirSync(normalizedFolder, { recursive: true });
        }
        fs.renameSync(
          `${fullPath}/model.json`,
          `${normalizedFolder}/model.json.tmp`
        );
        mergeJsonFiles(
          `${normalizedFolder}/model.json`,
          `${normalizedFolder}/model.json.tmp`
        );
        fs.unlinkSync(`${normalizedFolder}/model.json.tmp`);
      }
      fs.rmSync(fullPath, { recursive: true, force: true });
    }
  });
}

function mergeJsonFiles(target, source) {
  let targetData = [];
  let sourceData = [];

  try {
    if (fs.existsSync(target))
      targetData = JSON.parse(fs.readFileSync(target, "utf8"));
    if (fs.existsSync(source))
      sourceData = JSON.parse(fs.readFileSync(source, "utf8"));

    // Combine and remove duplicates
    const combined = [...targetData, ...sourceData]
      .filter(
        (item, index, self) => index === self.findIndex((t) => t.id === item.id)
      )
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 1000);

    fs.writeFileSync(target, JSON.stringify(combined, null, 2));
  } catch (e) {
    console.error("Error merging files:", e);
  }
}

// Additional test case - ZigZag pattern with advanced transcendental functions
const zigzagPattern = Array(14336)
  .fill(0)
  .map((_, i) => {
    const phi = (1 + Math.sqrt(5)) / 2;
    const zigzag =
      Math.sin(i * phi * Math.sqrt(53)) *
      Math.cos(i * Math.E * Math.sqrt(59)) *
      Math.tan(i / (13 * Math.SQRT2)) *
      Math.sinh(i / (377 * phi)) *
      Math.pow(Math.abs(Math.sin(i * Math.sqrt(61))), 3) *
      Math.log2(i + phi) *
      Math.exp(-i / 6144) *
      Math.atan(Math.sqrt(i)) *
      Math.tanh(Math.cbrt(i)) *
      Math.pow(Math.cos(i / 800), 2);
    return (zigzag + Math.sin(i / 100)) % 2 > 0.7 ? "1" : "0";
  })
  .join("") + "11100".repeat(100);

console.log(`\nTesting ZigZag pattern: ${zigzagPattern.substring(0, 50)}...`);
console.log(analyzeBinary(zigzagPattern));

// Fibonacci-modulated quantum pattern
const fibonacciQuantum = Array(10240)
  .fill(0)
  .map((_, i) => {
    const fib = fibonacci(i % 100);
    const quantum = 
      Math.sin(i * fib * Math.sqrt(67)) * 
      Math.cos(i * Math.E * Math.sqrt(71)) * 
      Math.tan(i / (17 * Math.SQRT2)) * 
      Math.sinh(i / (433 * (1 + Math.sqrt(5)) / 2)) * 
      Math.pow(Math.abs(Math.sin(i * Math.sqrt(73))), 4) * 
      Math.log2(i + Math.E) * 
      Math.exp(-i / 5120) * 
      Math.asinh(Math.cos(i / 400)) * 
      Math.cosh(Math.sin(i / 900));
    return (quantum * fib + 4) % 5 > 2.2 ? "1" : "0";
  })
  .join("") + "11010".repeat(100);

console.log(`\nTesting Fibonacci-Quantum pattern: ${fibonacciQuantum.substring(0, 50)}...`);
console.log(analyzeBinary(fibonacciQuantum));

// Prime-modulated neural pattern
const primeNeuralPattern = Array(12288)
  .fill(0)
  .map((_, i) => {
    const primeWeight = isPrime(i) ? Math.sin(i * Math.sqrt(79)) : Math.cos(i * Math.sqrt(83));
    const neural = 
      Math.sin(i * Math.PI * Math.sqrt(89)) * 
      Math.cos(i * Math.E * Math.sqrt(97)) * 
      Math.tan(i / (19 * Math.SQRT2)) * 
      Math.sinh(i / (577 * Math.E)) * 
      Math.pow(Math.abs(Math.sin(i * Math.sqrt(101))), 5) * 
      Math.log2(i + Math.PI) * 
      Math.exp(-i / 7168) * 
      Math.acosh(Math.abs(Math.sin(i / 500))) * 
      Math.tanh(Math.cos(i / 1100));
    return (neural * primeWeight + 5) % 6 > 2.5 ? "1" : "0";
  })
  .join("") + "10011".repeat(100);

console.log(`\nTesting Prime-Neural pattern: ${primeNeuralPattern.substring(0, 50)}...`);
console.log(analyzeBinary(primeNeuralPattern));

// Hypergeometric pattern with modular arithmetic
const hyperPattern = Array(11264)
  .fill(0)
  .map((_, i) => {
    const modular = (i * 19937 + 104729) % 3571;
    const hyper = 
      Math.sin(i * Math.PI * Math.sqrt(103)) * 
      Math.cos(i * Math.E * Math.sqrt(107)) * 
      Math.tan(i / (23 * Math.SQRT2)) * 
      Math.sinh(i / (613 * Math.PI)) * 
      Math.pow(Math.abs(Math.sin(i * Math.sqrt(109))), 6) * 
      Math.log2(i + Math.LN2) * 
      Math.exp(-i / 6656) * 
      Math.atanh(Math.min(0.99, Math.abs(Math.sin(i / 600)))) * 
      Math.cosh(Math.cos(i / 1300));
    return (modular * hyper + 6) % 7 > 3.1 ? "1" : "0";
  })
  .join("") + "11001".repeat(100);

console.log(`\nTesting Hypergeometric pattern: ${hyperPattern.substring(0, 50)}...`);
console.log(analyzeBinary(hyperPattern));

// Add detailed console logging for slidingWindowAnalysis
console.log('\nSliding Window Analysis Details:');
testCases.forEach((binary) => {
  const result = analyzeBinary(binary);
  console.log('\nWindow Analysis Summary:');
  result.visualData.slidingWindowAnalysis.forEach(window => {
    console.log(`Window size ${window.windowSize}:`);
    // Only show first 5 density values
    console.log('Sample density values:', window.density.slice(0, 5));
  });
});
// Streamlined output formatting
function formatAnalysisResult(binary, result) {
  const summary = {
    patternType: result.pattern_complexity?.type || 'unknown',
    entropy: result.pattern_metrics.entropy.toFixed(4),
    complexity: result.pattern_complexity?.level.toFixed(4) || 0,
    mainMetrics: {
      X_ratio: result.X_ratio?.toFixed(4),
      Y_ratio: result.Y_ratio?.toFixed(4)
    }
  };

  console.log(`\nAnalysis of pattern (first 50 chars: ${binary.substring(0, 50)}...)`);
  console.log(JSON.stringify(summary, null, 2));
}

// Replace verbose console.log statements with streamlined output
testCases.forEach(binary => {
  formatAnalysisResult(binary, analyzeBinary(binary));
});

// Update final test cases to use new format
[zigzagPattern, fibonacciQuantum, primeNeuralPattern, hyperPattern].forEach(pattern => {
  formatAnalysisResult(pattern, analyzeBinary(pattern));
});
// Enhanced formatting function for more user-friendly output
function formatAnalysisResult(binary, result) {
  const stars = "★".repeat(Math.min(5, Math.ceil(result.pattern_metrics.entropy * 5)));
  const complexity = Math.ceil(result.pattern_complexity?.level * 100) || 0;

  console.log("\n" + "═".repeat(60));
  console.log(`Pattern Analysis Summary`);
  console.log("═".repeat(60));
  console.log(`Sample: ${binary.substring(0, 30)}... (${binary.length} bits)`);
  console.log(`Type: ${result.pattern_complexity?.type || 'unknown'}`);
  console.log(`Complexity: ${stars} (${complexity}%)`);
  console.log(`Entropy: ${result.pattern_metrics.entropy.toFixed(2)}`);
  console.log(`Balance: ${(result.X_ratio * 100).toFixed(1)}% ones, ${(result.Y_ratio * 100).toFixed(1)}% zeros`);
  console.log("═".repeat(60) + "\n");
}

// Update test case execution to use new format
[...testCases, zigzagPattern, fibonacciQuantum, primeNeuralPattern, hyperPattern]
  .forEach(pattern => formatAnalysisResult(pattern, analyzeBinary(pattern)));

  // Prediction function based on pattern analysis
  function predictNextBits(binary, length = 8) {
    const result = analyzeBinary(binary);
    const lastBits = binary.slice(-32);

    // Initialize prediction array
    let prediction = [];

    // Use pattern complexity to determine prediction strategy
    if (result.pattern_complexity?.type === "alternating") {
      // For alternating patterns, continue the alternation
      const lastBit = lastBits.slice(-1);
      for (let i = 0; i < length; i++) {
        prediction.push(lastBit === "0" ? "1" : "0");
      }
    } else if (result.pattern_complexity?.type === "run-based") {
      // For run-based patterns, analyze run length and continue
      const currentRun = lastBits.match(/([01])\1*$/)[0];
      const runLength = currentRun.length;
      const runChar = currentRun[0];
      
      // Predict based on average run length
      if (runLength >= result.pattern_metrics.longestRun / 2) {
        prediction = Array(length).fill(runChar === "0" ? "1" : "0");
      } else {
        prediction = Array(length).fill(runChar);
      }
    } else {
      // For mixed patterns, use sliding window matching
      const window = lastBits.slice(-8);
      const matches = [];
      
      // Find similar patterns in history
      for (let i = 0; i < binary.length - 8; i++) {
        if (binary.substr(i, 8) === window) {
          matches.push(binary.substr(i + 8, length));
        }
      }
      
      // Use most common following pattern or fallback to probability
      if (matches.length > 0) {
        const mostCommon = matches.reduce((a, b) => 
          matches.filter(v => v === a).length >= matches.filter(v => v === b).length ? a : b
        );
        prediction = mostCommon.split("");
      } else {
        // Fallback to probability-based prediction
        const onesProbability = result.X_ratio || 0.5;
        for (let i = 0; i < length; i++) {
          prediction.push(Math.random() < onesProbability ? "1" : "0");
        }
      }
    }
    
    return prediction.join("");
  }

  // Example usage of prediction
  testCases.forEach(binary => {
    console.log("\nPattern Analysis and Prediction");
    formatAnalysisResult(binary, analyzeBinary(binary));
    const predicted = predictNextBits(binary);
    console.log(`Next 8 bits prediction: ${predicted}`);
  });

  // Unified pattern prediction algorithm
  function analyzeAndPredictPattern(binary) {
    const result = analyzeBinary(binary);
    const patterns = {
      sequences: {},
      frequency: {},
      transitions: new Map()
    };

    // Analyze sequences of different lengths (2-8 bits)
    for (let len = 2; len <= 8; len++) {
      for (let i = 0; i < binary.length - len; i++) {
        const seq = binary.substr(i, len);
        const next = binary[i + len];
        
        if (!patterns.sequences[seq]) {
          patterns.sequences[seq] = { count: 0, nextBits: { '0': 0, '1': 0 } };
        }
        
        patterns.sequences[seq].count++;
        if (next) patterns.sequences[seq].nextBits[next]++;
      }
    }

    // Calculate transition probabilities
    for (const [seq, data] of Object.entries(patterns.sequences)) {
      const total = data.nextBits['0'] + data.nextBits['1'];
      if (total > 0) {
        patterns.transitions.set(seq, {
          to0: data.nextBits['0'] / total,
          to1: data.nextBits['1'] / total
        });
      }
    }

    // Find dominant patterns
    const dominantPatterns = Object.entries(patterns.sequences)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([pattern, data]) => ({
        pattern,
        frequency: data.count,
        prediction: data.nextBits['1'] > data.nextBits['0'] ? '1' : '0'
      }));

    return {
      type: result.pattern_complexity?.type,
      entropy: result.pattern_metrics.entropy,
      dominantPatterns,
      predictNextBit: () => {
        const lastBits = binary.slice(-8);
        for (const {pattern, prediction} of dominantPatterns) {
          if (lastBits.endsWith(pattern)) {
            return prediction;
          }
        }
        return Math.random() > 0.5 ? '1' : '0';
      }
    };
  }

  // Test the unified algorithm
  const patterns = testCases.map(binary => {
    const analysis = analyzeAndPredictPattern(binary);
    console.log('\nPattern Analysis Results:');
    console.log(`Type: ${analysis.type}`);
    console.log(`Entropy: ${analysis.entropy.toFixed(4)}`);
    console.log('Dominant Patterns:', analysis.dominantPatterns);
    console.log(`Next bit prediction: ${analysis.predictNextBit()}`);
    return analysis;
  });