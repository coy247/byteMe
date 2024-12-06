class CommandParser {
  constructor(argv) {
    this.argv = argv;
  }

  isTestMode() {
    return this.argv.includes('--test');
  }

  getBinaryInput() {
    return this.argv[2];
  }
}