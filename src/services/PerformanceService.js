const { EventEmitter } = require('events');

class PerformanceService extends EventEmitter {
  constructor() {
    super();
    this.totalAnalysisTime = 0;
    this.testsCompleted = 0;
    this.averageConfidence = 0;
    this.startTime = null;
  }

  start() {
    this.startTime = Date.now();
    this.emit('start');
  }

  monitorFunction(fn, name) {
    return async (...args) => {
      const start = process.hrtime();
      const result = await fn.apply(this, args);
      const [seconds, nanoseconds] = process.hrtime(start);
      const timeInMs = seconds * 1000 + nanoseconds / 1000000;
      
      this.trackAnalysis(timeInMs, result?.confidence || 0);
      this.emit('functionComplete', { name, timeInMs, result });
      
      return result;
    };
  }

  trackAnalysis(timeInMs, confidence) {
    this.totalAnalysisTime += timeInMs;
    this.testsCompleted++;
    this.averageConfidence = 
      (this.averageConfidence * (this.testsCompleted - 1) + confidence) / 
      this.testsCompleted;
  }

  generateReport() {
    const totalTime = (Date.now() - this.startTime) / 1000;
    const avgAnalysisTime = this.totalAnalysisTime / Math.max(1, this.testsCompleted);
    
    return {
      totalRuntime: totalTime.toFixed(2),
      testsCompleted: this.testsCompleted,
      averageAnalysisTime: avgAnalysisTime.toFixed(2),
      averageConfidence: (this.averageConfidence * 100).toFixed(1)
    };
  }

  shutdown() {
    this.emit('shutdown', this.generateReport());
  }
}

module.exports = PerformanceService;