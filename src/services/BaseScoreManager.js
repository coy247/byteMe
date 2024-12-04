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
