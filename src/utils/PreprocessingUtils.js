function preprocessBinary(binary) {
  return binary.replace(/[^01]/g, "");
}
function convertToBinary(input) {
  if (/^[01]+$/.test(input)) {
    return input;
  }
  return input
    .split("")
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
    .join("");
}
function revertFromBinary(binary, originalInput) {
  if (/^[01]+$/.test(originalInput)) {
    return binary;
  }
  return binary
    .match(/.{1,8}/g)
    .map((byte) => String.fromCharCode(parseInt(byte, 2)))
    .join("");
}
module.exports = {
  preprocessBinary,
  convertToBinary,
  revertFromBinary,
};
