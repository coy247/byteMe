const EventEmitter = require('events');

class ConfidenceModel extends EventEmitter {
  constructor(analysisController, dialogueService) {
    super();
    this.analysisController = analysisController;
    this.dialogueService = dialogueService;
  }

  async improveConfidenceLevel(binary, targetConfidence = 0.95, maxIterations = 100) {
    let currentConfidence = 0;
    let iteration = 0;
    let patterns = new Map();

    this.emit('start', { message: this.dialogueService.getUniqueMessage("startup") });

    while (currentConfidence < targetConfidence && iteration < maxIterations) {
      iteration++;
      const result = await this.analysisController.analyzeBinary(binary);
      const newConfidence = this.calculatePredictionConfidence(result);

      if (iteration % 25 === 0) {
        this.emit('progress', { 
          iteration,
          message: this.dialogueService.getUniqueMessage("progress")
        });
      }

      if (newConfidence > currentConfidence + 0.2) {
        this.emit('improvement', {
          confidence: newConfidence,
          message: this.dialogueService.getConfidenceMessage(newConfidence)
        });
      }

      currentConfidence = newConfidence;
    }

    this.emit('complete', { 
      message: this.dialogueService.getUniqueMessage("success")
    });

    return { confidence: currentConfidence, patterns, iterations: iteration };
  }

  calculatePredictionConfidence(result) {
    if (!result || !result.predictions || result.predictions.length === 0) {
      return 0;
    }

    // Find the highest probability prediction
    const maxProbability = Math.max(...result.predictions.map(p => p.probability));
    
    // Normalize confidence between 0 and 1
    const normalizedConfidence = Math.min(Math.max(maxProbability, 0), 1);
    
    return normalizedConfidence;
  }
}

module.exports = ConfidenceModel;