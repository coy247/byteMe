// src/utils/PatternUtils.js
function validateBlockStructure(binary) {
  const blockSize = 8;
  const blocks = [];
  for (let i = 0; i < binary.length; i += blockSize) {
    blocks.push(binary.slice(i, i + blockSize));
  }
  return {
    valid: blocks.every(
      (block) =>
        block.length === blockSize || block.length === binary.length % blockSize
    ),
    errors: blocks.filter(
      (block) =>
        block.length !== blockSize && block.length !== binary.length % blockSize
    ).length,
  };
}
function slidingWindowAnalysis(binary) {
  const windowSizes = [2, 4, 8, 16];
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
function calculateSimpleChecksum(binary) {
  return binary.split("").reduce((sum, bit) => sum + parseInt(bit, 2), 0);
}
function calculateCRC32(binary) {
  let crc = 0xffffffff;
  for (let i = 0; i < binary.length; i++) {
    crc = crc ^ binary.charCodeAt(i);
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return ~crc >>> 0;
}
function calculateEntropy(str) {
  const freq = [...str].reduce((f, c) => ({ ...f, [c]: (f[c] || 0) + 1 }), {});
  return Object.values(freq).reduce(
    (e, c) => e - (c / str.length) * Math.log2(c / str.length),
    0
  );
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
  return binary.replace(/[^01]/g, "");
}
function convertToBinary(input) {
  if (/^[01]+$/.test(input)) {
    return input;
  }
  return input
    .split("")
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
    .join("");
}
function revertFromBinary(binary, originalInput) {
  if (/^[01]+$/.test(originalInput)) {
    return binary;
  }
  return binary
    .match(/.{1,8}/g)
    .map((byte) => String.fromCharCode(parseInt(byte, 2)))
    .join("");
}
const performanceWizard = {
  startTime: null,
  totalAnalysisTime: 0,
  testsCompleted: 0,
  averageConfidence: 0,
  start() {
    this.startTime = Date.now();
    this.totalAnalysisTime = 0;
    this.testsCompleted = 0;
    this.averageConfidence = 0;
  },
  trackAnalysis(time, confidence) {
    this.totalAnalysisTime += time;
    this.testsCompleted += 1;
    this.averageConfidence =
      (this.averageConfidence * (this.testsCompleted - 1) + confidence) /
      this.testsCompleted;
  },
};
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
  performanceWizard,
  reportPerformance,
};
