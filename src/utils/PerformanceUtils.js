const performanceData = {
  totalAnalysisTime: 0,
  averageConfidence: 0,
  testsCompleted: 0,
  startTime: Date.now(),
};

function reportPerformance() {
  const totalTime = (Date.now() - performanceData.startTime) / 1000;
  const avgAnalysisTime =
    performanceData.totalAnalysisTime /
    Math.max(1, performanceData.testsCompleted);
  const avgConfidence = Math.min(
    100,
    performanceData.averageConfidence * 100
  );

  console.log("\n🎯 Performance Report");
  console.log("════════════════════════════════════════");
  console.log(`Total Runtime: ${totalTime.toFixed(2)}s`);
  console.log(`Tests Completed: ${performanceData.testsCompleted}`);
  console.log(`Average Analysis Time: ${avgAnalysisTime.toFixed(2)}ms`);
  console.log(
    `Average Confidence: ${(performanceData.averageConfidence * 100).toFixed(
      1
    )}%`
  );
}

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

const monitoredAnalyzeBinary = monitorPerformance(analyzeBinary);
const monitoredImproveConfidence = monitorPerformance(improveConfidenceLevel);

module.exports = {
  monitorPerformance,
  monitoredAnalyzeBinary,
  monitoredImproveConfidence,
  reportPerformance,
  performanceData,
};