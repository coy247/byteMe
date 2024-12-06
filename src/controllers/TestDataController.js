const { analyzeBinary } = require("../utils/PatternUtils");
const { colorizeJson } = require("../utils/ColorUtils");
const mainController = require("./MainController");

async function handleTestData() {
  const testBinaries = ["1010101010", "11110000", "10011001"];
  for (const binary of testBinaries) {
    console.log(`\nTesting binary: ${binary}`);
    const result = await mainController.analyze(binary);
    console.log(colorizeJson(result));
    if (result.visualData?.slidingWindowAnalysis) {
      console.log(JSON.stringify(result.visualData.slidingWindowAnalysis, null, 2));
    }
    try {
      console.log('Model updated:', result);
    } catch (error) {
      console.error('Error updating model:', error);
    }
  }
}

module.exports = {
  handleTestData,
};