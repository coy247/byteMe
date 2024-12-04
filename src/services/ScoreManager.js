class BaseScoreManager {
  constructor() {
    this.scores = {
      current: 0,
      history: [],
      penalties: [],
    };
  }
  updateScore(points, reason) {
    this.scores.current += points;
    this.scores.history.push({
      points,
      reason,
      timestamp: Date.now(),
    });
  }
}
module.exports = BaseScoreManager;
class AdvancedScoreManager extends BaseScoreManager {
  constructor() {
    super();
    this.REWARDS = {
      STABILITY: 0.1,
      EFFICIENCY: 0.2,
      COMPLEXITY: 0.3,
    };
  }
}
module.exports = AdvancedScoreManager;
