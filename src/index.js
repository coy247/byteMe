const fs = require('fs');

// Function to analyze binary strings
function analyzeBinary(binary) {
  // Advanced pattern detection using sliding window analysis
  const windowSizes = [2, 4, 8, 16];
  const patternAnalysis = windowSizes.map(size => {
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
        .slice(0, 3)
    };
  });

  // Enhanced pattern metrics with visualization data
  const stats = {
    entropy: calculateEntropy(binary),
    longestRun: binary.match(/([01])\1*/g)?.reduce((max, run) => Math.max(max, run.length), 0) || 0,
    alternating: (binary.match(/(01|10)/g)?.length || 0) / (binary.length / 2),
    runs: (binary.match(/([01])\1+/g)?.length || 0) / binary.length,
    burstiness: calculateBurstiness(binary),
    correlation: calculateCorrelation(binary),
    patternOccurrences: findPatternOccurrences(binary),
    hierarchicalPatterns: patternAnalysis
  };

  // Data preprocessing and optimization
  const cleanBinary = preprocessBinary(binary);
  const complexity = calculateComplexity(cleanBinary, stats);
  const adjustment = calculateAdjustment(complexity, stats);

  // Enhanced visualization data with multi-dimensional analysis
  const visualData = {
    runLengths: binary.match(/([01])\1*/g)?.map(run => run.length) || [],
    patternDensity: calculatePatternDensity(binary),
    transitions: calculateTransitions(binary),
    slidingWindowAnalysis: windowSizes.map(size => ({
      windowSize: size,
      density: Array.from({ length: Math.floor(binary.length / size) }, (_, i) => 
        binary.substr(i * size, size).split('1').length - 1 / size
      )
    }))
  };

  // Pattern similarity analysis
  const patternSimilarity = {
    selfSimilarity: calculateCorrelation(binary),
    symmetry: calculateSymmetry(binary),
    periodicityScore: detectPeriodicity(binary)
  };

  if (cleanBinary.match(/^1+$/)) return createResult('infinite', { patternStats: stats, visualData, patternSimilarity });
  if (cleanBinary.match(/^0+$/)) return createResult('zero', { patternStats: stats, visualData, patternSimilarity });

  return createResult('normal', {
    patternStats: stats,
    complexity,
    visualData,
    patternSimilarity,
    X_ratio: (cleanBinary.match(/1/g)?.length || 0) / cleanBinary.length * adjustment,
    Y_ratio: (cleanBinary.match(/0/g)?.length || 0) / cleanBinary.length * adjustment
  });
}

// New helper functions for enhanced analysis
function calculateSymmetry(binary) {
  const mid = Math.floor(binary.length / 2);
  const firstHalf = binary.slice(0, mid);
  const secondHalf = binary.slice(-mid).split('').reverse().join('');
  return firstHalf.split('').reduce((acc, char, i) => 
    acc + (char === secondHalf[i] ? 1 : 0), 0) / mid;
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
  return Math.std(runs.map(r => r.length)) || 0;
}

function calculateCorrelation(binary) {
  const arr = binary.split('').map(Number);
  return arr.slice(1).reduce((acc, val, i) => acc + (val * arr[i]), 0) / (binary.length - 1);
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
  return binary.replace(/[^01]/g, '');
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
Math.std = function(arr) {
  const mean = arr.reduce((a, b) => a + b) / arr.length;
  return Math.sqrt(arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length);
};

// Run test cases
[
  // Ultra-complex quantum-inspired pattern with multiple transcendental functions
  Array(16384).fill(0).map((_, i) => {
    const quantum = Math.sin(i * Math.PI * Math.E) * Math.cos(i * Math.sqrt(7)) *
                   Math.tan(i / Math.LOG2E) * Math.sinh(i / 1000) *
                   Math.pow(Math.abs(Math.cos(i * Math.sqrt(11))), 3) *
                   Math.tanh(i * Math.SQRT1_2) + Math.cosh(i / 500);
    return (quantum * Math.log(i + 1) + Math.sin(i * Math.PI / 180)) > 0 ? '1' : '0';
  }).join('') + '10'.repeat(512) + '01'.repeat(256) + '1',

  // Hyper-dimensional fractal-chaos pattern with golden ratio interactions
  Array(12288).fill(0).map((_, i) => {
    const phi = (1 + Math.sqrt(5)) / 2;
    const chaos = Math.sin(i * phi) * Math.cos(i * Math.sqrt(13)) *
                 Math.tan(i / 7) * Math.sinh(i / 273) *
                 Math.pow(Math.abs(Math.sin(i * Math.sqrt(17))), 2) *
                 Math.log10(i + phi) * Math.exp(-i/2048);
    return ((chaos + Math.cos(i * Math.PI / 90)) % 1) > 0.4 ? '1' : '0';
  }).join('') + '110'
].forEach(binary => {
  console.log(`\nTesting binary: ${binary.substring(0, 50)}...`);
  console.log(analyzeBinary(binary));
});

// Helper functions for enhanced analysis
function calculateEntropy(str) {
  const freq = {};
  str.split('').forEach(char => freq[char] = (freq[char] || 0) + 1);
  return Object.values(freq).reduce((entropy, count) => {
    const p = count / str.length;
    return entropy - (p * Math.log2(p));
  }, 0);
}

function calculateComplexity(str, stats) {
  return {
    level: stats.entropy * (1 + stats.longestRun / str.length),
    type: stats.alternating > 0.4 ? 'alternating' :
          stats.runs > 0.3 ? 'run-based' : 'mixed'
  };
}

function calculateAdjustment(complexity, stats) {
  return 1 + (complexity.level * 0.1) *
         (stats.entropy > 0.9 ? 1.2 : 1);
}

function createResult(type, data) {
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

// Test cases
const testCases = [
  // Hyper-dimensional quantum chaos with nested non-linear dynamics
  Array(8192).fill(0).map((_, i) => {
    const quantum = Math.sin(i * Math.PI * Math.sqrt(13)) * 
                   Math.cos(i * Math.E * Math.sqrt(17)) * 
                   Math.tan(i * Math.SQRT2 * Math.log10(i + 1)) *
                   Math.sinh(i / 273) * Math.cosh(i / 377) *
                   Math.pow(Math.abs(Math.atan(i * Math.sqrt(19))), 3) *
                   Math.sin(Math.sqrt(i)) * Math.cos(Math.cbrt(i)) *
                   Math.tan(Math.log(i + 1)) * Math.exp(-i/10000);
    return (quantum * Math.log2(i + 2) * Math.tanh(i/1000) + 0.5) > 0.5 ? '1' : '0';
  }).join('') + '10110'.repeat(100),

  // Multi-dimensional fractal-chaos with advanced harmonic interactions
  Array(16384).fill(0).map((_, i) => {
    const phi = (1 + Math.sqrt(5)) / 2;
    const chaos = Math.sin(i * phi * Math.sqrt(23)) *
                 Math.cos(i * Math.sqrt(29) * Math.E) *
                 Math.tan(i / (7 * phi)) *
                 Math.sinh(i / (273 * Math.SQRT2)) *
                 Math.pow(Math.abs(Math.sin(i * Math.sqrt(31))), 4) *
                 Math.log10(i + phi) * Math.exp(-i/4096) *
                 Math.tanh(Math.sqrt(i)) * Math.atan2(i, phi) *
                 Math.pow(Math.sin(i/1000), 2);
    return ((chaos + 1.5) % 2) > 0.8 ? '1' : '0';
  }).join('') + '01101'.repeat(100),

  // Quantum-prime pattern with advanced transcendental modulation
  Array(12288).fill(0).map((_, i) => {
    const fibMod = fibonacci(i % 150) % 23;
    const primeInfluence = isPrime(i * fibMod + 5) ? 
                          Math.sin(i * Math.sqrt(37)) : 
                          Math.cos(i * Math.sqrt(41));
    const quantum = Math.sinh(i / 500) * Math.cosh(i / 700) *
                   Math.tanh(i / 900) * Math.atan(i * Math.sqrt(37)) *
                   Math.pow(Math.abs(Math.sin(i * Math.sqrt(41))), 2) *
                   Math.log1p(Math.abs(Math.tan(i/1000))) *
                   Math.exp(-Math.abs(Math.sin(i/500)));
    return ((quantum * primeInfluence * fibMod + 2) % 3) > 1.2 ? '1' : '0';
  }).join('') + '11010'.repeat(100),

  // Complex modular cascade with non-linear feedback
  Array(10240).fill(0).map((_, i) => {
    const modular = (i * 15731 + 789221) % 2311;
    const cascade = Math.sin(i * Math.PI * Math.sqrt(43)) *
                   Math.cos(i * Math.E * Math.sqrt(47)) *
                   Math.tan(i / (11 * Math.SQRT2)) *
                   Math.pow(Math.abs(Math.sinh(i/800)), 3) *
                   Math.log2(i + 3) * Math.exp(-i/8192) *
                   Math.asinh(Math.cos(i/300)) *
                   Math.tanh(Math.sin(i/700));
    return ((modular * cascade + 3) % 4) > 1.8 ? '1' : '0';
  }).join('') + '10101'.repeat(100)
];

// Helper functions
function fibonacci(n) {
  let a = 1, b = 0, temp;
  while (n >= 0) {
    temp = a;
    a = a + b;
    b = temp;
    n--;
  }
  return b;
}

function isPrime(num) {
  for(let i = 2; i <= Math.sqrt(num); i++)
    if(num % i === 0) return false;
  return num > 1;
}

testCases.forEach(binary => {
  console.log(`\nTesting binary: ${binary}`);
  const result = analyzeBinary(binary);
  console.log(result);
  console.log(JSON.stringify(result.hierarchicalPatterns, null, 2));
  try {
    const summary = updateModelData(binary, result);
    console.log('Model updated:', summary);
  } catch (error) {
    console.error('Error updating model:', error);
  }
});

// Function to manage model output and storage
function updateModelData(binary, analysisResult) {
  const baseModelPath = './models';
  const normalizedPath = 'patterns'; // Standard folder name
  const modelPath = `${baseModelPath}/${normalizedPath}`;

  const modelData = {
    id: generateUniqueId(binary, analysisResult),
    timestamp: Date.now(),
    pattern_type: analysisResult.pattern_complexity?.type || 'unknown',
    metrics: {
      entropy: analysisResult.pattern_metrics.entropy,
      complexity: analysisResult.pattern_complexity?.level || 0,
      burstiness: analysisResult.pattern_metrics.burstiness
    },
    summary: `Pattern analyzed: ${analysisResult.pattern_complexity?.type} with entropy ${analysisResult.pattern_metrics.entropy.toFixed(4)}`
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
    existingData = JSON.parse(fs.readFileSync(modelFile, 'utf8'));
    // Remove duplicates based on id
    existingData = existingData.filter(item => item.id !== modelData.id);
  } catch (e) { /* Handle first run */ }

  existingData.push(modelData);

  // Keep only latest 1000 entries and sort by timestamp
  existingData = existingData
    .slice(-1000)
    .sort((a, b) => b.timestamp - a.timestamp);

  fs.writeFileSync(modelFile, JSON.stringify(existingData, null, 2));
  return modelData.summary;
}

function generateUniqueId(binary, result) {
  return require('crypto')
    .createHash('md5')
    .update(`${result.pattern_metrics.entropy}-${result.pattern_complexity?.type}-${binary.slice(0, 100)}`)
    .digest('hex');
}

function cleanupModelFolders(basePath, normalizedName) {
  if (!fs.existsSync(basePath)) return;

  const items = fs.readdirSync(basePath);
  items.forEach(item => {
    const fullPath = `${basePath}/${item}`;
    if (fs.statSync(fullPath).isDirectory() &&
        item.toLowerCase().includes('pattern') &&
        item !== normalizedName) {
      // Move contents to normalized folder if exists
      if (fs.existsSync(`${fullPath}/model.json`)) {
        const normalizedFolder = `${basePath}/${normalizedName}`;
        if (!fs.existsSync(normalizedFolder)) {
          fs.mkdirSync(normalizedFolder, { recursive: true });
        }
        fs.renameSync(`${fullPath}/model.json`, `${normalizedFolder}/model.json.tmp`);
        mergeJsonFiles(`${normalizedFolder}/model.json`, `${normalizedFolder}/model.json.tmp`);
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
    if (fs.existsSync(target)) targetData = JSON.parse(fs.readFileSync(target, 'utf8'));
    if (fs.existsSync(source)) sourceData = JSON.parse(fs.readFileSync(source, 'utf8'));

    // Combine and remove duplicates
    const combined = [...targetData, ...sourceData]
      .filter((item, index, self) =>
        index === self.findIndex(t => t.id === item.id))
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 1000);

    fs.writeFileSync(target, JSON.stringify(combined, null, 2));
  } catch (e) {
    console.error('Error merging files:', e);
  }
}

testCases.forEach(binary => {
  console.log(`\nTesting binary: ${binary.length > 20 ? '[truncated for brevity]' : binary}`);
  const result = analyzeBinary(binary);
  console.log(result);
  console.log(JSON.stringify(result.hierarchicalPatterns, null, 2));
  try {
    const summary = updateModelData(binary, result);
    console.log('Model updated:', summary);
  } catch (error) {
    console.error('Error updating model:', error);
  }
});

