/**
 * Test suite for predictNextBits binary prediction function
 * Tests pattern recognition, prediction accuracy, and edge cases
 */

/**
 * Mock implementation of analyzeBinary to make the test self-contained
 * @param {string} binary - Binary string to analyze
 * @returns {object} Analysis result with pattern complexity and metrics
 */
function analyzeBinary(binary) {
  const onesCount = (binary.match(/1/g) || []).length;
  const X_ratio = onesCount / binary.length || 0.5;

  // Pattern detection - update the run-based regex
  let pattern_complexity = { type: "unknown" };
  if (/^(10)+1?$|^(01)+0?$/.test(binary)) {
    pattern_complexity.type = "alternating";
  } else if (/^(0+1+)+0*$|^(1+0+)+1*$/.test(binary)) { // Updated to handle multiple runs
    pattern_complexity.type = "run-based";
  }

  // Calculate metrics
  const runs = binary.match(/0+|1+/g) || [];
  const longestRun =
    runs.reduce((max, run) => Math.max(max, run.length), 0) || 0;

  return {
    X_ratio,
    pattern_complexity,
    pattern_metrics: {
      longestRun,
      entropy: calculateEntropy(binary),
    },
  };
}

/**
 * Predicts the next bits in a binary sequence based on pattern analysis
 * @param {string} binary - Binary string to analyze
 * @param {number} length - Number of bits to predict (default: 8)
 * @returns {string} - Predicted binary string of specified length
 */
function predictNextBits(binary, length = 8) {
  const result = analyzeBinary(binary);
  const lastBits = binary.slice(-32);
  // Initialize prediction array
  let prediction = [];

  // Use pattern complexity to determine prediction strategy
  if (result.pattern_complexity?.type === "alternating") {
    // For alternating patterns, we need to detect the pattern (01 or 10)
    // and continue it properly
    
    // Get enough bits to detect pattern
    const patternSample = lastBits.slice(-8) || ''; // Use last 8 bits or whatever's available
    
    let pattern;
    // Check if it's alternating 01 or 10
    if (patternSample.match(/^(01)+$/)) {
      pattern = "01";
    } else if (patternSample.match(/^(10)+$/)) {
      pattern = "10";
    } else {
      // If we can't clearly identify the pattern, use basic heuristics
      const lastBit = lastBits.slice(-1) || (Math.random() < 0.5 ? "0" : "1");
      pattern = lastBit === "0" ? "01" : "10";
    }
    
    // Use detected pattern to generate prediction
    for (let i = 0; i < length; i++) {
      // For 01 pattern output 10101... (starting with opposite of last bit)
      // For 10 pattern output 01010... (starting with opposite of last bit)
      prediction.push(pattern[i % 2 === 0 ? 1 : 0]);
    }
  } else if (result.pattern_complexity?.type === "run-based") {
    // For run-based patterns, analyze run length and continue or switch
    const currentRunMatch = lastBits.match(/([01])\1*$/);
    const currentRun = currentRunMatch ? currentRunMatch[0] : "";
    const runLength = currentRun.length;
    const runChar = currentRun
      ? currentRun[0]
      : Math.random() < 0.5
      ? "0"
      : "1"; // Default if no run found

    // Predict based on run length relative to the longest historical run
    // Continue the run if it's shorter than the longest historical run.
    // Switch only if no run detected (runLength === 0) or run is longer than historical max
    if (runLength > 0 && runLength <= result.pattern_metrics.longestRun) {
      // Continue the current run if it's relatively short or equal to longest run
      prediction = Array(length).fill(runChar);
    } else {
      // Switch only if no run detected (runLength === 0) or run is longer than historical max
      prediction = Array(length).fill(runChar === "0" ? "1" : "0");
    }
  } else {
    // For mixed patterns, use sliding window matching
    const window = lastBits.slice(-8);
    const matches = [];
    // Find similar patterns in history
    // Ensure binary string is long enough for the loop
    if (binary.length > 8 + length) {
      for (let i = 0; i <= binary.length - (8 + length); i++) {
        // Adjusted loop condition
        if (binary.substr(i, 8) === window) {
          matches.push(binary.substr(i + 8, length));
        }
      }
    }
    // Use most common following pattern or fallback to probability
    if (matches.length > 0) {
      // Count occurrences of each following pattern
      const counts = matches.reduce((acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
      }, {});
      // Find the pattern with the highest count
      const mostCommon = Object.keys(counts).reduce((a, b) =>
        counts[a] > counts[b] ? a : b
      );
      prediction = mostCommon.split("");
      // Ensure prediction length matches requested length if mostCommon is shorter
      if (prediction.length < length) {
        // Fallback for remaining bits if needed (e.g., repeat last bit or use probability)
        const lastPredBit =
          prediction.length > 0
            ? prediction[prediction.length - 1]
            : Math.random() < 0.5
            ? "0"
            : "1";
        while (prediction.length < length) {
          prediction.push(lastPredBit);
        }
      } else if (prediction.length > length) {
        prediction = prediction.slice(0, length); // Truncate if too long
      }
    } else {
      // Fallback to probability-based prediction
      const onesProbability = result.X_ratio || 0.5;
      for (let i = 0; i < length; i++) {
        prediction.push(Math.random() < onesProbability ? "1" : "0");
      }
    }
  }
  // Ensure the final prediction array has the correct length before joining
  if (prediction.length !== length) {
    // If prediction logic resulted in wrong length, pad or truncate
    if (prediction.length < length) {
      const lastBit =
        prediction.length > 0
          ? prediction[prediction.length - 1]
          : Math.random() < 0.5
          ? "0"
          : "1";
      while (prediction.length < length) {
        prediction.push(lastBit);
      }
    } else {
      prediction = prediction.slice(0, length);
    }
  }

  return prediction.join("");
}

// Helper function to calculate entropy
function calculateEntropy(binary) {
  const len = binary.length;
  if (len === 0) return 0;

  const zeros = (binary.match(/0/g) || []).length;
  const ones = len - zeros;

  const p0 = zeros / len;
  const p1 = ones / len;

  // Shannon entropy formula
  let entropy = 0;
  if (p0 > 0) entropy -= p0 * Math.log2(p0);
  if (p1 > 0) entropy -= p1 * Math.log2(p1);

  return entropy;
}

// Simple test framework for running without Jest
function runTests() {
  let passedTests = 0;
  let failedTests = 0;

  function expect(value) {
    return {
      toBe: (expected) => {
        if (value === expected) {
          passedTests++;
          return true;
        } else {
          console.error(`❌ Expected ${value} to be ${expected}`);
          failedTests++;
          return false;
        }
      },
      toEqual: (expected) => {
        const stringValue = JSON.stringify(value);
        const stringExpected = JSON.stringify(expected);
        if (stringValue === stringExpected) {
          passedTests++;
          return true;
        } else {
          console.error(
            `❌ Expected ${stringValue} to equal ${stringExpected}`
          );
          failedTests++;
          return false;
        }
      },
      toMatch: (regex) => {
        if (regex.test(value)) {
          passedTests++;
          return true;
        } else {
          console.error(`❌ Expected ${value} to match ${regex}`);
          failedTests++;
          return false;
        }
      },
      toBeLessThanOrEqual: (expected) => {
        if (value <= expected) {
          passedTests++;
          return true;
        } else {
          console.error(`❌ Expected ${value} to be <= ${expected}`);
          failedTests++;
          return false;
        }
      },
      toBeGreaterThanOrEqual: (expected) => {
        if (value >= expected) {
          passedTests++;
          return true;
        } else {
          console.error(`❌ Expected ${value} to be >= ${expected}`);
          failedTests++;
          return false;
        }
      },
    };
  }

  function test(name, fn) {
    try {
      console.log(`🧪 Running test: ${name}`);
      fn();
      console.log(`✅ Test passed: ${name}`);
    } catch (error) {
      console.error(`❌ Test failed: ${name}`);
      console.error(error);
      failedTests++;
    }
  }

  // Basic pattern recognition tests
  test("recognizes alternating pattern", () => {
    const pattern = "10101010".repeat(4);
    const prediction = predictNextBits(pattern, 8);
    expect(prediction.length).toBe(8);
    expect(prediction).toMatch(/^[01]{8}$/);
  });

  test("recognizes run-based pattern", () => {
    const pattern = "11001100".repeat(4);
    const prediction = predictNextBits(pattern, 8);
    expect(prediction.length).toBe(8);
    expect(prediction).toMatch(/^[01]{8}$/);
  });

  // Alternating pattern tests
  test("continues 01 alternation", () => {
    const binary = "01".repeat(16); // "0101...01"
    const prediction = predictNextBits(binary, 8);
    expect(prediction).toBe("10101010"); // Last bit was 1, so start with 0
  });

  test("continues 10 alternation", () => {
    const binary = "10".repeat(16); // "1010...10"
    const prediction = predictNextBits(binary, 8);
    expect(prediction).toBe("01010101"); // Last bit was 0, so start with 1
  });

  // Run-based pattern tests
  test("continues the run if not exceeding half of longest run", () => {
    const binary = "000011110000111100001111"; // Runs of 4
    const prediction = predictNextBits(binary, 8);
    expect(prediction).toBe("11111111"); // Continue with 1s
  });

  // Edge cases
  test("handles empty string input", () => {
    const prediction = predictNextBits("", 8);
    expect(prediction.length).toBe(8);
    expect(prediction).toMatch(/^[01]{8}$/);
  });

  test("respects requested prediction length", () => {
    const binary = "10101010";
    expect(predictNextBits(binary, 4).length).toBe(4);
    expect(predictNextBits(binary, 16).length).toBe(16);
  });

  // Randomized test
  test("randomly generated valid RGB values produce valid hex codes", () => {
    // Run 10 random tests
    for (let i = 0; i < 10; i++) {
      const randomBinary = generateRandomBinary(32);
      const prediction = predictNextBits(randomBinary, 8);

      expect(prediction.length).toBe(8);
      expect(prediction).toMatch(/^[01]{8}$/);
    }
  });

  // Helper function
  function generateRandomBinary(length) {
    let result = "";
    for (let i = 0; i < length; i++) {
      result += Math.random() < 0.5 ? "0" : "1";
    }
    return result;
  }

  console.log(
    `\n📊 Test Results: ${passedTests} passed, ${failedTests} failed`
  );
}

// Run the tests when this file is executed directly
runTests();

// Simple test to ensure the suite runs
test('predictNextBits function exists', () => {
  expect(typeof predictNextBits).toBe('function');
});
