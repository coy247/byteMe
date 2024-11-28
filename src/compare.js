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



// Prediction function based on pattern analysis
function predictNextBits(binary, length = 8) {
  const lastBits = binary.slice(-32);
  // Initialize prediction array
  let prediction = [];
  // Use pattern complexity to determine prediction strategy
  if (result.pattern_complexity?.type === "alternating") {
    // For alternating patterns, continue the alternation
    const lastBit = lastBits.slice(-1);
    for (let i = 0; i < length; i++) {
      prediction.push(lastBit === "0" ? "1" : "0");
  } else if (result.pattern_complexity?.type === "run-based") {
    // For run-based patterns, analyze run length and continue
    const currentRun = lastBits.match(/([01])\1*$/)[0];
    const runLength = currentRun.length;
    const runChar = currentRun[0];
    // Predict based on average run length
    if (runLength >= result.pattern_metrics.longestRun / 2) {
      prediction = Array(length).fill(runChar === "0" ? "1" : "0");
      prediction = Array(length).fill(runChar);
    // For mixed patterns, use sliding window matching
    const window = lastBits.slice(-8);
    const matches = [];
    // Find similar patterns in history
    for (let i = 0; i < binary.length - 8; i++) {
      if (binary.substr(i, 8) === window) {
        matches.push(binary.substr(i + 8, length));
    // Use most common following pattern or fallback to probability
    if (matches.length > 0) {
      const mostCommon = matches.reduce((a, b) =>
        matches.filter((v) => v === a).length >=
        matches.filter((v) => v === b).length
          ? a
          : b
      prediction = mostCommon.split("");
      // Fallback to probability-based prediction
      const onesProbability = result.X_ratio || 0.5;
      for (let i = 0; i < length; i++) {
        prediction.push(Math.random() < onesProbability ? "1" : "0");
  return prediction.join("");
// Example usage of prediction
  console.log("\nPattern Analysis and Prediction");
  formatAnalysisResult(binary, analyzeBinary(binary));
  const predicted = predictNextBits(binary);
  console.log(`Next 8 bits prediction: ${predicted}`);
// Enhanced collective pattern analysis and prediction system
function analyzeAndPredictPatterns(binary, predictionLength = 8) {
  const predictions = {
    statistical: predictNextBits(binary, predictionLength),
    pattern: generatePatternBasedPrediction(binary, result, predictionLength),
    composite: generateCompositePrediction(binary, result, predictionLength),
  console.log("\n" + "╔" + "═".repeat(58) + "╗");
    "║" + " ".repeat(20) + "Pattern Intelligence Report" + " ".repeat(11) + "║"
  // Core Pattern Analysis
  const entropyStars = "★".repeat(
  const entropyValue = result?.pattern_metrics?.entropy?.toFixed(3) || "0.000";
    `║ Entropy Rating: ${entropyStars.padEnd(5, "☆")} (${entropyValue})`.padEnd(
      59
    ) + "║"
    `║ Pattern Type: ${result.pattern_complexity?.type || "unknown"}`.padEnd(
  // Pattern Predictions
  console.log("╟" + "─".repeat(58) + "╢");
  console.log("║ Prediction Analysis:".padEnd(59) + "║");
  console.log(`║ • Statistical: ${predictions.statistical}`.padEnd(59) + "║");
  console.log(`║ • Pattern-based: ${predictions.pattern}`.padEnd(59) + "║");
  console.log(`║ • Composite: ${predictions.composite}`.padEnd(59) + "║");
  // Confidence Metrics
    `║ Confidence Level: ${getConfidenceStars(confidence)}`.padEnd(59) + "║"
  // Pattern Insights
  console.log("║ Key Insights:".padEnd(59) + "║");
  generatePatternInsights(result).forEach((insight) => {
    console.log(`║ • ${insight}`.padEnd(59) + "║");
  return predictions;
function generatePatternBasedPrediction(binary, result, length) {
  const patternType = result.pattern_complexity?.type;
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
      return Array(length)
        .fill(0)
        .map(() => (Math.random() > result.X_ratio ? "0" : "1"))
        .join("");

        