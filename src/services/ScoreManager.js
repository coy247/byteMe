const fs = require('fs').promises;
const path = require('path');

class ScoreManager {
    constructor() {
        this.SCORE_PATH = path.join(__dirname, '../../data/scores.json');
        this.MIN_SCORE = 0.00000001;
        this.MULTIPLIERS = {
            pattern: 1.5,
            complexity: 2.0,
            performance: 1.2
        };
        this.scores = {
            positive: 0,
            negative: 0,
            history: [],
            metrics: {
                avgScore: 0,
                totalPatterns: 0
            }
        };
    }

    async updateScore(analysis) {
        try {
            const scores = await this.loadScores();
            const scoreChange = this.calculateScore(analysis);
            
            const entry = {
                timestamp: Date.now(),
                pattern: analysis.pattern_type,
                score: Math.max(scoreChange, this.MIN_SCORE),
                metrics: analysis.metrics
            };

            scores.history.push(entry);
            scores.totalScore = Math.max(
                (scores.totalScore || 0) + scoreChange,
                this.MIN_SCORE
            );
            
            scores.avgScore = this.calculateAverageScore(scores.history);
            await this.saveScores(scores);
            
            return scores;
        } catch (error) {
            console.error('Error updating scores:', error);
            throw error;
        }
    }

    async loadScores() {
        try {
            const data = await fs.readFile(this.SCORE_PATH, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error loading scores:', error);
            return this.scores;
        }
    }

    async saveScores(scores) {
        try {
            const data = JSON.stringify(scores, null, 2);
            await fs.writeFile(this.SCORE_PATH, data, 'utf8');
        } catch (error) {
            console.error('Error saving scores:', error);
        }
    }

    calculateScore(analysis) {
        const baseScore = analysis.metrics.complexity * this.MULTIPLIERS.complexity;
        const patternBonus = this.getPatternBonus(analysis.pattern_type);
        return Math.max(baseScore * patternBonus, this.MIN_SCORE);
    }

    calculateAverageScore(history) {
        const totalScore = history.reduce((acc, entry) => acc + entry.score, 0);
        return totalScore / history.length;
    }

    getPatternBonus(pattern) {
        const bonuses = {
            alternating: 1.2,
            periodic: 1.5,
            random: 1.8,
            complex: 2.0
        };
        return bonuses[pattern.type] || 1.0;
    }
}

module.exports = ScoreManager;