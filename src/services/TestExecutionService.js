class TestExecutionService {
  constructor(analysisController, confidenceModel, dialogueService, userInteractionService) {
    this.analysisController = analysisController;
    this.confidenceModel = confidenceModel;
    this.dialogueService = dialogueService;
    this.userInteractionService = userInteractionService;
  }

  async runTestCaseAnalysis(testCases) {
    console.log("\n" + "🎪".repeat(30));
    console.log(this.dialogueService.getFunMessage("info"));
    console.log("🎪".repeat(30) + "\n");

    for (let i = 0; i < testCases.length; i++) {
      const binary = testCases[i];
      const progress = {
        current: i + 1,
        total: testCases.length,
      };
      console.log(this.dialogueService.getFunMessage("info"));
      const result = await this.analysisController.analyzeBinary(binary);
      const improvement = await this.confidenceModel.improveConfidenceLevel(binary);

      if (improvement.confidence > 0.8) {
        console.log(this.dialogueService.getFunMessage("success"));
      } else if (improvement.confidence > 0.5) {
        console.log(this.dialogueService.getFunMessage("improvement"));
      }

      this.formatAnalysisResult(binary, result);
    }
    console.log("\n✨ Analysis Complete ✨\n");
  }

  async runEnhancedTests() {
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
      const result = await this.analysisController.analyzeBinary(binary);
      const improvement = await this.confidenceModel.improveConfidenceLevel(binary, 0.95, 25); // Reduced initial iterations

      if (improvement.confidence < 0.8) {
        const continueAnalysis = await this.userInteractionService.askToContinue(improvement.confidence, improvement.iterations);
        if (!continueAnalysis) {
          console.log("Analysis stopped by user. Thanks for playing! 👋");
          break;
        }
      }

      console.log(`\n[Test ${i + 1}/${allTestCases.length}] ${improvement.confidence > 0.8 ? "🎯" : "🎪"}`);
      this.formatAnalysisResult(binary, result);
    }
    console.log("\n✨ Analysis Complete ✨\n");
  }

  formatAnalysisResult(binary, result) {
    // Implementation for formatting analysis result
  }
}

module.exports = TestExecutionService;