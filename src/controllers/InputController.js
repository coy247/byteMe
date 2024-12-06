const readline = require("readline");
const { convertToBinary, revertFromBinary } = require("../utils/PatternUtils");
const mainController = require("./MainController");

async function handleUserInput(input) {
  const binary = convertToBinary(input);
  const analysisResult = await mainController.analyze(binary);
  analysisResult.originalInput = revertFromBinary(binary, input);
  visualizationController.visualize(analysisResult);
  promptToSave(analysisResult, input);
}

function promptToSave(result, input) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Do you want to save the result to a file? (yes/no): ', (answer) => {
    if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
      writeResultToFile(result, input);
    } else {
      console.log('Result not saved to file.');
    }
    rl.close();
  });

  // Set a timeout to automatically proceed with "no" if no input is provided
  setTimeout(() => {
    rl.write(null, { ctrl: true, name: 'u' }); // Clear the input
    rl.write('no\n'); // Simulate "no" input
  }, 10000); // 10 seconds timeout
}

function writeResultToFile(result, input) {
  const outputDir = path.join(__dirname, '../output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  const filename = generateFilename(input);
  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(result, null, 2));
  console.log(`Result written to file: ${filepath}`);
}

module.exports = {
  handleUserInput,
  promptToSave,
  writeResultToFile,
};