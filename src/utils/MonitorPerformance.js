const performanceData = {
  totalAnalysisTime: 0,
  averageConfidence: 0,
  testsCompleted: 0,
  startTime: Date.now(),
};

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