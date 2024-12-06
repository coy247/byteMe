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

  analyze() {
    if (!this.validate()) {
      return null;
    }
    const ones = (this.binary.match(/1/g) || []).length;
    const zeros = (this.binary.match(/0/g) || []).length;
    return {
      length: this.binary.length,
      ones,
      zeros,
      ratio: ones / zeros || 0,
    };
  }
}

module.exports = BinaryModel;
