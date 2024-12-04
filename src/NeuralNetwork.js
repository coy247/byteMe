const brain = require("brain.js");
const fs = require("fs");
const path = require("path");

class PatternNetwork {
  constructor() {
    this.net = new brain.NeuralNetwork({
      hiddenLayers: [32, 16],
      activation: "sigmoid",
    });
  }

  async train(patterns) {
    return this.net.train(patterns.map(p => ({
      input: this.preprocess(p.data),
      output: this.vectorize(p.type)
    })));
  }

  preprocess(binary) {
    return Array.from(binary).map(Number);
  }

  vectorize(type) {
    return {
      alternating: type === 'alternating' ? 1 : 0,
      periodic: type === 'periodic' ? 1 : 0,
      random: type === 'random' ? 1 : 0,
      mixed: type === 'mixed' ? 1 : 0
    };
  }

  predict(binary) {
    return this.net.run(this.preprocess(binary));
  }
}

module.exports = PatternNetwork;
