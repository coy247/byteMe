const fs = require('fs').promises;
const path = require('path');

class ModelArchiveManager {
    constructor() {
        this.MODEL_PATH = path.join(__dirname, '../../data/model.json');
        this.BACKUP_PATH = path.join(__dirname, '../../data/model.backup.json');
        this.SIMILARITY_THRESHOLD = 0.99;
    }

    async saveAnalysis(analysis) {
        try {
            let model = await this.loadModel();
            if (!model) {
                model = this.createNewModel();
            }

            // Check for duplicates
            if (!this.isDuplicate(model.analyses, analysis)) {
                model.analyses.push(analysis);
                // Sort by complexity
                model.analyses.sort((a, b) => 
                    b.metrics.complexity - a.metrics.complexity
                );
                // Keep history but limit size
                if (model.analyses.length > 1000) {
                    model.analyses = model.analyses.slice(0, 1000);
                }
            }

            model.lastUpdated = Date.now();
            await this.writeModelSafely(model);
            return true;
        } catch (error) {
            console.error('Failed to save to archive:', error);
            throw error;
        }
    }

    isDuplicate(analyses, newAnalysis) {
        return analyses.some(existing => 
            existing.input === newAnalysis.input &&
            Math.abs(existing.metrics.complexity - newAnalysis.metrics.complexity) < 0.001 &&
            existing.pattern_type.type === newAnalysis.pattern_type.type
        );
    }

    createNewModel() {
        return {
            version: "1.0",
            created: Date.now(),
            lastUpdated: Date.now(),
            analyses: []
        };
    }

    async writeModelSafely(model) {
        const tempPath = `${this.MODEL_PATH}.tmp`;
        await fs.writeFile(tempPath, JSON.stringify(model, null, 2));
        await fs.rename(tempPath, this.MODEL_PATH);
    }

    async loadModel() {
        try {
            const data = await fs.readFile(this.MODEL_PATH, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            return null;
        }
    }
}

module.exports = ModelArchiveManager;