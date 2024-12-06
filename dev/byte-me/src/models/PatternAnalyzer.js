class PatternAnalyzer {
    constructor(data) {
        this.data = data;
    }

    identifyPatterns(size) {
        const patterns = {};
        for (let i = 0; i <= this.data.length - size; i++) {
            const pattern = this.data.substring(i, i + size);
            patterns[pattern] = (patterns[pattern] || 0) + 1;
        }
        return patterns;
    }

    countUniquePatterns(size) {
        const patterns = this.identifyPatterns(size);
        return Object.keys(patterns).length;
    }

    mostCommonPattern(size) {
        const patterns = this.identifyPatterns(size);
        return Object.entries(patterns).reduce((a, b) => (b[1] > a[1] ? b : a), [null, 0]);
    }
}

module.exports = PatternAnalyzer;