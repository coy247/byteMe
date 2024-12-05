class BinaryModel {
  constructor(binary) {
    this.binary = binary;
  }
  getBinary() {
    return this.binary;
  }
  validate() {
    return /^[01]+$/.test(this.binary);
  }
}
module.exports = BinaryModel;
