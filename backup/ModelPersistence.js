const fs = require('fs').promises;
const path = require('path');

class ModelPersistence {
    constructor() {
        this.MODEL_PATH = path.join(__dirname, '../../data', 'model.json');
    }

    async saveAnalysis(analysis) {
        try {
            // Create directory if not exists
            await fs.mkdir(path.dirname(this.MODEL_PATH), { recursive: true });

            // Load existing or create new model
            let model;
            try {
                const data = await fs.readFile(this.MODEL_PATH, 'utf8');
                model = JSON.parse(data);
            } catch {
                model = {
                    version: "1.0",
                    lastUpdated: Date.now(),
                    analyses: []
                };
            }

            // Add analysis and update
            model.analyses.push(analysis);
            model.lastUpdated = Date.now();

            // Write atomically using temp file
            const tempPath = `${this.MODEL_PATH}.tmp`;
            await fs.writeFile(tempPath, JSON.stringify(model, null, 2));
            await fs.rename(tempPath, this.MODEL_PATH);

            return true;
        } catch (error) {
            console.error('Failed to save model:', error);
            throw error;
        }
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

module.exports = ModelPersistence;