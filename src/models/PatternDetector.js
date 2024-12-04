class PatternDetector {
    constructor(binary) {
        this.binary = binary;
        this.confidence = 0;
        this.patterns = {
            alternating: { score: 0, possible: true },
            periodic: { score: 0, possible: true },
            random: { score: 0, possible: true },
            complex: { score: 0, possible: true },
            nested: { score: 0, possible: true }
        };
    }

    detect() {
        this.checkAlternating();
        this.checkPeriodic();
        this.checkRandom();
        this.checkComplex();
        this.checkNested();
        return this.getHighestScoringPattern();
    }

    getHighestScoringPattern() {
        return Object.entries(this.patterns)
            .reduce((highest, [pattern, data]) => {
                return data.score > highest.score ? 
                    { type: pattern, score: data.score } : highest;
            }, { type: 'unknown', score: 0 });
    }

    checkAlternating() {
        let score = 0;
        for (let i = 1; i < this.binary.length; i++) {
            if (this.binary[i] !== this.binary[i - 1]) score++;
        }
        this.patterns.alternating.score = score / this.binary.length;
    }

    checkPeriodic() {
        let score = 0;
        for (let i = 2; i < this.binary.length; i++) {
            if (this.binary[i] === this.binary[i - 2]) score++;
        }
        this.patterns.periodic.score = score / this.binary.length;
    }

    checkRandom() {
        let transitions = 0;
        for (let i = 1; i < this.binary.length; i++) {
            if (this.binary[i] !== this.binary[i - 1]) transitions++;
        }
        this.patterns.random.score = Math.abs(0.5 - transitions / this.binary.length);
    }

    checkComplex() {
        this.patterns.complex.score = 0;
    }

    checkNested() {
        this.patterns.nested.score = 0;
    }
}

module.exports = PatternDetector;
