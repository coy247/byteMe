class AsyncPatternQueue {
    constructor(options = {}) {
        this.timeout = options.timeout || 5000;
        this.retries = options.retries || 3;
        this.queue = [];
        this.results = [];
        this.processing = false;
    }

    async addPattern(pattern) {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await this.processWithTimeout(pattern);
                this.results.push(result);
                resolve(result);
            } catch (error) {
                if (error.name === 'TimeoutError') {
                    console.warn(`Pattern processing timeout: ${pattern.slice(0, 10)}...`);
                    resolve({ timeout: true });
                } else {
                    reject(error);
                }
            }
        });
    }

    async processWithTimeout(pattern) {
        return Promise.race([
            this.analyzePattern(pattern),
            new Promise((_, reject) => 
                setTimeout(() => reject(new TimeoutError()), this.timeout)
            )
        ]);
    }

    async analyzePattern(pattern, attempt = 1) {
        try {
            const detector = new PatternDetector(pattern);
            return await detector.detect();
        } catch (error) {
            if (attempt < this.retries) {
                await new Promise(resolve => setTimeout(resolve, 100 * attempt));
                return this.analyzePattern(pattern, attempt + 1);
            }
            throw error;
        }
    }

    getResults() {
        return this.results;
    }
}

class TimeoutError extends Error {
    constructor() {
        super('Pattern analysis timeout');
        this.name = 'TimeoutError';
    }
}

module.exports = AsyncPatternQueue;