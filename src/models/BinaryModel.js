class BinaryModel {
  constructor() {
    this.validBinaryPattern = /^[01]+$/;
  }
  validate(input) {
    return this.validBinaryPattern.test(input);
  }
  sanitize(input) {
    return input.replace(/[^01]/g, "");
  }
  toDecimal(binary) {
    return parseInt(binary, 2);
  }
  toBinary(decimal) {
    return decimal.toString(2);
  }
  validateBlockStructure(binary) {
    const blockSize = 8;
    const blocks = [];
    for (let i = 0; i < binary.length; i += blockSize) {
      blocks.push(binary.slice(i, i + blockSize));
    }
    return {
      valid: blocks.every(
        (block) =>
          block.length === blockSize ||
          block.length === binary.length % blockSize
      ),
      errors: blocks.filter(
        (block) =>
          block.length !== blockSize &&
          block.length !== binary.length % blockSize
      ).length,
    };
  }
  preprocessBinary(binary) {
    return binary.replace(/[^01]/g, "");
  }
  isAllOnes(binary) {
    return /^1+$/.test(binary);
  }
}
module.exports = BinaryModel;
