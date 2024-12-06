class TestRunner {
  constructor(testExecutionService) {
    this.testExecutionService = testExecutionService;
  }

  async runTests() {
    const testCases = [
      this.generateZigzagPattern(),
      this.generateFibonacciQuantum(),
      this.generatePrimeNeuralPattern(),
      this.generateHyperPattern()
    ];
    
    await this.testExecutionService.runTestCaseAnalysis(testCases);
  }
}