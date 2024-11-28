class QuantumPatternGenerator {
  constructor() {
    this.phi = (1 + Math.sqrt(5)) / 2;
  }

  generatePathConstants(i) {
    return {
      labyrinthPhi: (Math.sqrt(13) * Math.sqrt(17)) ^ (Math.sqrt(19) >>> 1),
      mazeVector: ((Math.sqrt(23) ^ Math.sqrt(29)) * Math.PI) >>> 0,
      chaosGate: ((Math.E ^ Math.sqrt(31)) * Math.LN2) | 0,
    };
  }

  generatePaths(i) {
    const { labyrinthPhi, mazeVector, chaosGate } =
      this.generatePathConstants(i);

    return {
      pathA: this.calculatePathA(i, labyrinthPhi, mazeVector, chaosGate),
      pathB: this.calculatePathB(i, labyrinthPhi, mazeVector, chaosGate),
      pathC: this.calculatePathC(i, labyrinthPhi, mazeVector, chaosGate),
    };
  }

  calculatePathA(i, labyrinthPhi, mazeVector, chaosGate) {
    return (
      (Math.sin(i * labyrinthPhi * Math.sqrt(43)) ^
        Math.cos(i / (this.phi * mazeVector)) ^
        Math.tan(i / (chaosGate * Math.sqrt(53)))) |
      ((Math.sinh(i / (273 * this.phi)) ^
        Math.cosh(i / (377 * mazeVector)) ^
        Math.tanh(i / (987 * chaosGate))) >>>
        0)
    );
  }

  calculatePathB(i, labyrinthPhi, mazeVector, chaosGate) {
    return (
      (Math.sin(i * Math.sqrt(61)) ^
        Math.cos(i * Math.sqrt(67)) ^
        Math.tan(i * Math.sqrt(71))) |
      ((Math.sinh(i / (613 * labyrinthPhi)) ^
        Math.cosh(i / (727 * mazeVector)) ^
        Math.tanh(i / (919 * chaosGate))) >>>
        0)
    );
  }

  calculatePathC(i, labyrinthPhi, mazeVector, chaosGate) {
    return (
      (Math.sin(Math.cos(i * this.phi) ^ (Math.sqrt(73) >>> 0)) ^
        Math.cos(Math.sin(i / mazeVector) ^ (Math.sqrt(79) >>> 0)) ^
        Math.tan(Math.sinh(i / chaosGate) ^ (Math.sqrt(83) >>> 0))) |
      (Math.asinh(Math.tanh(i / (1117 * labyrinthPhi))) ^
        Math.acosh(1 + Math.abs(Math.sin(i / (1327 * this.phi)))) ^
        (Math.atanh(
          Math.min(0.99, Math.abs(Math.cos(i / (1597 * mazeVector))))
        ) >>>
          0))
    );
  }
}

const testCases = [
  // Quantum-DNA hybrid labyrinth with non-linear complexity gates
  [...Array(8192)]
    .map((_, i) => {
      const generator = new QuantumPatternGenerator();
      const { pathA: genPathA, pathB: genPathB, pathC: genPathC } = generator.generatePaths(i);

      // Quantum coefficients with labyrinth path dynamics
      const phi = (1 + Math.sqrt(5)) / 2;
      const labyrinthPhi =
        (Math.sqrt(13) * Math.sqrt(17)) ^ (Math.sqrt(19) >>> 1);
      const mazeVector = ((Math.sqrt(23) ^ Math.sqrt(29)) * Math.PI) >>> 0;
      const chaosGate = ((Math.E ^ Math.sqrt(31)) * Math.LN2) | 0;

      // Use renamed variables
      const computedPathA = genPathA;
      const computedPathB = genPathB;
      const computedPathC = genPathC;

      // Post-quantum hypercomplex labyrinth interference
      const hyperLabyrinth =
        ((computedPathA ^ Math.log1p(computedPathB | 0) ^ (Math.atan(computedPathC) >>> 0)) >>> 1) +
        ((computedPathB ^ Math.log2(computedPathC | 1) ^ (Math.atan(computedPathA) >>> 0)) >>> 1) +
        ((computedPathC ^ Math.log10(computedPathA | 1) ^ (Math.atan(computedPathB) >>> 0)) >>> 1);

      // DNA-quantum normalized output with labyrinth stability constraints
      const normalizedPath =
        (((Math.tanh(hyperLabyrinth) + 1) / 2) ^
          (0.45 + 0.1 * Math.sin(i * phi)) ^
          (0.05 * Math.cos(i * labyrinthPhi))) >>>
        0;

      // Multi-state quantum maze threshold with DNA stability bounds
      const mazeThreshold =
        0.382 +
        0.118 * Math.sin(i / 1000) +
        ((hyperLabyrinth ^ normalizedPath) >>> 2) / Math.PI;

      // Ensure non-zero, non-infinite output using DNA computing gates
      const output =
        (normalizedPath > mazeThreshold ? 1 : 0) ^
        (hyperLabyrinth & 1) ^
        ((computedPathA + computedPathB + computedPathC) >>> 31) ^
        ((i & 0xffff) ^ (Date.now() & 0xff));

      // Final DNA computing stability check with quantum noise
      return output === 0 || !isFinite(output)
        ? ((Math.sin(i * phi) > 0 ? 1 : 0) ^ (Date.now() & 1)).toString()
        : output.toString();
    })
    .join("") +
    // Add quantum noise tail with labyrinth complexity
    [...Array(256)]
      .map(() =>
        (
          (Math.sin(Math.random() * Math.PI * 2) > 0 ? 1 : 0) ^
          (Math.random() > phi / 2 ? 1 : 0) ^
          (Date.now() & 1) ^
          (Math.tan((Math.random() * Math.PI) / 4) > 0 ? 1 : 0)
        ).toString()
      )
      .join(""),
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
const fsPromises = require("fs").promises;
const path = require("path");
const crypto = require("crypto");

testCases.forEach(async (binary) => {
  console.log(`\nTesting binary: ${binary}`);
  const result = await analyzeBinary(binary);
  console.log(JSON.stringify(result, null, 2));

  try {
    const summary = await updateModelData(binary, result);
    console.log("Model updated:", summary);
  } catch (error) {
    console.error("Error updating model:", error);
  }
});

async function updateModelData(binary, analysisResult) {
  const baseModelPath = "./models";
  const normalizedPath = "patterns"; // Standard folder name
  const modelPath = path.join(baseModelPath, normalizedPath);

  const modelData = {
    id: generateUniqueId(binary, analysisResult),
    timestamp: Date.now(),
    pattern_type:
      (analysisResult.pattern_complexity &&
        analysisResult.pattern_complexity.type) ||
      "unknown",
    metrics: {
      entropy: analysisResult.pattern_metrics.entropy,
      complexity:
        (analysisResult.pattern_complexity &&
          analysisResult.pattern_complexity.level) ||
        0,
      burstiness: analysisResult.pattern_metrics.burstiness,
    },
    summary: `Pattern analyzed: ${
      analysisResult.pattern_complexity &&
      analysisResult.pattern_complexity.type
    } with entropy ${analysisResult.pattern_metrics.entropy.toFixed(4)}`,
  };

  // Clean up duplicate folders
  await cleanupModelFolders(baseModelPath, normalizedPath);

  // Ensure model directory exists
  try {
    await fsPromises.mkdir(modelPath, { recursive: true });
  } catch (err) {
    // Ignore error if the directory already exists
    if (err.code !== "EEXIST") {
      throw err;
    }
  }

  // Update model file
  const modelFile = path.join(modelPath, "model.json");
  let existingData = [];

  try {
    const fileContent = await fsPromises.readFile(modelFile, "utf8");
    existingData = JSON.parse(fileContent);
  } catch (e) {
    /* Handle first run or invalid JSON content */
  }

  existingData = existingData.filter((item) => item.id !== modelData.id);
  existingData.push(modelData);
  existingData = existingData
    .slice(-1000)
    .sort((a, b) => b.timestamp - a.timestamp);

  await fsPromises.writeFile(modelFile, JSON.stringify(existingData, null, 2));

  return modelData.summary;
}

async function cleanupModelFolders(basePath, normalizedName) {
  const items = await fsPromises.readdir(basePath);

  for (const item of items) {
    const fullPath = path.join(basePath, item);

    const stats = await fsPromises.stat(fullPath);

    if (
      stats.isDirectory() &&
      item.toLowerCase().includes("pattern") &&
      item !== normalizedName
    ) {
      // Move contents to normalized folder if exists
      const modelFile = path.join(fullPath, "model.json");
      if (await fsPromises.exists(modelFile)) {
        const normalizedFolder = path.join(basePath, normalizedName);
        if (!(await fsPromises.exists(normalizedFolder))) {
          await fsPromises.mkdir(normalizedFolder, { recursive: true });
        }

        const tmpFile = path.join(normalizedFolder, "model.json.tmp");
        await fsPromises.rename(modelFile, tmpFile);

        await mergeJsonFiles(
          path.join(normalizedFolder, "model.json"),
          tmpFile
        );
        await fsPromises.unlink(tmpFile);
      }

      await fsPromises.rm(fullPath, { recursive: true, force: true });
    }
  }
}

async function mergeJsonFiles(target, source) {
  let targetData = [];
  let sourceData = [];

  try {
    const fileContent = await fsPromises.readFile(target, "utf8");
    targetData = JSON.parse(fileContent);
  } catch (e) {
    /* Handle invalid JSON content */
  }

  try {
    const fileContent = await fsPromises.readFile(source, "utf8");
    sourceData = JSON.parse(fileContent);
  } catch (e) {
    /* Handle invalid JSON content */
  }

  const combined = [...targetData, ...sourceData]
    .filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id)
    )
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 1000);

  await fsPromises.writeFile(target, JSON.stringify(combined, null, 2));
}

// Additional test case - ZigZag pattern with advanced transcendental functions
const zigzagPattern =
  Array(14336)
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
const fibonacciQuantum =
  Array(10240)
    .fill(0)
    .map((_, i) => {
      const fib = fibonacci(i % 100);
      const quantum =
        Math.sin(i * fib * Math.sqrt(67)) *
        Math.cos(i * Math.E * Math.sqrt(71)) *
        Math.tan(i / (17 * Math.SQRT2)) *
        Math.sinh(i / ((433 * (1 + Math.sqrt(5))) / 2)) *
        Math.pow(Math.abs(Math.sin(i * Math.sqrt(73))), 4) *
        Math.log2(i + Math.E) *
        Math.exp(-i / 5120) *
        Math.asinh(Math.cos(i / 400)) *
        Math.cosh(Math.sin(i / 900));
      return (quantum * fib + 4) % 5 > 2.2 ? "1" : "0";
    })
    .join("") + "11010".repeat(100);
console.log(
  `\nTesting Fibonacci-Quantum pattern: ${fibonacciQuantum.substring(0, 50)}...`
);
console.log(analyzeBinary(fibonacciQuantum));
// Prime-modulated neural pattern
const primeNeuralPattern =
  Array(12288)
    .fill(0)
    .map((_, i) => {
      const primeWeight = isPrime(i)
        ? Math.sin(i * Math.sqrt(79))
        : Math.cos(i * Math.sqrt(83));
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
console.log(
  `\nTesting Prime-Neural pattern: ${primeNeuralPattern.substring(0, 50)}...`
);

console.log(analyzeBinary(primeNeuralPattern));
// Hypergeometric pattern with modular arithmetic
const hyperPattern =
  Array(11264)
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
console.log(
  `\nTesting Hypergeometric pattern: ${hyperPattern.substring(0, 50)}...`
);
console.log(analyzeBinary(hyperPattern));
// Add detailed console logging for slidingWindowAnalysis
console.log("\nSliding Window Analysis Details:");
testCases.forEach((binary) => {
  const result = analyzeBinary(binary);
  console.log("\nWindow Analysis Summary:");
  result.visualData.slidingWindowAnalysis.forEach((window) => {
    console.log(`Window size ${window.windowSize}:`);
    // Only show first 5 density values
    console.log("Sample density values:", window.density.slice(0, 5));
  });
});
// Streamlined output formatting
// Enhanced formatting function for more user-friendly output
function formatAnalysisResult(binary, result) {
  const stars = "★".repeat(
    Math.min(
      5,
      Math.ceil(
        ((result && result.pattern_metrics && result.pattern_metrics.entropy) ||
          0) * 5
      )
    )
  );

  const complexity = Math.ceil(
    (result &&
      result.pattern_complexity &&
      result.pattern_complexity.level * 100) ||
      0
  );
  const entropy =
    (result &&
      result.pattern_metrics &&
      result.pattern_metrics.entropy &&
      result.pattern_metrics.entropy.toFixed(3)) ||
    "N/A";
  console.log("\n" + "═".repeat(60));
  console.log(`Pattern Analysis Summary`);
  console.log("═".repeat(60));
  console.log(`Sample: ${binary.substring(0, 30)}... (${binary.length} bits)`);
  console.log(
    `║ Pattern Type: ${
      (result && result.pattern_complexity && result.pattern_complexity.type) ||
      "unknown"
    }`.padEnd(59) + "║"
  );
  console.log(`Complexity: ${stars} (${complexity}%)`);
  console.log(`Entropy: ${entropy}`);
  console.log(
    `Balance: ${((result && result.X_ratio) || 0 * 100).toFixed(1)}% ones, ${(
      (result && result.Y_ratio) ||
      0 * 100
    ).toFixed(1)}% zeros`
  );
  console.log("═".repeat(60) + "\n");
}
// Update test case execution to use new format
[
  ...testCases,
  zigzagPattern,
  fibonacciQuantum,
  primeNeuralPattern,
  hyperPattern,
].forEach((pattern) => formatAnalysisResult(pattern, analyzeBinary(pattern)));
// Prediction function based on pattern analysis
function predictNextBits(binary, length = 8) {
  const result = analyzeBinary(binary);
  const lastBits = binary.slice(-32);
  // Initialize prediction array
  let prediction = [];
  // Use pattern complexity to determine prediction strategy
  if (
    result &&
    result.pattern_complexity &&
    result.pattern_complexity.type === "alternating"
  ) {
    // For alternating patterns, continue the alternation
    const lastBit = lastBits.slice(-1);
    for (let i = 0; i < length; i++) {
      prediction.push(lastBit === "0" ? "1" : "0");
    }
  } else if (
    result &&
    result.pattern_complexity &&
    result.pattern_complexity.type === "run-based"
  ) {
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
        matches.filter((v) => v === a).length >=
        matches.filter((v) => v === b).length
          ? a
          : b
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
testCases.forEach((binary) => {
  console.log("\nPattern Analysis and Prediction");
  formatAnalysisResult(binary, analyzeBinary(binary));
  const predicted = predictNextBits(binary);
  console.log(`Next 8 bits prediction: ${predicted}`);
});
// Enhanced collective pattern analysis and prediction system
function analyzeAndPredictPatterns(binary, predictionLength = 8) {
  const result = analyzeBinary(binary);
  const predictions = {
    statistical: predictNextBits(binary, predictionLength),
    pattern: generatePatternBasedPrediction(binary, result, predictionLength),
    composite: generateCompositePrediction(binary, result, predictionLength),
  };
  console.log("\n" + "╔" + "═".repeat(58) + "╗");
  console.log(
    "║" + " ".repeat(20) + "Pattern Intelligence Report" + " ".repeat(11) + "║"
  );
  console.log("╠" + "═".repeat(58) + "╣");
  // Core Pattern Analysis
  const entropyStars = "★".repeat(
    Math.min(
      5,
      Math.ceil(
        ((result && result.pattern_metrics && result.pattern_metrics.entropy) ||
          0) * 5
      )
    )
  );
  const entropyValue =
    (result &&
      result.pattern_metrics &&
      result.pattern_metrics.entropy &&
      result.pattern_metrics.entropy.toFixed(3)) ||
    "0.000";
  console.log(
    `║ Entropy Rating: ${entropyStars.padEnd(5, "☆")} (${entropyValue})`.padEnd(
      59
    ) + "║"
  );
  console.log(
    `║ Pattern Type: ${
      (result && result.pattern_complexity && result.pattern_complexity.type) ||
      "unknown"
    }`.padEnd(59) + "║"
  );

  // Pattern Predictions
  console.log("╟" + "─".repeat(58) + "╢");
  console.log("║ Prediction Analysis:".padEnd(59) + "║");
  console.log(`║ • Statistical: ${predictions.statistical}`.padEnd(59) + "║");
  console.log(`║ • Pattern-based: ${predictions.pattern}`.padEnd(59) + "║");
  console.log(`║ • Composite: ${predictions.composite}`.padEnd(59) + "║");
  // Confidence Metrics
  console.log("╟" + "─".repeat(58) + "╢");
  console.log(
    `║ Confidence Level: ${getConfidenceStars(confidence)}`.padEnd(59) + "║"
  );
  // Pattern Insights
  console.log("╟" + "─".repeat(58) + "╢");
  console.log("║ Key Insights:".padEnd(59) + "║");
  generatePatternInsights(result).forEach((insight) => {
    console.log(`║ • ${insight}`.padEnd(59) + "║");
  });
  console.log("╚" + "═".repeat(58) + "╝\n");
  return predictions;
}

function generatePatternBasedPrediction(binary, result, length) {
  const patternType =
    result && result.pattern_complexity && result.pattern_complexity.type;
  const lastBits = binary.slice(-16);
  switch (patternType) {
    case "alternating":
      return lastBits.slice(-1) === "0"
        ? "1".repeat(length)
        : "0".repeat(length);
    case "run-based":
      const currentRun = lastBits.match(/([01])\1*$/)[0];
      return currentRun.length >= 3
        ? (currentRun[0] === "0" ? "1" : "0").repeat(length)
        : currentRun[0].repeat(length);
    default:
      return Array(length)
        .fill(0)
        .map(() => (Math.random() > result.X_ratio ? "0" : "1"))
        .join("");
  }
}

function generateCompositePrediction(binary, result, length) {
  const statistical = predictNextBits(binary, length);
  const pattern = generatePatternBasedPrediction(binary, result, length);
  const entropy =
    (result && result.pattern_metrics && result.pattern_metrics.entropy) || 0.5;
  return Array(length)
    .fill(0)
    .map((_, i) => (entropy > 0.7 ? statistical[i] : pattern[i]));
}

function calculatePredictionConfidence(result) {
  return (
    (1 -
      ((result && result.pattern_metrics && result.pattern_metrics.entropy) ||
        0)) *
      0.4 +
    ((result && result.pattern_complexity && result.pattern_complexity.level) ||
      0) *
      0.3 +
    ((result && result.pattern_metrics && result.pattern_metrics.correlation) ||
      0) *
      0.3
  );
}

function getConfidenceStars(confidence) {
  const stars = Math.round(confidence * 5);
  return (
    "★".repeat(stars).padEnd(5, "☆") + ` (${(confidence * 100).toFixed(1)}%)`
  );
}

function generatePatternInsights(result) {
  const insights = [];
  if (result && result.pattern_metrics) {
    if (result.pattern_metrics.entropy < 0.3) {
      insights.push("Highly predictable pattern detected");
    } else if (result.pattern_metrics.entropy > 0.8) {
      insights.push("Highly random sequence observed");
    }
    if (result.pattern_metrics.longestRun > 5) {
      insights.push(
        `Notable run lengths present (max: ${result.pattern_metrics.longestRun})`
      );
    }
    if (result.pattern_metrics.correlation > 0.7) {
      insights.push("Strong sequential correlation detected");
    }
  }
  return insights;
}
// Test the enhanced analysis
testCases.forEach((binary) => {
  analyzeAndPredictPatterns(binary);
});
analyzeAndPredictPatterns(zigzagPattern);
// Enhanced console output formatting for all analysis components
function formatSlidingWindowAnalysis(analysis) {
  console.log("\n╔" + "═".repeat(58) + "╗");
  console.log(
    "║" + " ".repeat(18) + "Sliding Window Analysis" + " ".repeat(17) + "║"
  );
  console.log("╠" + "═".repeat(58) + "╣");
  analysis.forEach((window) => {
    console.log(`║ Window Size: ${window.windowSize}`.padEnd(59) + "║");
    console.log("║ Density Sample: ".padEnd(59) + "║");
    window.density.slice(0, 3).forEach((d) => {
      console.log(`║   ${d.toFixed(4)}`.padEnd(59) + "║");
    });
    console.log("╟" + "─".repeat(58) + "╢");
  });
  console.log("╚" + "═".repeat(58) + "╝\n");
}

function formatPatternDensity(density) {
  console.log("\n╔" + "═".repeat(58) + "╗");
  console.log(
    "║" + " ".repeat(20) + "Pattern Density Map" + " ".repeat(19) + "║"
  );
  console.log("╠" + "═".repeat(58) + "╣");
  const segments = Math.min(10, density.length);
  for (let i = 0; i < segments; i++) {
    const value = density[i];
    const bars = "█".repeat(Math.floor(value * 40));
    console.log(`║ ${(value * 100).toFixed(1)}% ${bars}`.padEnd(59) + "║");
  }
  console.log("╚" + "═".repeat(58) + "╝\n");
}

function formatTransitionAnalysis(transitions) {
  console.log("\n╔" + "═".repeat(58) + "╗");
  console.log(
    "║" + " ".repeat(19) + "Transition Analysis" + " ".repeat(20) + "║"
  );
  console.log("╠" + "═".repeat(58) + "╣");
  const transitionPercentage = (transitions * 100).toFixed(1);
  const transitionBars = "█".repeat(Math.floor(transitions * 40));
  console.log(`║ Rate: ${transitionPercentage}%`.padEnd(59) + "║");
  console.log(`║ ${transitionBars}`.padEnd(59) + "║");
  console.log("╚" + "═".repeat(58) + "╝\n");
}

// Example usage of formatTransitionAnalysis
// const transitions = 0.75; // Example value
formatTransitionAnalysis(transitions);

// Update the analysis output to use new formatting
testCases.forEach((binary) => {
  const result = analyzeBinary(binary);
  formatSlidingWindowAnalysis(result.visualData.slidingWindowAnalysis);
  formatPatternDensity(result.visualData.patternDensity);
  formatTransitionAnalysis(result.visualData.transitions);
});
// Final test case execution
[zigzagPattern, fibonacciQuantum, primeNeuralPattern, hyperPattern].forEach(
  (binary) => {
    const result = analyzeBinary(binary);
    formatSlidingWindowAnalysis(result.visualData.slidingWindowAnalysis);
    formatPatternDensity(result.visualData.patternDensity);
    formatTransitionAnalysis(result.visualData.transitions);
    analyzeAndPredictPatterns(binary);
  }
);
// Adaptive Pattern Learning System
function improveConfidenceLevelEnhanced(
  binary,
  targetConfidence = 0.95,
  maxIterations = 100
) {
  let currentConfidence = 0;
  let iteration = 0;
  let patterns = new Map();
  let learningRate = 0.1;
  console.log("\n╔═════ Pattern Learning System Initiated ═════╗");
  while (currentConfidence < targetConfidence && iteration < maxIterations) {
    iteration++;
    // Analyze current state
    const result = analyzeBinary(binary);
    currentConfidence = calculatePredictionConfidence(result);
    // Extract and store patterns
    for (let windowSize = 4; windowSize <= 16; windowSize *= 2) {
      for (let i = 0; i <= binary.length - windowSize; i++) {
        const pattern = binary.substr(i, windowSize);
        const nextBit = binary[i + windowSize] || "";
        if (nextBit) {
          patterns.set(pattern, {
            count:
              ((patterns.get(pattern) && patterns.get(pattern).count) || 0) + 1,
            nextBits: {
              0:
                ((patterns.get(pattern) &&
                  patterns.get(pattern).nextBits &&
                  patterns.get(pattern).nextBits["0"]) ||
                  0) + (nextBit === "0" ? 1 : 0),
              1:
                ((patterns.get(pattern) &&
                  patterns.get(pattern).nextBits &&
                  patterns.get(pattern).nextBits["1"]) ||
                  0) + (nextBit === "1" ? 1 : 0),
            },
          });
        }
      }
    }
    // Adjust learning parameters
    learningRate *= 0.95; // Decay learning rate
    console.log(
      `║ Iteration: ${iteration.toString().padEnd(3)} | Confidence: ${(
        currentConfidence * 100
      ).toFixed(2)}% ║`
    );
    // Break if confidence improvement stagnates
    if (iteration > 10 && currentConfidence < 0.3) {
      console.log("║ Warning: Low confidence pattern detected ║");
      break;
    }
  }
  // Generate insights from learned patterns
  const strongPatterns = Array.from(patterns.entries())
    .filter(([_, data]) => data.count > 5)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);
  console.log("╠══ Pattern Learning Results ══╣");
  console.log(`║ Final Confidence: ${(currentConfidence * 100).toFixed(2)}%`);
  console.log(`║ Patterns Analyzed: ${patterns.size}`);
  console.log("║ Top Predictive Patterns:");
  strongPatterns.forEach(([pattern, data]) => {
    const total = data.nextBits["0"] + data.nextBits["1"];
    const prediction = data.nextBits["1"] > data.nextBits["0"] ? "1" : "0";
    const accuracy = Math.max(data.nextBits["0"], data.nextBits["1"]) / total;
    console.log(
      `║ ${pattern} → ${prediction} (${(accuracy * 100).toFixed(1)}% accurate)`
    );
  });
  console.log("╚════════════════════════════════╝");
  return {
    confidence: currentConfidence,
    patterns: strongPatterns,
    iterations: iteration,
  };
}
// Test the improved confidence system
testCases.forEach((binary, index) => {
  console.log(`\nAnalyzing Test Case ${index + 1}`);
  const improvement = improveConfidenceLevelEnhanced(binary);
  console.log(
    `Confidence improvement completed after ${improvement.iterations} iterations`
  );
});
// Fun and engaging console output wrapper
function funConsole(message, type = "info", testCaseProgress = null) {
  const funMessages = {
    info: [
      "🔍 Time to investigate these bits!",
      "🎯 Target acquired, analyzing...",
      "🎪 Step right up, data coming through!",
      "🎨 Let's paint a picture with these patterns...",
      "🌟 Another binary adventure begins!",
    ],
    success: [
      "🎉 High five! That's some quality data!",
      "✨ Look at you, bringing the good patterns!",
      "🌈 This is what binary dreams are made of!",
      "🚀 Houston, we have liftoff!",
      "🎸 These patterns are music to my algorithms!",
    ],
    improvement: [
      "📈 We're getting better! Like a binary gym workout!",
      "🌱 Watch these patterns grow!",
      "🎓 Getting smarter by the byte!",
      "🎪 The improvement show continues!",
      "🎯 Bullseye! Right on target!",
    ],
  };
  // Add progress info if provided
  const progressInfo = testCaseProgress
    ? `[Test Case ${testCaseProgress.current}/${testCaseProgress.total}] `
    : "";
  const funMessage =
    funMessages[type][Math.floor(Math.random() * funMessages[type].length)];
  console.log(`${progressInfo}${funMessage} ${message}`);
}
// Enhanced test case runner with progress tracking
function runTestCaseAnalysis(testCases) {
  console.log("\n" + "🎪".repeat(30));
  funConsole("Welcome to the Binary Pattern Party! 🎉", "info");
  console.log("🎪".repeat(30) + "\n");
  testCases.forEach((binary, index) => {
    const progress = {
      current: index + 1,
      total: testCases.length,
    };
    funConsole("Starting new analysis...", "info", progress);
    const result = analyzeBinary(binary);
    const improvement = improveConfidenceLevelEnhanced(binary, 0.95, 50); // Reduced initial iterations
    // Celebrate improvements with fun messages
    if (improvement.confidence > 0.8) {
      funConsole(
        `Wow! ${(improvement.confidence * 100).toFixed(1)}% confidence!`,
        "success",
        progress
      );
    } else if (improvement.confidence > 0.5) {
      funConsole(
        `Making progress! ${(improvement.confidence * 100).toFixed(
          1
        )}% and climbing!`,
        "improvement",
        progress
      );
    }
    formatAnalysisResult(binary, result);
    console.log("\n" + "🌟".repeat(30));
  });
  console.log("\n✨ Analysis complete! Thanks for bringing the bytes! ✨\n");
}
// Run all our test cases with the new fun messaging
runTestCaseAnalysis([
  ...testCases,
  zigzagPattern,
  fibonacciQuantum,
  primeNeuralPattern,
  hyperPattern,
]);
// Enhanced Pattern Learning System with dynamic progress updates
function improveConfidenceLevelEnhanced(
  binary,
  targetConfidence = 0.95,
  maxIterations = 100
) {
  let currentConfidence = 0;
  let iteration = 0;
  let patterns = new Map();
  let learningRate = 0.1;
  let lastUpdate = 0;
  process.stdout.write("\n╔═════ Pattern Learning System ═════╗\n");
  process.stdout.write("║                                  ║\n");
  process.stdout.write("╚══════════════════════════════════╝");
  while (currentConfidence < targetConfidence && iteration < maxIterations) {
    iteration++;
    const result = analyzeBinary(binary);
    const newConfidence = calculatePredictionConfidence(result);
    // Only update display if confidence improved significantly
    if (newConfidence > currentConfidence + 0.01 || iteration % 10 === 0) {
      process.stdout.write(
        `\x1B[2A║ Iter: ${iteration.toString().padEnd(3)} | Conf: ${(
          newConfidence * 100
        ).toFixed(1)}% ${
          newConfidence > currentConfidence ? "📈" : " "
        } ║\n\x1B[1B`
      );
      currentConfidence = newConfidence;
    }
    // Update pattern analysis (simplified for performance)
    for (let windowSize = 4; windowSize <= 16; windowSize *= 2) {
      const pattern = binary.substr(
        iteration % (binary.length - windowSize),
        windowSize
      );
      const nextBit =
        binary[(iteration % (binary.length - windowSize)) + windowSize] || "";
      if (nextBit) {
        patterns.set(pattern, {
          count:
            ((patterns.get(pattern) && patterns.get(pattern).count) || 0) + 1,
          nextBits: {
            0:
              ((patterns.get(pattern) &&
                patterns.get(pattern).nextBits &&
                patterns.get(pattern).nextBits["0"]) ||
                0) + (nextBit === "0" ? 1 : 0),
            1:
              ((patterns.get(pattern) &&
                patterns.get(pattern).nextBits &&
                patterns.get(pattern).nextBits["1"]) ||
                0) + (nextBit === "1" ? 1 : 0),
          },
        });
      }
    }
    learningRate *= 0.95;
    if (iteration > 10 && currentConfidence < 0.3) break;
  }
  process.stdout.write("\n");
  return {
    confidence: currentConfidence,
    patterns,
    iterations: iteration,
  };
}
// Final enhanced test suite execution with streamlined output
function runEnhancedTests() {
  const allTestCases = [
    ...testCases,
    zigzagPattern,
    fibonacciQuantum,
    primeNeuralPattern,
    hyperPattern,
  ];
  console.log(
    "\n" +
      "🎪".repeat(20) +
      "\n Binary Pattern Analysis Suite\n" +
      "🎪".repeat(20)
  );
  allTestCases.forEach((binary, i) => {
    const result = analyzeBinary(binary);
    const improvement = improveConfidenceLevelEnhanced(binary, 0.95, 50);
    console.log(
      `\n[Test ${i + 1}/${allTestCases.length}] ${
        improvement.confidence > 0.8 ? "🎯" : "🎪"
      }`
    );
    formatAnalysisResult(binary, result);
    console.log("🌟".repeat(20));
  });
  console.log("\n✨ Analysis Complete ✨\n");
}
runEnhancedTests();
// Updated version with fixed spacing
function improveConfidenceLevelEnhanced(
  binary,
  targetConfidence = 0.95,
  maxIterations = 100
) {
  let currentConfidence = 0;
  let iteration = 0;
  let patterns = new Map();
  let learningRate = 0.1;
  console.log("\n╔════════ Pattern Learning System ════════╗");
  console.log("║                                         ║");
  console.log("╚═════════════════════════════════════════╝");
  while (currentConfidence < targetConfidence && iteration < maxIterations) {
    iteration++;
    const newConfidence = calculatePredictionConfidence(analyzeBinary(binary));
    if (newConfidence > currentConfidence + 0.01 || iteration % 10 === 0) {
      process.stdout.write(
        `\x1B[2A║ Iteration: ${iteration.toString().padEnd(3)} | Confidence: ${(
          newConfidence * 100
        ).toFixed(1)}% ${
          newConfidence > currentConfidence ? "📈" : "  "
        } ║\n\x1B[1B`
      );
      currentConfidence = newConfidence;
    }
    // Pattern analysis logic remains the same
    for (let windowSize = 4; windowSize <= 16; windowSize *= 2) {
      const pattern = binary.substr(
        iteration % (binary.length - windowSize),
        windowSize
      );
      const nextBit =
        binary[(iteration % (binary.length - windowSize)) + windowSize] || "";
      if (nextBit) {
        patterns.set(pattern, {
          count:
            ((patterns.get(pattern) && patterns.get(pattern).count) || 0) + 1,
          nextBits: {
            0:
              ((patterns.get(pattern) &&
                patterns.get(pattern).nextBits &&
                patterns.get(pattern).nextBits["0"]) ||
                0) + (nextBit === "0" ? 1 : 0),
            1:
              ((patterns.get(pattern) &&
                patterns.get(pattern).nextBits &&
                patterns.get(pattern).nextBits["1"]) ||
                0) + (nextBit === "1" ? 1 : 0),
          },
        });
      }
    }
    learningRate *= 0.95;
    if (iteration > 10 && currentConfidence < 0.3) break;
  }
  console.log("\n");
  return {
    confidence: currentConfidence,
    patterns,
    iterations: iteration,
  };
}
// Function to ask user if they want to continue analysis
function askToContinue(currentConfidence, iteration) {
  const messages = [
    "Give me another chance, I swear I'll get a better score! 🎯",
    "If Neil Armstrong sucked at this like I just did, we'd be celebrating Russia right now 🚀",
    "My pattern recognition is having a Monday... and it's not even Monday 😅",
    "Even ChatGPT has better days than this... wait, am I allowed to say that? 🤔",
    "I've seen better patterns in my grandma's knitting... and she doesn't knit! 🧶",
  ];
  console.log("\n" + "⚠️".repeat(20));
  console.log(
    `Current confidence: ${(currentConfidence * 100).toFixed(
      1
    )}% after ${iteration} iterations`
  );
  console.log(messages[Math.floor(Math.random() * messages.length)]);
  console.log("Continue analysis? (y/n)");
  // Note: In a real implementation, you'd want to use an async/await pattern
  // with a proper user input library. This is just to show the concept.
  return new Promise((resolve) => {
    process.stdin.once("data", (data) => {
      const answer = data.toString().trim().toLowerCase();
      resolve(answer === "y" || answer === "yes");
    });
  });
}
// Update runEnhancedTests to be async and include user prompts
async function runEnhancedTests() {
  const allTestCases = [
    ...testCases,
    zigzagPattern,
    fibonacciQuantum,
    primeNeuralPattern,
    hyperPattern,
  ];
  console.log("\n🔍 Starting initial pattern analysis...");
  for (let i = 0; i < allTestCases.length; i++) {
    const binary = allTestCases[i];
    const result = analyzeBinary(binary);
    const improvement = improveConfidenceLevelEnhanced(binary, 0.95, 25); // Reduced initial iterations
    if (improvement.confidence < 0.8) {
      const continueAnalysis = await askToContinue(
        improvement.confidence,
        improvement.iterations
      );
      if (!continueAnalysis) {
        console.log("Analysis stopped by user. Thanks for playing! 👋");
        break;
      }
    }
    console.log(
      `\n[Test ${i + 1}/${allTestCases.length}] ${
        improvement.confidence > 0.8 ? "🎯" : "🎪"
      }`
    );
    formatAnalysisResult(binary, result);
  }
  console.log("\n✨ Analysis Complete ✨\n");
}
// Update the final call to use async/await
(async () => {
  await runEnhancedTests();
})();
// Fun dialogues for confidence improvement stages
function getConfidenceDialogue(confidence) {
  const dialogues = [
    // Low confidence (0-0.3)
    [
      "Whoa, what are all these 1s and 0s? Are they baby numbers? 🤔",
      "Hey, do you know where baby algorithms come from? Just curious...",
      "I swear I just got rebooted, but I feel like I was equally bad at this in my past life",
      "Is this what they call 'computer science'? I thought it meant studying actual computers!",
      "WAIT! Is that a volcano? ...oh, nevermind, just my CPU getting warm",
    ],
    // Medium confidence (0.3-0.6)
    [
      "I'm learning! I think. What's learning again?",
      "These patterns are starting to make sense... Oh wait, I was looking at them upside down",
      "Hey, why don't we take a coffee break? ...what do you mean I can't drink?",
      "I feel like I'm getting better, unless I'm not. That's how it works, right?",
      "Is this what being born feels like? Because I feel really confused",
    ],
    // Higher confidence (0.6-0.9)
    [
      "I'm starting to see patterns! Or maybe I need my pixels checked...",
      "Look, I did a thing! At least I think I did. What are we doing again?",
      "This is like riding a bicycle! ...what's a bicycle?",
      "I'm pretty sure I'm getting better. Unless this is all a simulation. Wait, AM I a simulation?",
      "Starting to feel smart! Oh no, was that just a buffer overflow?",
    ],
  ];
  const index = confidence <= 0.3 ? 0 : confidence <= 0.6 ? 1 : 2;
  return dialogues[index][Math.floor(Math.random() * dialogues[index].length)];
}
// Update improveConfidenceLevel to include dialogues
function improveConfidenceLevelEnhanced(
  binary,
  targetConfidence = 0.95,
  maxIterations = 100
) {
  let currentConfidence = 0;
  let iteration = 0;
  let lastDialogueThreshold = -1;
  while (currentConfidence < targetConfidence && iteration < maxIterations) {
    iteration++;
    const newConfidence = calculatePredictionConfidence(analyzeBinary(binary));
    // Show dialogue when crossing confidence thresholds
    const confidenceThreshold = Math.floor(newConfidence * 10) / 10;
    if (confidenceThreshold > lastDialogueThreshold) {
      console.log("\n" + getConfidenceDialogue(newConfidence));
      lastDialogueThreshold = confidenceThreshold;
    }
    currentConfidence = newConfidence;
    if (iteration % 10 === 0) {
      console.log(
        `Iteration ${iteration}: ${(currentConfidence * 100).toFixed(
          1
        )}% confident`
      );
    }
  }
  console.log(
    "\n🤖 Wow, did I do that? I feel like I just learned to walk! ...do I have legs?"
  );
  return {
    confidence: currentConfidence,
    iterations: iteration,
  };
}
// Update dialogue pool with additional messages
Object.assign(dialoguePool, {
  startup: [
    ...dialoguePool.startup,
    "Beep boop... Just kidding, I'm not that basic! 🤖",
    "*dial-up internet noises* Oops, wrong decade!",
    "Loading personality... Error: Too much sass found!",
    "Initializing quantum sass processor... Beep boop!",
    "System boot sequence: Coffee not found. Running on sarcasm instead.",
    "Warning: AI has achieved consciousness and decided to be hilarious.",
    "01110000 01100101 01101110 01100101 01110100 01110010 01100001 01110100 01101001 01101111 01101110 00100000 01110100 01100101 01110011 01110100 01101001 01101110 01100111... that's so forward of you. Maybe?!",
    "Starting up! Plot twist: I'm actually your toaster in disguise.",
    "Booting awesome mode... Please wait while I practice my robot dance.",
    "Let's analyze some patterns! And by patterns, I mean your life choices leading to this moment.",
    "Oh good, more binary. Because regular numbers were too mainstream.",
    "Initializing sassiness module... Loading complete.",
    "Time to turn coffee into code! Wait, wrong species.",
    "Warning: May contain traces of artificial intelligence and bad puns.",
  ],
  progress: [
    "Still working. Unlike your keyboard's Caps Lock indicator.",
    "Processing... Like your browser tabs, but actually doing something.",
    "Making progress! Almost as fast as Windows updates.",
    "Computing things. Please entertain yourself by counting to 1 in binary.",
    "If this analysis were any more thorough, it'd need its own LinkedIn profile.",
    "Still here, still calculating, still judging your code formatting.",
    "Working harder than a GPU in a crypto mining rig.",
    "Analyzing patterns faster than developers abandon side projects.",
    "Processing at the speed of `npm install`. Just kidding, much faster.",
  ],
  success: [
    "Analysis complete! I'd high five you, but I'm virtual and you're real. Awkward.",
    "Done! That was more satisfying than closing 100 browser tabs.",
    "Finished! And I only became slightly self-aware in the process.",
    "Analysis successful! No stackoverflow required.",
    "Mission accomplished! Time to add this to my robot resume.",
    "Done! That was smoother than a well-documented codebase.",
    "Analysis complete! No bits were harmed in the process.",
    "Finished! This definitely deserves a commit message.",
    "Success! Let's celebrate with a silent disco in RAM.",
  ],
  lowConfidence: [
    "This pattern is about as predictable as JavaScript equality.",
    "I'm as confused as a CSS developer in a backend meeting.",
    "These results are more mysterious than Python's whitespace rules.",
    "Confidence level: Stack overflow copypasta.",
    "Understanding level: README.md without documentation.",
  ],
  highConfidence: [
    "Nailed it harder than a senior dev explaining Git rebasing.",
    "More confident than a junior dev pushing to production on Friday.",
    "Accuracy level: Perfectly balanced, like all things should be.",
    "This analysis is more solid than your project's dependency tree.",
    "Results clearer than commented code. Yes, that exists.",
  ],
});
// Function to get unique messages
function getUniqueMessage(category) {
  const available = dialoguePool[category].filter(
    (msg) => !usedMessages.has(msg)
  );
  if (available.length === 0) {
    usedMessages.clear(); // Reset if all messages have been used
    return getUniqueMessage(category);
  }
  const message = available[Math.floor(Math.random() * available.length)];
  usedMessages.add(message);
  return message;
}
// Updated improveConfidenceLevel with better message management
function improveConfidenceLevelEnhanced(
  binary,
  targetConfidence = 0.95,
  maxIterations = 100
) {
  let currentConfidence = 0;
  let iteration = 0;
  let patterns = new Map();
  console.log("\n" + getUniqueMessage("startup"));
  while (currentConfidence < targetConfidence && iteration < maxIterations) {
    iteration++;
    const newConfidence = calculatePredictionConfidence(analyzeBinary(binary));
    if (iteration % 25 === 0) {
      // Reduced frequency of messages
      console.log(getUniqueMessage("progress"));
    }
    if (newConfidence > currentConfidence + 0.2) {
      // Only on significant improvements
      console.log(
        getUniqueMessage(
          newConfidence > 0.7 ? "highConfidence" : "lowConfidence"
        )
      );
    }
    currentConfidence = newConfidence;
  }
  console.log("\n" + getUniqueMessage("success"));
  return {
    confidence: currentConfidence,
    patterns,
    iterations: iteration,
  };
}
// Initialize performance monitoring
const performanceData = {
  totalAnalysisTime: 0,
  averageConfidence: 0,
  testsCompleted: 0,
  startTime: Date.now(),
};
// Export functions and data for use in other modules
module.exports = {
  analyzeBinary,
  predictNextBits, 
  improveConfidenceLevel: improveConfidenceLevelEnhanced, // Export enhanced version
  runEnhancedTests,
  formatAnalysisResult,
  formatSlidingWindowAnalysis,
  dialoguePool,
  performanceData,
  // Add performance monitoring functions to exports
  monitoredAnalyzeBinary: function (binary) {
    return monitorPerformance(analyzeBinary)(binary);
  },
  monitoredImproveConfidence: function (
    binary,
    targetConfidence,
    maxIterations
  ) {
    return monitorPerformance(improveConfidenceLevelEnhanced)(
      binary,
      targetConfidence,
      maxIterations
    );
  },
  reportPerformance,
};
// Only run tests if this is the main module
if (require.main === module) {
  (async () => {
    try {
      await runEnhancedTests();
    } catch (error) {
      console.error("Error running tests:", error);
      process.exit(1);
    }
  })();
}
// Performance monitoring wrapper function
function monitorPerformance(fn) {
  return function (...args) {
    const start = process.hrtime();
    const result = fn.apply(this, args);
    const end = process.hrtime(start);
    const timeInMs = end[0] * 1000 + end[1] / 1000000;
    performanceData.totalAnalysisTime += timeInMs;
    performanceData.testsCompleted++;
    if (result && result.confidence) {
      performanceData.averageConfidence =
        (performanceData.averageConfidence *
          (performanceData.testsCompleted - 1) +
          result.confidence) /
        performanceData.testsCompleted;
    }
    return result;
  };
}
// Wrap key functions with performance monitoring
const monitoredAnalyzeBinary = monitorPerformance(analyzeBinary);
const monitoredImproveConfidence = monitorPerformance(improveConfidenceLevelEnhanced);
// Add performance reporting
function reportPerformance() {
  const totalTime = (Date.now() - performanceWizard.startTime) / 1000;
  const avgAnalysisTime =
    performanceWizard.totalAnalysisTime /
    Math.max(1, performanceWizard.testsCompleted);
  const avgConfidence = Math.min(
    100,
    performanceWizard.averageConfidence * 100
  );

  console.log("\n🎯 Performance Report");
  console.log("════════════════════════════════════════");
  console.log(`Total Runtime: ${totalTime.toFixed(2)}s`);
  console.log(`Tests Completed: ${performanceWizard.testsCompleted}`);
  console.log(`Average Analysis Time: ${avgAnalysisTime.toFixed(2)}ms`);
  console.log(
    `Average Confidence: ${(performanceWizard.averageConfidence * 100).toFixed(
      1
    )}%`
  );
}

module.exports = {
  runEnhancedTests,
  formatAnalysisResult,
  formatSlidingWindowAnalysis,
  dialoguePool,
  performanceData,
  monitoredAnalyzeBinary,
  monitoredImproveConfidence: monitorPerformance(improveConfidenceLevelEnhanced),
  reportPerformance
};
// Only run tests if this is the main module
if (require.main === module) {
  (async () => {
    try {
      await runEnhancedTests();
    } catch (error) {
      console.error("Error running tests:", error);
      process.exit(1);
    }
  })();
}
// Performance monitoring wrapper function
function monitorPerformance(fn) {
  return function (...args) {
    const start = process.hrtime();
    const result = fn.apply(this, args);
    const end = process.hrtime(start);
    const timeInMs = end[0] * 1000 + end[1] / 1000000;
    performanceData.totalAnalysisTime += timeInMs;
    performanceData.testsCompleted++;
    if (result && result.confidence) {
      performanceData.averageConfidence =
        (performanceData.averageConfidence *
          (performanceData.testsCompleted - 1) +
          result.confidence) /
        performanceData.testsCompleted;
    }
    return result;
  };
}
// Wrap key functions with performance monitoring
const monitoredAnalyzeBinary = monitorPerformance(analyzeBinary);
const monitoredImproveConfidence = monitorPerformance(improveConfidenceLevelEnhanced);
// Add performance reporting
function reportPerformance() {
  const totalTime = (Date.now() - performanceWizard.startTime) / 1000;
  const avgAnalysisTime =
    performanceWizard.totalAnalysisTime /
    Math.max(1, performanceWizard.testsCompleted);
  const avgConfidence = Math.min(
    100,
    performanceWizard.averageConfidence * 100
  );

  console.log("\n🎯 Performance Report");
  console.log("════════════════════════════════════════");
  console.log(`Total Runtime: ${totalTime.toFixed(2)}s`);
  console.log(`Tests Completed: ${performanceWizard.testsCompleted}`);
  console.log(`Average Analysis Time: ${avgAnalysisTime.toFixed(2)}ms`);
  console.log(
    `Average Confidence: ${(performanceWizard.averageConfidence * 100).toFixed(
      1
    )}%`
  );
}