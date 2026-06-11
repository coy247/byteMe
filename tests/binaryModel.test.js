const { expect } = require("chai");
const BinaryModel = require("../src/models/BinaryModel");

describe("BinaryModel", () => {
  describe("validate()", () => {
    it("accepts a string of only 0s and 1s", () => {
      expect(new BinaryModel("10110").validate()).to.equal(true);
    });

    it("rejects strings containing non-binary characters", () => {
      expect(new BinaryModel("10210").validate()).to.equal(false);
      expect(new BinaryModel("hello").validate()).to.equal(false);
      expect(new BinaryModel("1011 0").validate()).to.equal(false);
    });

    it("rejects the empty string", () => {
      expect(new BinaryModel("").validate()).to.equal(false);
    });
  });

  describe("analyze()", () => {
    it("counts ones, zeros, length and ratio for a mixed string", () => {
      const result = new BinaryModel("110100").analyze();
      expect(result).to.deep.equal({
        length: 6,
        ones: 3,
        zeros: 3,
        ratio: 1,
      });
    });

    it("returns ratio 0 for an all-zeros string (guards division by zero)", () => {
      const result = new BinaryModel("0000").analyze();
      expect(result.ones).to.equal(0);
      expect(result.zeros).to.equal(4);
      expect(result.ratio).to.equal(0);
    });

    it("handles an all-ones string (Infinity ratio is the current contract)", () => {
      const result = new BinaryModel("1111").analyze();
      expect(result.ones).to.equal(4);
      expect(result.zeros).to.equal(0);
      // ones / 0 === Infinity, and `Infinity || 0` keeps Infinity.
      // Documented here so a future fix is a conscious contract change.
      expect(result.ratio).to.equal(Infinity);
    });

    it("returns null for invalid input instead of throwing", () => {
      expect(new BinaryModel("12345").analyze()).to.equal(null);
    });
  });

  describe("getBinary()", () => {
    it("returns the exact string it was constructed with", () => {
      expect(new BinaryModel("0101").getBinary()).to.equal("0101");
    });
  });
});
